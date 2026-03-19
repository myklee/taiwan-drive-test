import fs from "fs";
import pdf from "pdf-parse";
import {
  parseTableFormat,
  parseUnnumberedMC,
  stripPageHeaders,
  splitFullwidthOptions,
  splitHalfwidthOptions,
} from "./parse-cjk-pdf.js";

// Language configurations
// tableFormat: true  → signs PDFs use compact table with fullwidth （１）（２）（３）
// tableFormat: false → regulations PDFs use halfwidth (1)(2)(3), handled by existing parser
const LANGUAGES = [
  {
    code: "ja",
    name: "Japanese",
    headerPatterns: [
      /自動車の標識.*?【日本語】\s*\d*/g,
      /自動車の法規.*?【日本語】\s*\d*/g,
    ],
    skipLinePattern:
      /^自動車の法規選択問題|^自動車法規の正誤問題|^自動車の標識/,
    pdfFiles: [
      {
        path: "res/汽車標誌是非題-日文1131106.pdf",
        type: "signs",
        format: "true-false",
        tableFormat: true,
      },
      {
        path: "res/汽車標誌選擇題-日文1131106.pdf",
        type: "signs",
        format: "multiple-choice",
        tableFormat: true,
      },
      {
        path: "res/汽車法規是非題-日文1130319.pdf",
        type: "regulations",
        format: "true-false",
        tableFormat: false,
      },
      {
        path: "res/汽車法規選擇題-日文1130815.pdf",
        type: "regulations",
        format: "multiple-choice",
        tableFormat: false,
      },
    ],
  },
  {
    code: "vi",
    name: "Vietnamese",
    headerPatterns: [
      /汽車法規.*?【越南文版】\s*\d+/g,
      /汽車標誌.*?【越南文版】\s*\d+/g,
    ],
    skipLinePattern: /^汽車|^道路|^交通/,
    pdfFiles: [
      {
        path: "res/汽車標誌是非題-越南文1131106.pdf",
        type: "signs",
        format: "true-false",
        tableFormat: true,
      },
      {
        path: "res/汽車標誌選擇題-越南文-1131106.pdf",
        type: "signs",
        format: "multiple-choice",
        tableFormat: true,
      },
      {
        path: "res/汽車法規是非題-越南文+1131106.pdf",
        type: "regulations",
        format: "true-false",
        tableFormat: false,
      },
      {
        path: "res/汽車法規選擇題-越南文1130718.pdf",
        type: "regulations",
        format: "multiple-choice",
        tableFormat: false,
      },
    ],
  },
  {
    code: "id",
    name: "Indonesian",
    headerPatterns: [
      /汽車法規.*?【印尼文版】\s*\d+/g,
      /汽車標誌.*?【印尼文版】\s*\d+/g,
    ],
    skipLinePattern: /^汽車|^道路|^交通/,
    pdfFiles: [
      {
        path: "res/汽車標誌是非題-印尼文1131106.pdf",
        type: "signs",
        format: "true-false",
        tableFormat: true,
      },
      {
        path: "res/汽車標誌選擇題-印尼文1131106.pdf",
        type: "signs",
        format: "multiple-choice",
        tableFormat: true,
      },
      {
        path: "res/汽車法規是非題-印尼文-1130731.pdf",
        type: "regulations",
        format: "true-false",
        tableFormat: false,
      },
      {
        path: "res/汽車法規選擇題-印尼文-1131017.pdf",
        type: "regulations",
        format: "multiple-choice",
        tableFormat: false,
      },
    ],
  },
  {
    code: "th",
    name: "Thai",
    headerPatterns: [
      /汽車法規.*?【泰文版】\s*\d+/g,
      /汽車標誌.*?【泰文版】\s*\d+/g,
    ],
    skipLinePattern: /^汽車|^道路|^交通/,
    pdfFiles: [
      {
        path: "res/汽車標誌是非題-泰文1131106.pdf",
        type: "signs",
        format: "true-false",
        tableFormat: true,
      },
      {
        path: "res/汽車標誌選擇題-泰文1131106.pdf",
        type: "signs",
        format: "multiple-choice",
        tableFormat: true,
      },
      {
        path: "res/汽車法規是非題-泰文1130320.pdf",
        type: "regulations",
        format: "true-false",
        tableFormat: false,
      },
      {
        path: "res/汽車法規選擇題-泰文1130815.pdf",
        type: "regulations",
        format: "multiple-choice",
        tableFormat: false,
        unnumbered: true,
      },
    ],
  },
  {
    code: "my",
    name: "Burmese",
    headerPatterns: [
      /汽車法規.*?【緬[甸文]*版】\s*\d+/g,
      /汽車標誌.*?【緬[甸文]*版】\s*\d+/g,
    ],
    skipLinePattern: /^汽車|^道路|^交通/,
    pdfFiles: [
      {
        path: "res/汽車標誌是非題-緬甸文-1131106.pdf",
        type: "signs",
        format: "true-false",
        tableFormat: true,
      },
      {
        path: "res/汽車標誌選擇題-緬甸文-1131106.pdf",
        type: "signs",
        format: "multiple-choice",
        tableFormat: true,
      },
      {
        path: "res/汽車法規是非題-緬文1120824.pdf",
        type: "regulations",
        format: "true-false",
        tableFormat: false,
      },
      {
        path: "res/汽車法規選擇題-緬文1130815.pdf",
        type: "regulations",
        format: "multiple-choice",
        tableFormat: true, // Variant A: "001  3" format
      },
    ],
  },
  {
    code: "km",
    name: "Cambodian",
    headerPatterns: [
      /汽車法規.*?【柬文版】\s*\d+/g,
      /汽車標誌.*?【柬文版】\s*\d+/g,
    ],
    skipLinePattern: /^汽車|^道路|^交通/,
    pdfFiles: [
      {
        path: "res/汽車標誌是非題-柬文1131106.pdf",
        type: "signs",
        format: "true-false",
        tableFormat: true,
      },
      {
        path: "res/汽車標誌選擇題-柬文1131106.pdf",
        type: "signs",
        format: "multiple-choice",
        tableFormat: true,
      },
      {
        path: "res/汽車法規是非題-柬文1130320.pdf",
        type: "regulations",
        format: "true-false",
        tableFormat: false,
      },
      {
        path: "res/汽車法規選擇題-柬文1130815.pdf",
        type: "regulations",
        format: "multiple-choice",
        tableFormat: true, // Variant A: "001  3" format
      },
    ],
  },
];

