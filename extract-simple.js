import fs from "fs";
import pdf from "pdf-parse";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const pdfFiles = [
  {
    path: "res/汽車標誌是非題-英文1131106.pdf",
    type: "signs",
    format: "true-false",
  },
  {
    path: "res/汽車標誌選擇題-英文1131106.pdf",
    type: "signs",
    format: "multiple-choice",
  },
  {
    path: "res/汽車法規是非題-英文1130711.pdf",
    type: "regulations",
    format: "true-false",
  },
  {
    path: "res/汽車法規選擇題-英文1130815.pdf",
    type: "regulations",
    format: "multiple-choice",
  },
];

// Create images directory
if (!fs.existsSync("public")) fs.mkdirSync("public");
if (!fs.existsSync("public/images")) fs.mkdirSync("public/images");

async function extractQuestionsFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function extractEmbeddedOptions(questionText) {
  const regex = /\((\d)\)\s*([^(]+?)(?=\s*\(\d\)|$)/g;
  const options = [];
  let match;

  while ((match = regex.exec(questionText)) !== null) {
    options.push({
      label: match[1],
      text: match[2].trim(),
    });
  }

  const cleanQuestion = questionText.split(/\(\d\)/)[0].trim();
  return { cleanQuestion, options };
}

async function parseQuestions(text, type, format) {
  const questions = [];
  const lines = text.split("\n").map((l) => l.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const questionMatch =
      line.match(/^(\d{3,})\s+(\d+|[OX]|[A-D])\s*$/) ||
      line.match(/^(\d{3,})\s*$/);

    if (questionMatch) {
      const questionNum = questionMatch[1];
      const answer =
        questionMatch[2] || (i + 1 < lines.length ? lines[i + 1] : null);
      const startIdx = questionMatch[2] ? i + 1 : i + 2;

      let questionText = "";
      let j = startIdx;
      const options = [];

      while (j < lines.length) {
        const currentLine = lines[j];
        if (currentLine.match(/^\d{3,}(\s+\d+)?\s*$/)) break;
        if (
          !currentLine ||
          currentLine === "Illustrations" ||
          currentLine.match(
            /^Question|^Answer|Road Signs|Road Markings|Traffic|Car regulations/,
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
        if (
          format === "multiple-choice" &&
          (options.length === 4 ||
            (questionText.length > 100 && j - startIdx > 10))
        )
          break;
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
          pdfPath: null, // We'll store the PDF path for client-side rendering
        };

        // For signs, include PDF path so we can render it client-side
        if (type === "signs") {
          question.pdfPath = `res/${type}-${format}.pdf`;
          question.pageHint = Math.ceil(parseInt(questionNum) / 10); // Rough estimate
        }

        if (format === "true-false") {
          question.options = [
            { label: "True", text: "True" },
            { label: "False", text: "False" },
          ];
          question.answer = answer === "O" ? "True" : "False";
        } else {
          if (options.length === 0 && questionText.includes("(1)")) {
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

async function main() {
  const allQuestions = [];

  for (const file of pdfFiles) {
    console.log(`Processing ${file.path}...`);
    try {
      const text = await extractQuestionsFromPDF(file.path);
      const questions = await parseQuestions(text, file.type, file.format);
      allQuestions.push(...questions);
      console.log(`  Extracted ${questions.length} questions`);
    } catch (error) {
      console.error(`Error processing ${file.path}:`, error.message);
    }
  }

  // Copy PDF files to public for client access
  for (const file of pdfFiles) {
    if (file.type === "signs") {
      const destPath = `public/res/${file.type}-${file.format}.pdf`;
      if (!fs.existsSync("public/res"))
        fs.mkdirSync("public/res", { recursive: true });
      fs.copyFileSync(file.path, destPath);
    }
  }

  fs.writeFileSync("questions.json", JSON.stringify(allQuestions, null, 2));
  console.log(`\nTotal questions extracted: ${allQuestions.length}`);
  console.log("Saved to questions.json");
  console.log("Copied sign PDFs to public/res/");
}

main();
