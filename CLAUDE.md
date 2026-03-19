# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taiwan Driver's Test is a vanilla JavaScript web app for practicing the Taiwan driving license exam. It supports 8 languages, 1,469 official questions (with 377 traffic sign/road marking images), and is deployed to GitHub Pages.

## Commands

```bash
npm run dev          # Start Vite dev server with hot reload
npm run build        # Production build to dist/
npm run test         # Run Vitest tests (no watch mode)

# PDF extraction pipeline
npm run extract:en   # Extract English questions from PDFs
npm run extract:zh   # Extract Chinese/CJK questions from PDFs
npm run extract:all  # Extract all languages (en + zh + combine)
npm run extract      # Full pipeline including image extraction (requires Python 3 + PyMuPDF)
```

No linter is configured.

## Architecture

**Frontend**: Single-page app with no framework — direct DOM manipulation in `app.js`, all markup/styles in `index.html`. State (favorites) is persisted per-language in localStorage.

**Data flow**: Official PDFs in `res/` → extraction scripts → per-language JSON files in `public/questions/` → loaded by `app.js` at runtime.

**Question data model**:
```javascript
{
  id: number,
  question: string,
  type: "signs" | "regulations",
  format: "true-false" | "multiple-choice",
  answer: string | number,
  options: [{ label: string, text: string }],
  images?: [imagePath]  // path relative to public/images/
}
```

**Extraction scripts**:
- `extract-questions.js` — English PDFs, standard halfwidth option markers `(1)(2)(3)`
- `extract-zh.js` + `parse-cjk-pdf.js` — CJK PDFs (Chinese, Japanese, Vietnamese, etc.) with fullwidth markers `（１）（２）（３）` and compact table layouts
- `extract-all.js` — Orchestrates all languages and combines output

**Image mapping**: All 377 image-to-question mappings are manually verified. See `IMAGE_MAPPING_NOTES.md` for mapping rationale and patterns.

## Build & Deploy

Vite is configured with `base: "/taiwan-drive-test/"` for GitHub Pages. Deployment is automatic on push to `main` via `.github/workflows/deploy.yml` (Node 20, `npm ci`, `npm run build`, deploy `dist/`).

## Testing

Tests live in `tests/unit/`. Vitest runs with `happy-dom` environment. `fast-check` is available for property-based testing.
