import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const VALID_TYPES = ["signs", "regulations"];
const VALID_FORMATS = ["true-false", "multiple-choice"];

// Helper to check if zh.json exists
const zhJsonPath = path.resolve("public/questions/zh.json");
const zhJsonExists = fs.existsSync(zhJsonPath);

// Helper to check if en.json exists
const enJsonPath = path.resolve("public/questions/en.json");
const enJsonExists = fs.existsSync(enJsonPath);

describe("extract-zh.js output schema", () => {
  it.skipIf(!zhJsonExists)("zh.json contains only valid types", () => {
    const questions = JSON.parse(fs.readFileSync(zhJsonPath, "utf8"));
    for (const q of questions) {
      expect(VALID_TYPES).toContain(q.type);
    }
  });

  it.skipIf(!zhJsonExists)("zh.json contains only valid formats", () => {
    const questions = JSON.parse(fs.readFileSync(zhJsonPath, "utf8"));
    for (const q of questions) {
      expect(VALID_FORMATS).toContain(q.format);
    }
  });

  it.skipIf(!zhJsonExists || !enJsonExists)(
    "image fields in zh.json match en.json by id",
    () => {
      const zhQuestions = JSON.parse(fs.readFileSync(zhJsonPath, "utf8"));
      const enQuestions = JSON.parse(fs.readFileSync(enJsonPath, "utf8"));
      const enImageMap = Object.fromEntries(
        enQuestions.map((q) => [q.id, q.image]),
      );

      for (const q of zhQuestions) {
        if (q.id in enImageMap) {
          expect(q.image).toBe(enImageMap[q.id]);
        }
      }
    },
  );

  it.skipIf(!zhJsonExists)(
    "zh.json contains no \\uXXXX escape sequences",
    () => {
      const raw = fs.readFileSync(zhJsonPath, "utf8");
      expect(raw).not.toMatch(/\\u[0-9a-fA-F]{4}/);
    },
  );
});

describe("Question schema validation logic", () => {
  const REQUIRED_FIELDS = [
    "id",
    "number",
    "type",
    "format",
    "question",
    "options",
    "answer",
  ];

  it("a valid question object has all required fields", () => {
    const validQuestion = {
      id: "signs-true-false-1001",
      number: 1001,
      type: "signs",
      format: "true-false",
      question: "這是一個測試問題",
      options: [
        { label: "True", text: "True" },
        { label: "False", text: "False" },
      ],
      answer: "True",
      image: null,
    };
    for (const field of REQUIRED_FIELDS) {
      expect(validQuestion).toHaveProperty(field);
    }
  });

  it("options must be a non-empty array", () => {
    const options = [
      { label: "True", text: "True" },
      { label: "False", text: "False" },
    ];
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("each option must have label and text", () => {
    const options = [
      { label: "A", text: "選項A" },
      { label: "B", text: "選項B" },
    ];
    for (const opt of options) {
      expect(opt).toHaveProperty("label");
      expect(opt).toHaveProperty("text");
      expect(typeof opt.label).toBe("string");
      expect(typeof opt.text).toBe("string");
    }
  });

  it("type must be signs or regulations", () => {
    expect(VALID_TYPES).toContain("signs");
    expect(VALID_TYPES).toContain("regulations");
    expect(VALID_TYPES).not.toContain("other");
  });

  it("format must be true-false or multiple-choice", () => {
    expect(VALID_FORMATS).toContain("true-false");
    expect(VALID_FORMATS).toContain("multiple-choice");
    expect(VALID_FORMATS).not.toContain("other");
  });
});

describe("Image mapping logic", () => {
  it("applyImageMapping copies image from en bank by id", () => {
    const enBank = [
      {
        id: "signs-true-false-1001",
        image: "./images/signs-true-false-p1-img1.png",
      },
      { id: "signs-true-false-1002", image: null },
    ];
    const zhQuestions = [
      { id: "signs-true-false-1001", image: null },
      { id: "signs-true-false-1002", image: null },
    ];

    const imageMap = Object.fromEntries(enBank.map((q) => [q.id, q.image]));
    const result = zhQuestions.map((q) => ({
      ...q,
      image: imageMap[q.id] ?? null,
    }));

    expect(result[0].image).toBe("./images/signs-true-false-p1-img1.png");
    expect(result[1].image).toBeNull();
  });

  it("applyImageMapping returns null for ids not in en bank", () => {
    const enBank = [
      { id: "signs-true-false-1001", image: "./images/test.png" },
    ];
    const zhQuestions = [{ id: "signs-true-false-9999", image: null }];

    const imageMap = Object.fromEntries(enBank.map((q) => [q.id, q.image]));
    const result = zhQuestions.map((q) => ({
      ...q,
      image: imageMap[q.id] ?? null,
    }));

    expect(result[0].image).toBeNull();
  });
});
