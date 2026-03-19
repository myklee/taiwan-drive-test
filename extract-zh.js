import fs from "fs";
import pdf from "pdf-parse";
import {
  parseTableFormat,
  splitFullwidthOptions,
  splitHalfwidthOptions,
} from "./parse-cjk-pdf.js";

const pdfFiles = [
  {
    path: "res/汽車標誌是非題-中文+1131106.pdf",
    type: "signs",
    format: "true-false",
    tableFormat: true, // compact table layout
  },
  {
    path: "res/汽車標誌選擇題-中文1131106.pdf",
    type: "signs",
    format: "multiple-choice",
    tableFormat: true, // fullwidth （１）（２）（３） options
  },
  {
    path: "res/汽車法規是非題-中文1131114.pdf",
    type: "regulations",
    format: "true-false",
    tableFormat: false, // standard layout, handled by existing parser
  },
  {
    path: "res/汽車法規選擇題-中文1131114.pdf",
    type: "regulations",
    format: "multiple-choice",
    tableFormat: false, // halfwidth (1)(2)(3) options
  },
];

async function extractQuestionsFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function extractEmbeddedOptions(questionText) {
  // Try fullwidth （１）（２）（３） first
  let opts = splitFullwidthOptions(questionText);
  if (opts.length >= 2) {
    return {
      cleanQuestion: questionText.split("（１）")[0].trim(),
      options: opts,
    };
  }
  // Fall back to halfwidth (1)(2)(3)
  opts = splitHalfwidthOptions(questionText);
  const cleanQuestion =
    opts.length >= 2 ? questionText.split("(1)")[0].trim() : questionText;
  return { cleanQuestion, options: opts };
}

async function parseQuestions(text, type, format) {
  const questions = [];

  const cleanedText = text
    .replace(/汽車法規.*?【中文版】\s*\d+/g, "")
    .replace(/汽車標誌.*?【中文版】\s*\d+/g, "")
    .replace(/Road Signs.*?【中文版】\s*\d+/g, "");

  const cleanedLines = cleanedText.split("\n").map((l) => l.trim());

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
      // Inline format: "001  ○  question text  category"
      let inlineText = questionMatch[3]
        ? questionMatch[3].replace(/\s+\d{2}\s*$/, "").trim()
        : null;

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
        }
      }

      let questionText = inlineText || "";
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
          currentLine.match(
            /^汽車法規選擇題|^汽車標誌選擇題|^汽車法規是非題|^汽車標誌是非題/,
          )
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
        // Use inline text if available (e.g. "001  ○  question text  category")
        if (inlineText) {
          questionText = inlineText;
        } else {
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
              currentLine.match(
                /^汽車法規選擇題|^汽車標誌選擇題|^汽車法規是非題|^汽車標誌是非題/,
              )
            ) {
              continue;
            }
            questionText = currentLine;
            break;
          }
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
              questionText.includes("（1）") ||
              questionText.includes("(1）") ||
              questionText.includes("（1)"))
          ) {
            const { cleanQuestion, options: embeddedOptions } =
              extractEmbeddedOptions(questionText);
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

async function applyImageMapping(questions) {
  const enBank = JSON.parse(
    fs.readFileSync("public/questions/en.json", "utf8"),
  );
  const imageMap = Object.fromEntries(enBank.map((q) => [q.id, q.image]));
  return questions.map((q) => ({ ...q, image: imageMap[q.id] ?? null }));
}

async function main() {
  const allQuestions = [];

  for (const file of pdfFiles) {
    console.log(`Processing ${file.path}...`);
    try {
      const text = await extractQuestionsFromPDF(file.path);
      let questions;
      if (file.tableFormat) {
        questions = parseTableFormat(text, file.type, file.format);
      } else {
        questions = await parseQuestions(text, file.type, file.format);
      }
      allQuestions.push(...questions);
      console.log(`  Extracted ${questions.length} questions`);
    } catch (error) {
      console.error(`Error processing ${file.path}:`, error.message);
    }
  }

  const questionsWithImages = await applyImageMapping(allQuestions);

  fs.writeFileSync(
    "public/questions/zh.json",
    JSON.stringify(questionsWithImages, null, 2),
  );
  console.log(`\nTotal questions extracted: ${questionsWithImages.length}`);
  console.log("Saved to public/questions/zh.json");
}

main();
