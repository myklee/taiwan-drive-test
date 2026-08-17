# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taiwan Driver's Test is a vanilla JavaScript web app for practicing the Taiwan driving license exam. It ships 8 languages (~1,450–1,480 questions each), 377 English questions carry a traffic-sign/road-marking image, and it deploys to GitHub Pages. The same codebase is packaged as an offline iOS/Android app with Capacitor — see `MOBILE_APP.md`.

## Commands

```bash
npm install          # Install deps (vite/vitest are devDeps — nothing runs without this)
npm run dev          # Vite dev server with hot reload
npm run build        # Production build to dist/ (website, base /taiwan-drive-test/)
npm run test         # Vitest, single run (no watch)

# Native app (Capacitor) — see MOBILE_APP.md
npm run build:app    # CAPACITOR=1 build + offline check + cap sync
npm run check:offline # Assert dist/ needs no network at runtime
npm run app:ios      # build:app, then open Xcode (macOS only)
npm run app:android  # build:app, then open Android Studio

# PDF extraction pipeline (requires res/ PDFs, which are gitignored)
npm run extract:en   # English PDFs → public/questions/en.json
npm run extract:zh   # Chinese PDFs → public/questions/zh.json
npm run extract:all  # en + zh, then extract-all.js for the remaining 6 languages
npm run extract      # English text + image extraction (needs Python 3 + PyMuPDF)
```

No linter is configured. Source formatting follows Prettier defaults (double quotes, 2-space indent, trailing commas) — match it by hand.

## Architecture

**Frontend**: Single page, no framework, no build-time templating. `index.html` holds all markup and a single inline `<style>` block; `app.js` is a browser ES module loaded with `<script type="module">` that does direct DOM manipulation and re-renders by assigning `innerHTML`. There is no router, no state library, and no bundled framework runtime.

**Runtime state** lives in module-level globals in `app.js`: `allQuestions`, `filteredQuestions`, `currentQuestionIndex`, `favorites` (a `Set`), `activeLanguage`. Persisted under the keys `active_language` and `favorites_<lang>` (favorites are per-language and store question `id` strings).

Persistence goes through the async `storage` wrapper at the top of `app.js`: raw `localStorage` on the web, Capacitor Preferences on native. The split is deliberate — the Preferences web shim prefixes keys, so using it everywhere would orphan favorites already saved by site visitors. Because reads are async, `loadFavorites()` must be awaited and app init is an async IIFE; keep that ordering if you touch startup.

**Native build** (`build:app`): `Capacitor.isNativePlatform()` gates the three native-only behaviors — haptics on answer/star, Preferences storage, and hiding the PDF-downloads dropdown (those links are dev-server-only and would 404 in the app). Everything else is shared verbatim with the website.

**Language config**: The `LANGUAGES` array at the top of `app.js` is the single source of truth for the 8 supported languages — code, display name, localized filter labels, and the list of source PDF filenames offered in the "PDF downloads" dropdown. Adding a language means adding an entry here *and* producing `public/questions/<code>.json`.

**Data flow**: Official PDFs in `res/` → extraction scripts → per-language JSON in `public/questions/` → fetched at runtime by `loadQuestions()` from `./questions/<lang>.json`. Language switches abort any in-flight fetch via `AbortController`.

**Question data model** (as actually emitted — note `image` is a single optional string, and `id` is a slug, not a number):

```javascript
{
  id: "signs-true-false-001",     // `${type}-${format}-${3-digit number}`; stable across languages
  number: 1,                      // per-bank question number shown in the UI and index
  type: "signs" | "regulations",
  format: "true-false" | "multiple-choice",
  question: string,               // may be "" for signs multiple-choice (the image IS the question)
  options: [{ label, text }],     // T/F: labels "True"/"False"; MC: labels "1"/"2"/"3"
  answer: string,                 // matches an option label
  image: string | null            // e.g. "images/signs-true-false-p1-img1.png" — no leading slash
}
```

The `id` is the join key across languages: `extract-all.js` and `extract-zh.js` copy `image` from `public/questions/en.json` by `id`, so **English must be extracted first** and non-English banks never map images themselves. Image paths must stay relative (no leading `/`) or they break under the GitHub Pages base path.