async function extractQuestionsFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function extractEmbeddedOptions(questionText, headerPatterns) {
  // Normalize mixed parentheses before processing
  const normalized = questionText
    .replace(/\(([1-5])）/g, "($1)")
    .replace(/（([1-5])\)/g, "($1)");
  // Try fullwidth （１）（２）（３） first
  let opts = splitFullwidthOptions(normalized);
  if (opts.length >= 2) {
    return {
      cleanQuestion: normalized.split("（１）")[0].trim(),
      options: opts,
    };
  }
  // Fall back to halfwidth (1)(2)(3)
  opts = splitHalfwidthOptions(normalized);
  if (opts.length >= 2) {
    return {
      cleanQuestion: normalized.split("(1)")[0].trim(),
      options: opts,
    };
  }
  return { cleanQuestion: questionText, options: [] };
}

async function parseStandardFormat(text, type, format, langConfig) {
  const questions = [];
  const { headerPatterns, skipLinePattern } = langConfig;

  let cleanedText = text;
  for (const pattern of headerPatterns) {
    cleanedText = cleanedText.replace(pattern, "");
  }

  // Strip page headers (汽車... + optional lang line + page number)
  const cleanedLines = stripPageHeaders(cleanedText)
    .split("\n")
    .map((l) => l.trim());

  for (let i = 0; i < cleanedLines.length; i++) {
    const line = cleanedLines[i];
    const questionMatch =
      line.match(/^(\d{3,})\s+(\d+|[OX○]|[A-D])\s*$/) ||
      line.match(/^(\d{3,})\s+([OX○])\s+(.+)$/) ||
      line.match(/^(\d{3,})\s+(\d+)\s+(.+)$/) ||
      line.match(/^(\d{3,})\s*$/);

    if (questionMatch) {
      const questionNum = questionMatch[1];
      let answer = questionMatch[2];
      let startIdx = i + 1;
      const inlineText = questionMatch[3]
        ? questionMatch[3].replace(/\s+\d{2}\s*$/, "").trim()
        : null;

      let inlineAnswerText = null;
      if (!answer) {
        for (let k = i + 1; k < Math.min(i + 5, cleanedLines.length); k++) {
          if (
            cleanedLines[k] &&
            cleanedLines[k].match(/^[OX○123456789ABCD]$/)
          ) {
            answer = cleanedLines[k];
            startIdx = k + 1;
            break;
          }
          // Also handle "O question text" or "X question text" on same line
          const inlineAnswerMatch =
            cleanedLines[k] && cleanedLines[k].match(/^([OX○1-9])\s+(.+)/);
          if (inlineAnswerMatch) {
            answer = inlineAnswerMatch[1];
            inlineAnswerText = inlineAnswerMatch[2]
              .replace(/\s+\d{2}\s*$/, "")
              .trim();
            startIdx = k + 1;
            break;
          }
        }
      }

      let questionText = inlineText || inlineAnswerText || "";
      let j = startIdx;
      const options = [];

      while (j < cleanedLines.length) {
        const currentLine = cleanedLines[j];
        if (
          currentLine.match(/^\d{3,}(\s+(\d+|[OX○]|[A-D]))?\s*$/) ||
          currentLine.match(/^\d{3,}\s+[OX○]\s+.+$/) ||
          currentLine.match(/^\d{3,}\s+\d+\s+.+$/)
        )
          break;
        if (
          !currentLine ||
          currentLine === "Illustrations" ||
          currentLine.match(
            /^Question\s|^Answer\s|^Road Signs\s|^Road Markings\s|^Car regulations\s/,
          ) ||
          (skipLinePattern && currentLine.match(skipLinePattern))
        ) {
          j++;
          continue;
        }

        const optionMatch = currentLine.match(/^\(([A-D])\)\s*(.+)/);
        if (optionMatch && format === "multiple-choice") {
          options.push({ label: optionMatch[1], text: optionMatch[2] });
          j++;
          continue;
        }

        questionText += (questionText ? " " : "") + currentLine;
        j++;

        if (format === "true-false" && questionText && j - startIdx > 5) break;
      }

      if (format === "true-false" && !questionText && answer) {
        for (
          let k = startIdx;
          k < Math.min(startIdx + 10, cleanedLines.length);
          k++
        ) {
          const currentLine = cleanedLines[k].trim();
          if (currentLine.match(/^\d{3,}$/)) break;
          if (
            !currentLine ||
            currentLine.match(/^[OX○]$/) ||
            currentLine === "Illustrations" ||
            currentLine.match(
              /^Question\s|^Answer\s|^Road Signs\s|^Road Markings\s|^Car regulations\s/,
            ) ||
            (skipLinePattern && currentLine.match(skipLinePattern))
          ) {
            continue;
          }
          questionText = currentLine;
          break;
        }
      }

      if (questionText && answer) {
        const question = {
          id: `${type}-${format}-${questionNum}`,
          number: parseInt(questionNum),
          type,
          format,
          question: questionText.trim(),
          options: [],
          answer: null,
          image: null,
        };

        if (format === "true-false") {
          question.options = [
            { label: "True", text: "True" },
            { label: "False", text: "False" },
          ];
          question.answer = answer === "O" || answer === "○" ? "True" : "False";
        } else {
          if (
            options.length === 0 &&
            (questionText.includes("(1)") ||
              questionText.includes("（１）") ||
              questionText.includes("(1）") ||
              questionText.includes("（1)") ||
              questionText.includes("（1）") ||
              /\([\uFF11-\uFF15]\)/.test(questionText) ||
              /\([\u17E1-\u17E5]\)/.test(questionText) ||
              /\([\u1041-\u1045]\)/.test(questionText))
          ) {
            const { cleanQuestion, options: embeddedOptions } =
              extractEmbeddedOptions(questionText, headerPatterns);
            question.question = cleanQuestion;
            question.options = embeddedOptions;
          } else {
            question.options = options;
          }
          question.answer = answer;
        }

        if (question.options.length > 0) {
          questions.push(question);
        }
      }
    }
  }

  return questions;
}

