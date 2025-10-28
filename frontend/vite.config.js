import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  console.log("[VITE CONFIG] API URL =", env.VITE_API_URL);

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),

      // === Plugin PWA ===
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.ico",
          "vite.svg",
          "pwa-192.png",
          "pwa-512.png",
        ],
        manifest: {
          name: "BeautyConnect",
          short_name: "BeautyConnect",
          description:
            "Trouvez et réservez facilement les meilleurs professionnels de la beauté autour de vous.",
          theme_color: "#2563eb",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          scope: "/",
          icons: [
            { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],

    server: {
      host: "0.0.0.0",
      port: 5173,
      watch: {
        usePolling: true,
      },
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // === Build optimisé pour Lighthouse ===
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "vendor-react";
              if (id.includes("lucide-react")) return "icons";
              if (id.includes("react-router")) return "router";
              return "vendor";
            }
          },
        },
      },
    },

    define: {
      "process.env": Object.fromEntries(
        Object.entries(env).filter(([key]) => key.startsWith("VITE_"))
      ),
    },

    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      css: true,
      include: [
        "src/__tests__/**/*.{test,spec}.jsx",
        "src/__tests__/**/*.{test,spec}.js",
      ],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        reportsDirectory: path.resolve(__dirname, "./coverage"),
        include: ["src/**/*.{js,jsx}"],
        exclude: ["node_modules/", "src/__tests__/**", "**/*.test.{js,jsx}"],
        clean: false,
        cleanOnRerun: false,
      },
    },
  };
});
