/**
 * Parser for CJK-language Taiwan driving test PDFs.
 *
 * These PDFs use a compact table layout. Two variants exist:
 *
 * Variant A — number+answer on same line (Chinese, Thai):
 *   "001 1"  or  "001O"  or  "001X"  or  "0011"
 *   Next lines: question text / options
 *
 * Variant B — number and answer on separate lines (Japanese, Vietnamese,
 *             Indonesian, Burmese, Cambodian):
 *   "001"
 *   "O"  (or "X" or "1"–"9")
 *   Next lines: question text / options
 *
 * Multiple-choice options use fullwidth markers: （１）（２）（３）
 * True/false answers: O = True, X = False
 */

const FW = { "１": "1", "２": "2", "３": "3", "４": "4", "５": "5" };

/**
 * Split a string on fullwidth option markers （１）（２）（３）
 */
export function splitFullwidthOptions(str) {
  const norm = str.replace(/（([１２３４５])）/g, (_, d) => `\x00${FW[d]}`);
  const parts = norm.split(/(?=\x00[1-5])/);
  const options = [];
  for (const part of parts) {
    const m = part.match(/^\x00([1-5])([\s\S]+)/);
    if (m) {
      options.push({
        label: m[1],
        text: m[2].replace(/。\s*$/, "").trim(),
      });
    }
  }
  return options;
}

/**
 * Split a string on halfwidth option markers (1)(2)(3)
 * Also handles mixed parentheses like (1） or （1) and fullwidth digits (１)
 * and Khmer digits (១)(២)(៣) and Myanmar digits (၁)(၂)(၃)
 */
export function splitHalfwidthOptions(str) {
  // Normalize fullwidth digits in parens: (１) → (1)
  const FW_DIGITS = {
    "\uFF11": "1",
    "\uFF12": "2",
    "\uFF13": "3",
    "\uFF14": "4",
    "\uFF15": "5",
  };
  // Normalize Khmer digits in parens: (១) → (1)
  const KH_DIGITS = {
    "\u17E1": "1",
    "\u17E2": "2",
    "\u17E3": "3",
    "\u17E4": "4",
    "\u17E5": "5",
  };
  // Normalize Myanmar digits in parens: (၁) → (1)
  const MY_DIGITS = {
    "\u1041": "1",
    "\u1042": "2",
    "\u1043": "3",
    "\u1044": "4",
    "\u1045": "5",
  };
  const normalized = str
    .replace(/\(([\uFF11-\uFF15])\)/g, (_, d) => `(${FW_DIGITS[d]})`)
    .replace(/（([\uFF11-\uFF15])\)/g, (_, d) => `(${FW_DIGITS[d]})`)
    .replace(/\(([\uFF11-\uFF15])）/g, (_, d) => `(${FW_DIGITS[d]})`)
    .replace(/\(([\u17E1-\u17E5])\)/g, (_, d) => `(${KH_DIGITS[d]})`)
    .replace(/\(([\u1041-\u1045])\)/g, (_, d) => `(${MY_DIGITS[d]})`)
    .replace(/\(([1-5])）/g, "($1)")
    .replace(/（([1-5])\)/g, "($1)")
    .replace(/（([1-5])）/g, "($1)");
  const parts = normalized.split(/(?=\([1-5]\))/);
  const options = [];
  for (const part of parts) {
    const m = part.match(/^\(([1-5])\)\s*([\s\S]+)/);
    if (m) {
      options.push({
        label: m[1],
        text: m[2].replace(/[。.]\s*$/, "").trim(),
      });
    }
  }
  return options;
}