**Filters**: `applyFilter()` matches on the composite `${q.type}-${q.format}` key (`signs-true-false`, `signs-multiple-choice`, `regulations-true-false`, `regulations-multiple-choice`), plus `all` and `starred` (favorites). The filter `<select>` is rebuilt per language from `LANGUAGES[].filters`; `renderFilters()` clones the element to drop stale listeners, so grab a fresh reference by id after calling it.

**Extraction scripts**:

- `extract-questions.js` — English PDFs; halfwidth option markers `(1)(2)(3)`. Applies `image_map.json` to signs questions.
- `parse-cjk-pdf.js` — shared parser library. Exports `splitFullwidthOptions`, `splitHalfwidthOptions`, `stripPageHeaders`, `parseTableFormat`, `parseUnnumberedMC`.
- `extract-zh.js` — Chinese PDFs, using the CJK parsers.
- `extract-all.js` — the other 6 languages (ja, vi, id, th, my, km). Each PDF entry declares `tableFormat` (compact table, fullwidth `（１）（２）（３）`), `unnumbered`, or neither (standard halfwidth parse). Per-language `headerPatterns` / `skipLinePattern` strip page furniture. Requires `public/questions/en.json` to exist and exits otherwise.
- `extract_images.py` — PyMuPDF; pulls embedded images from the two English signs PDFs into `public/images/` as `<type>-<format>-p<page>-img<n>.(png|jpeg)`, sorted by Y position so numbering matches visual top-to-bottom order.
- `create_manual_mapping.py` — generates the verified question→image mapping.
- `map_images_to_questions.py` — older automated mapper, superseded by the manual mapping.
- `extract-simple.js`, `extract-with-images.js` — legacy/experimental, not wired to any npm script.

**Image mapping**: All 377 mappings (240 signs T/F + 137 signs MC) were manually verified against PDF page structure; ratios vary by page (2:1, 1:1, and mixed). Do not "fix" them algorithmically — read `IMAGE_MAPPING_NOTES.md` first for the per-page rationale.

## Repository layout

```
index.html               markup + all CSS
app.js                   the entire client app
public/questions/*.json  8 language question banks (committed)
public/images/           extracted sign images (committed)
public/questions.json    legacy combined file, unused by the app (stripped from native builds)
res/                     source PDFs — gitignored, not in a fresh clone
tests/unit/              Vitest specs
scripts/check-offline.js asserts dist/ is a self-contained offline bundle
capacitor.config.json    native app id/name; must never gain a server.url
ios/, android/           generated by `npx cap add` — gitignored, see MOBILE_APP.md
image_map.json           image path lookup used by extract-questions.js
IMAGE_MAPPING_NOTES.md   per-page image mapping rationale
MOBILE_APP.md            native app build, release, and App Store notes
```

Because `res/` is gitignored, the extraction scripts cannot run in a fresh clone — the committed JSON in `public/questions/` is the working input for app changes. Only touch extraction code when the PDFs are present locally.

## Build & Deploy

Vite is configured with `base: "/taiwan-drive-test/"` for GitHub Pages, switched to `"./"` when `CAPACITOR=1` because the native WebView serves from the root of a local origin. Getting this wrong yields a blank app with 404s on every asset. `vite.config.js` also registers a dev-only `serve-res` middleware that serves `/res/*` PDFs as downloads — those PDF links only work in `npm run dev`, not in the deployed build. Deployment is automatic on push to `main` via `.github/workflows/deploy.yml` (Node 20, `npm ci`, `npm run build`, publish `dist/`).

## Testing

Tests live in `tests/unit/` and run under Vitest with the `happy-dom` environment; `fast-check` is available for property-based tests.

`app.js` executes side effects at load (it fetches and renders immediately), so it cannot be imported in a test. `tests/unit/app.test.js` therefore re-declares the logic under test rather than importing the module — keep any duplicated constants in sync when you change `app.js`.

`tests/unit/extract-zh.test.js` validates the committed JSON banks as data: valid `type`/`format` values, and that `image` fields in `zh.json` match `en.json` by `id`. It uses `it.skipIf` to no-op when the JSON files are missing, so a green run does not necessarily mean those assertions executed.
