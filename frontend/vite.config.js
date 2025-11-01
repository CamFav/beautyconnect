import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  console.log("[VITE CONFIG] API URL =", env.VITE_API_URL);

  return {
    plugins: [
      react({ jsxRuntime: "automatic" }),

      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["favicon.ico", "pwa-192.png", "pwa-512.png"],
        manifest: {
          name: "BeautyConnect",
          short_name: "BeautyConnect",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#2563eb",
          icons: [
            { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: { enabled: false },
      }),

      // Plugin personnalisé pour forcer les extensions .js au lieu de .jsx
      {
        name: "force-js-extension",
        writeBundle(options, bundle) {
          const distPath = options.dir || "dist";

          // Renomme tous les fichiers .jsx -> .js
          for (const fileName of Object.keys(bundle)) {
            if (fileName.endsWith(".jsx")) {
              const oldPath = path.join(distPath, fileName);
              const newPath = path.join(
                distPath,
                fileName.replace(/\.jsx$/, ".js")
              );

              if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
              }

              // Corrige les imports dans le manifest Rollup
              const content = bundle[fileName].code || "";
              const fixed = content.replace(/\.jsx(["'])/g, ".js$1");
              bundle[fileName.replace(/\.jsx$/, ".js")] = {
                ...bundle[fileName],
                code: fixed,
                fileName: fileName.replace(/\.jsx$/, ".js"),
              };
              delete bundle[fileName];
            }
          }

          // Corrige le index.html si besoin
          const htmlFile = path.join(distPath, "index.html");
          if (fs.existsSync(htmlFile)) {
            let html = fs.readFileSync(htmlFile, "utf-8");
            html = html.replace(/\.jsx(["'])/g, ".js$1");
            fs.writeFileSync(htmlFile, html);
          }
        },
      },
    ],

    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },

    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash][extname]`,
        },
      },
    },
  };
});
