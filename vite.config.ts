import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5203,
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "react-helmet-async",
      "@sudobility/subscription-components",
      "@sudobility/auth-components",
      "@sudobility/entity_client",
      "@sudobility/components",
      "@sudobility/building_blocks",
    ],
    alias: {
      // Ensure all packages use the same React instance
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      // Ensure all packages use the same subscription-components instance
      "@sudobility/subscription-components": path.resolve(
        __dirname,
        "node_modules/@sudobility/subscription-components",
      ),
      // Help Vite resolve peer dependencies from nested packages
      "@revenuecat/purchases-js": path.resolve(
        __dirname,
        "node_modules/@revenuecat/purchases-js",
      ),
      "react-helmet-async": path.resolve(
        __dirname,
        "node_modules/react-helmet-async",
      ),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@sudobility/subscription-components"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 750,
    // Only preload direct imports, not lazy-loaded chunks
    modulePreload: {
      resolveDependencies: (_filename, deps) => {
        // Don't preload lazy-loaded pages or heavy vendor chunks
        return deps.filter(
          (dep) =>
            !dep.includes("page-") &&
            !dep.includes("vendor-charts") &&
            !dep.includes("vendor-revenuecat") &&
            !dep.includes("vendor-ui"),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React core - must be first and in single chunk
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-is/") ||
              id.includes("node_modules/scheduler/")
            ) {
              return "vendor-react";
            }
            // React Router
            if (id.includes("node_modules/react-router")) {
              return "vendor-router";
            }
            // Firebase - large, auth only
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            // RevenueCat - large, lazy loaded
            if (id.includes("revenuecat") || id.includes("purchases")) {
              return "vendor-revenuecat";
            }
            // i18n libraries
            if (id.includes("i18next")) {
              return "vendor-i18n";
            }
            // TanStack Query
            if (id.includes("@tanstack")) {
              return "vendor-tanstack";
            }
          }
          // NOTE: @sudobility packages, charts, helmet are NOT manually chunked
          // to let Rollup handle shared dependencies naturally
        },
      },
    },
  },
});