function applyImageMapping(questions, enBank) {
  const imageMap = Object.fromEntries(enBank.map((q) => [q.id, q.image]));
  return questions.map((q) => ({ ...q, image: imageMap[q.id] ?? null }));
}

async function extractLanguage(langConfig, enBank) {
  console.log(`\n=== Processing ${langConfig.name} (${langConfig.code}) ===`);
  const allQuestions = [];

  for (const file of langConfig.pdfFiles) {
    console.log(`  Processing ${file.path}...`);
    try {
      const text = await extractQuestionsFromPDF(file.path);
      let questions;
      if (file.tableFormat) {
        questions = parseTableFormat(text, file.type, file.format);
      } else if (file.unnumbered) {
        questions = parseUnnumberedMC(text, file.type, langConfig.code);
      } else {
        questions = await parseStandardFormat(
          text,
          file.type,
          file.format,
          langConfig,
        );
      }
      allQuestions.push(...questions);
      console.log(`    Extracted ${questions.length} questions`);
    } catch (error) {
      console.error(`    Error: ${error.message}`);
    }
  }

  const withImages = applyImageMapping(allQuestions, enBank);
  const outPath = `public/questions/${langConfig.code}.json`;
  fs.writeFileSync(outPath, JSON.stringify(withImages, null, 2));
  console.log(`  Total: ${withImages.length} questions → ${outPath}`);
  return withImages.length;
}

async function main() {
  const enBankPath = "public/questions/en.json";
  if (!fs.existsSync(enBankPath)) {
    console.error(
      "Error: public/questions/en.json not found. Run extract:en first.",
    );
    process.exit(1);
  }
  const enBank = JSON.parse(fs.readFileSync(enBankPath, "utf8"));
  console.log(`Loaded ${enBank.length} English questions for image mapping.`);

  let total = 0;
  for (const lang of LANGUAGES) {
    const count = await extractLanguage(lang, enBank);
    total += count;
  }

  console.log(
    `\n✓ Done. Generated ${LANGUAGES.length} language files, ${total} total questions.`,
  );
}

main();
