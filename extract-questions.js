import fs from "fs";
import pdf from "pdf-parse";

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

async function extractQuestionsFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

function extractEmbeddedOptions(questionText) {
  // Split on (1), (2), (3) markers - handles option text containing parentheses
  const parts = questionText.split(/(?=\(\d\))/);
  const options = [];
  let cleanQuestion = parts[0].trim();

  for (let i = 1; i < parts.length; i++) {
    const match = parts[i].match(/^\((\d)\)\s*([\s\S]+)/);
    if (match) {
      // Strip page header artifacts from option text
      const text = match[2]
        .replace(
          /Car regulations\s*\(Multiple Choice Questions Bank\)\s*【English version】\s*\d+/g,
          "",
        )
        .replace(/Road Signs.*?【English version】\s*\d+/g, "")
        .trim();
      options.push({ label: match[1], text });
    }
  }

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
      let answer = questionMatch[2];
      let startIdx = i + 1;

      // If answer not on same line, find it on next non-empty line
      if (!answer) {
        for (let k = i + 1; k < Math.min(i + 5, lines.length); k++) {
          if (lines[k] && lines[k].match(/^[OX123456789ABCD]$/)) {
            answer = lines[k];
            startIdx = k + 1;
            break;
          }
        }
      }

      let questionText = "";
      let j = startIdx;
      const options = [];

      while (j < lines.length) {
        const currentLine = lines[j];
        // Stop if we hit the next question number (with or without answer on same line)
        if (currentLine.match(/^\d{3,}(\s+(\d+|[OX]|[A-D]))?\s*$/)) break;
        if (
          !currentLine ||
          currentLine === "Illustrations" ||
          currentLine.match(
            /^Question\s|^Answer\s|^Road Signs\s|^Road Markings\s|^Car regulations\s/,
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

      // For true-false questions, if no question text found, check if text appears after answer
      if (format === "true-false" && !questionText && answer) {
        // Skip empty lines and look for the first non-empty, non-header line
        for (let k = startIdx; k < Math.min(startIdx + 10, lines.length); k++) {
          const currentLine = lines[k].trim();
          // Stop if we hit the next question number
          if (currentLine.match(/^\d{3,}$/)) break;
          // Skip empty lines, answer markers, and headers
          if (
            !currentLine ||
            currentLine.match(/^[OX]$/) ||
            currentLine === "Illustrations" ||
            currentLine.match(
              /^Question\s|^Answer\s|^Road Signs\s|^Road Markings\s|^Car regulations\s/,
            )
          ) {
            continue;
          }
          // Found the question text
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

  fs.writeFileSync("questions.json", JSON.stringify(allQuestions, null, 2));
  console.log(`\nTotal questions extracted: ${allQuestions.length}`);
  console.log("Saved to questions.json");
}

main();