const HEADER_SKIP = [
  /^汽車標誌、標線、號誌/,
  /^汽車法規/,
  /^汽車標誌/,
  /^第\s*\d+\s*頁[\/／]共\s*\d+\s*頁/,
  /^題號\s*答案/,
  /^題番号\s*解答/,
  /^題番\s*$/,
  /^号\s*$/,
  /^解答\s/,
  /^問\s+題/,
  /^分類編/,
  /^分類項目/,
  /^分類番号/,
  /^\d{2}\s{2}/,
  /^【/,
  /^\([^1-5\u17E1-\u17E5\u1041-\u1045(]/, // lines like "(印尼文)" but NOT option lines like "(1) ..." or "(១) ..." or "(၁) ..." or "((1)..."
  /^Road Signs/,
  /^Car regulations/,
  /^Illustrations/,
  /^Question\s/,
  /^Answer\s/,
  /^自動車の標識/,
  /^自動車の法規/,
  /^自動車の道路/,
];

function isHeader(line) {
  return HEADER_SKIP.some((re) => re.test(line));
}

/**
 * Pre-strip page headers from raw PDF text before line-by-line parsing.
 * Handles two patterns:
 *   3-line: "汽車..." + non-question line + bare page number
 *   2-line: "汽車..." + bare page number
 * Also strips column headers like "題號  答案  題   目"
 */
export function stripPageHeaders(text) {
  const lines = text.split("\n").map((l) => l.trim());
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    // Column header row
    if (/^題號\s+答案/.test(l) || /^題番号\s+解答/.test(l)) continue;
    // 3-line header: 汽車... + any non-question line + bare page number
    if (
      /^汽車/.test(l) &&
      i + 2 < lines.length &&
      !/^\d{3,}/.test(lines[i + 1]) &&
      /^\d{1,3}$/.test(lines[i + 2])
    ) {
      i += 2;
      continue;
    }
    // 2-line header: 汽車... + bare page number
    if (
      /^汽車/.test(l) &&
      i + 1 < lines.length &&
      /^\d{1,3}$/.test(lines[i + 1])
    ) {
      i += 1;
      continue;
    }
    out.push(l);
  }
  return out.join("\n");
}

// A bare single-digit or single O/X line (stray page numbers, answer markers)
function isBareAnswerOrPage(line) {
  return /^[1-9OX]$/.test(line) || /^\d{1,2}$/.test(line);
}

/**
 * Parse signs-format PDFs (true-false or multiple-choice with fullwidth options).
 * Handles both Variant A (merged) and Variant B (split) line formats.
 */
export function parseTableFormat(text, type, format) {
  const questions = [];
  const lines = stripPageHeaders(text)
    .split("\n")
    .map((l) => l.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // --- Variant A: number+answer on same line ---
    // "001 1"  "001 O"  "001O"  "001X"  "0011"  "001 ○"
    const mA =
      line.match(/^(\d{3,})\s+([1-9OX○])\s*$/) ||
      line.match(/^(\d{3,})([OX○])$/) ||
      line.match(/^(\d{3,})([1-9])$/);

    // --- Variant B: bare question number, answer on next non-blank line ---
    const mB = !mA && line.match(/^(\d{3,})$/);

    if (!mA && !mB) {
      i++;
      continue;
    }

    let questionNum, rawAnswer;

    if (mA) {
      questionNum = mA[1];
      rawAnswer = mA[2];
      i++;
    } else {
      // Variant B: look ahead for the answer
      questionNum = mB[1];
      i++;
      // Skip blank/header lines to find the answer
      while (i < lines.length && (!lines[i] || isHeader(lines[i]))) i++;
      if (i >= lines.length) break;
      const nextLine = lines[i];
      if (/^[1-9OX○]$/.test(nextLine)) {
        rawAnswer = nextLine;
        i++;
      } else {
        // No answer found — not a question line, skip
        continue;
      }
    }

    // Collect content lines until next question
    const contentLines = [];
    while (i < lines.length) {
      const cl = lines[i];
      // Stop at next question (Variant A or B)
      if (
        cl.match(/^(\d{3,})\s+([1-9OX○])\s*$/) ||
        cl.match(/^(\d{3,})([OX○])$/) ||
        cl.match(/^(\d{3,})([1-9])$/) ||
        cl.match(/^(\d{3,})$/)
      )
        break;
      if (!cl || isHeader(cl) || isBareAnswerOrPage(cl)) {
        i++;
        continue;
      }
      contentLines.push(cl);
      i++;
      if (format === "true-false" && contentLines.length >= 4) break;
    }

    const contentText = contentLines.join(" ").trim();
    if (!contentText) continue;

    const question = {
      id: `${type}-${format}-${questionNum}`,
      number: parseInt(questionNum),
      type,
      format,
      question: "",
      options: [],
      answer: null,
      image: null,
    };

    if (format === "true-false") {
      question.question = contentText;
      question.options = [
        { label: "True", text: "True" },
        { label: "False", text: "False" },
      ];
      question.answer =
        rawAnswer === "O" || rawAnswer === "○" ? "True" : "False";
      questions.push(question);
    } else {
      // Try fullwidth （１）（２）（３） first, fall back to halfwidth (1)(2)(3)
      let opts = splitFullwidthOptions(contentText);
      let questionText = contentText;
      if (opts.length < 2) {
        opts = splitHalfwidthOptions(contentText);
        // For halfwidth, question text is everything before the first (1)
        if (opts.length >= 2) {
          questionText = contentText.split("(1)")[0].trim() || contentText;
        }
      }
      if (opts.length < 2) continue;
      question.question = questionText;
      question.options = opts;
      question.answer = rawAnswer;
      questions.push(question);
    }
  }

  return questions;
}

const UNNUMBERED_SKIP = [
  /^汽車法規選擇題/,
  /^汽車標誌/,
  /^第\s*\d+\s*頁[\/／]共\s*\d+\s*頁/,
  /^【/,
  /^\d{1,2}$/, // bare page numbers
];

function isUnnumberedSkip(line) {
  return UNNUMBERED_SKIP.some((re) => re.test(line));
}

/**
 * Parse unnumbered regulations MC PDFs (e.g. Thai) where questions have no
 * numeric IDs. Each question is a block of text ending with (1)...(2)...(3)...
 * We reconstruct questions by accumulating lines until we see a (1) marker,
 * then split on (1)/(2)/(3) to extract options.
 */
export function parseUnnumberedMC(text, type, langCode) {
  const questions = [];
  const lines = text.split("\n").map((l) => l.trim());

  // Reconstruct paragraphs: join continuation lines, split on question boundaries.
  // A question boundary is a line that starts a new question (contains Thai/foreign
  // text but NOT starting with (1)/(2)/(3)) after we've already collected options.
  const paragraphs = [];
  let current = "";

  for (const line of lines) {
    if (!line || isUnnumberedSkip(line)) continue;
    // Append to current paragraph
    current = current ? current + " " + line : line;
    // If current paragraph contains at least (1) and (3), it's likely complete
    if (/\(1\)/.test(current) && /\(3\)/.test(current)) {
      paragraphs.push(current.trim());
      current = "";
    }
  }
  if (current.trim()) paragraphs.push(current.trim());

  let seq = 1;
  for (const para of paragraphs) {
    // Must contain (1) to be a valid MC question
    if (!/\(1\)/.test(para)) continue;

    const opts = splitHalfwidthOptions(para);
    if (opts.length < 2) continue;

    // Question text is everything before the first (1)
    const questionText = para.split("(1)")[0].trim();
    if (!questionText) continue;

    // We don't have answer keys for this format — skip answer
    const num = String(seq).padStart(3, "0");
    questions.push({
      id: `${type}-multiple-choice-${num}`,
      number: seq,
      type,
      format: "multiple-choice",
      question: questionText,
      options: opts,
      answer: null,
      image: null,
    });
    seq++;
  }

  return questions;
}
