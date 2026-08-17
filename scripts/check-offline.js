#!/usr/bin/env node
// Verifies that dist/ is a self-contained offline bundle before it is copied into
// the native app. Run automatically by `npm run build:app`.
//
// Checks:
//   1. capacitor.config.json does not point the WebView at a remote server
//   2. no external http(s) references in the built HTML/JS/CSS
//   3. all 8 question banks are present, parse, and are non-trivial
//   4. every image referenced by every bank exists in the bundle

import fs from "fs";
import path from "path";

const DIST = "dist";
const LANG_CODES = ["en", "zh", "ja", "vi", "id", "th", "my", "km"];
const MIN_QUESTIONS = 1000;

const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error(`✗ ${DIST}/ not found — run the build first.`);
  process.exit(1);
}

// 1. A `server.url` makes the app load from the network, which is the single
//    fastest way to get rejected under App Store guideline 4.2.
const capConfig = JSON.parse(fs.readFileSync("capacitor.config.json", "utf8"));
if (capConfig.server?.url) {
  fail(
    `capacitor.config.json sets server.url (${capConfig.server.url}) — the app would load remotely instead of from the bundle.`,
  );
}

// 2. External references in built assets.
const TEXT_EXT = new Set([".html", ".js", ".css"]);
const EXTERNAL = /(?:src|href)\s*=\s*["']https?:\/\/|url\(\s*["']?https?:\/\//gi;
for (const file of walk(DIST)) {
  if (!TEXT_EXT.has(path.extname(file))) continue;
  const contents = fs.readFileSync(file, "utf8");
  const hits = contents.match(EXTERNAL);
  if (hits) {
    fail(`${file} references external resources: ${[...new Set(hits)].join(", ")}`);
  }
}

// 3 + 4. Question banks and their images.
for (const code of LANG_CODES) {
  const bankPath = path.join(DIST, "questions", `${code}.json`);
  if (!fs.existsSync(bankPath)) {
    fail(`missing question bank: ${bankPath}`);
    continue;
  }

  let bank;
  try {
    bank = JSON.parse(fs.readFileSync(bankPath, "utf8"));
  } catch (error) {
    fail(`${bankPath} is not valid JSON: ${error.message}`);
    continue;
  }

  if (!Array.isArray(bank) || bank.length < MIN_QUESTIONS) {
    fail(
      `${bankPath} has ${Array.isArray(bank) ? bank.length : "no"} questions (expected at least ${MIN_QUESTIONS}).`,
    );
    continue;
  }

  const missingImages = new Set();
  for (const question of bank) {
    if (!question.image) continue;
    if (question.image.startsWith("/")) {
      fail(
        `${code}.json question ${question.id} has an absolute image path (${question.image}) — it will not resolve in the native app.`,
      );
      continue;
    }
    if (!fs.existsSync(path.join(DIST, question.image))) {
      missingImages.add(question.image);
    }
  }
  if (missingImages.size > 0) {
    fail(
      `${code}.json references ${missingImages.size} image(s) not in the bundle, e.g. ${[...missingImages].slice(0, 3).join(", ")}`,
    );
  }

  const withImages = bank.filter((q) => q.image).length;
  console.log(
    `  ${code}.json — ${bank.length} questions, ${withImages} with images`,
  );
}

if (failures.length > 0) {
  console.error("\n✗ Offline bundle check failed:\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\n✓ dist/ is self-contained — no network access required at runtime.");
