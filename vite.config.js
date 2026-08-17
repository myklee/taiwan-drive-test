import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

// The native app is served from the root of a local origin (capacitor://localhost
// on iOS, https://localhost on Android), so the GitHub Pages base path must not be
// baked in. `npm run build:app` sets CAPACITOR=1; plain `npm run build` is unchanged.
const isCapacitorBuild = process.env.CAPACITOR === "1";

export default defineConfig({
  base: isCapacitorBuild ? "./" : "/taiwan-drive-test/",
  plugins: [
    {
      // public/questions.json is the legacy combined bank the app never reads.
      // Vite copies public/ wholesale, so drop it from native builds — it is 736K
      // of dead weight in the app download. The web build keeps it in case
      // anything links to the deployed URL.
      name: "drop-legacy-bank",
      apply: "build",
      closeBundle() {
        if (!isCapacitorBuild) return;
        fs.rmSync(path.join("dist", "questions.json"), { force: true });
      },
    },
    {
      name: "serve-res",
      configureServer(server) {
        server.middlewares.use("/res", (req, res, next) => {
          const filePath = path.join(process.cwd(), "res", req.url);
          if (fs.existsSync(filePath)) {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader(
              "Content-Disposition",
              `attachment; filename="${path.basename(filePath)}"`,
            );
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      },
    },
  ],
});
