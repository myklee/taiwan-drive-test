import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  base: "/taiwan-drive-test/",
  plugins: [
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
