# Shipping the native app

The web app is wrapped with [Capacitor](https://capacitorjs.com/), which packages the
existing `dist/` output into real iOS and Android projects. `app.js` and `index.html`
are shared verbatim between the website and the app — there is no second codebase.

The app ships **fully offline**: all 8 question banks and 377 sign images are bundled
into the binary (~8.4 MB) and the app makes zero network requests at runtime.

## One-time setup

The native project folders are gitignored, so generate them once per machine:

```bash
npm install
npm run build:app          # builds dist/, verifies it is offline-safe, syncs
npx cap add ios            # macOS + Xcode only
npx cap add android        # any platform, needs Android Studio
```

Then generate icons and splash screens from a single source image. Create
`resources/icon.png` (1024×1024) and `resources/splash.png` (2732×2732), then:

```bash
npm run app:icons
```

## Everyday workflow

```bash
npm run app:ios        # build + open Xcode
npm run app:android    # build + open Android Studio
```

Both run `build:app` first, which:

1. builds with `CAPACITOR=1` so asset paths are relative (`./`) rather than the
   GitHub Pages base path,
2. runs `npm run check:offline` — fails the build if anything would need the network,
3. runs `cap sync` to copy `dist/` into the native projects.

Ship from Xcode (Product → Archive) and Android Studio (Build → Generate Signed Bundle).

Nothing here affects the website: `npm run build` and the GitHub Pages deploy workflow
are unchanged.

## What `check:offline` enforces

`scripts/check-offline.js` runs on every app build and fails if:

- `capacitor.config.json` sets a `server.url` (which would make the app load remotely —
  the fastest route to an App Store rejection),
- any built HTML/JS/CSS references an external `http(s)` URL,
- any of the 8 question banks is missing, unparseable, or suspiciously small,
- any `image` path referenced by any bank is absolute or absent from the bundle.

## Web vs native differences

| | Website | Native app |
|---|---|---|
| Asset base | `/taiwan-drive-test/` | `./` |
| Favorites + language | `localStorage` | Capacitor Preferences (`UserDefaults` / `SharedPreferences`) |
| PDF downloads dropdown | shown (dev server only) | hidden |
| Haptics | none | on answer + on starring |
| Legacy `questions.json` | included | stripped |

Storage deliberately differs: the Preferences web shim prefixes its keys, so using it on
the web would orphan the favorites existing visitors have already saved. `app.js` picks
the backend via `Capacitor.isNativePlatform()` in the `storage` wrapper.

## App Store review notes

Apple guideline 4.2 rejects apps that are repackaged websites. Points to make in the
review notes:

- The app is fully functional with the device in airplane mode — the entire question
  bank ships in the binary; there is no server component.
- It provides native haptic feedback and native persistent storage.
- It is a study tool used in vehicles and classrooms where connectivity is unreliable,
  which is the reason offline matters.

Practical costs: Apple Developer Program is $99/year and archiving requires a Mac;
Google Play is a $25 one-time fee and builds anywhere. Play review is faster and more
permissive, so shipping Android first de-risks the process.
