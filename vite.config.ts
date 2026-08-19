import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The repo name on GitHub — must match exactly (case-sensitive), since a
// Pages project site is served from https://<user>.github.io/<REPO_NAME>/,
// not from the domain root.
const REPO_NAME = "USSD-UI";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // Only the dedicated gh-pages build (see package.json's build:gh-pages
  // script) gets the subpath base. Local dev, the regular build/preview,
  // and Vercel all stay at "/" — Vercel serves from the domain root, so
  // it would break if this were hardcoded to "/USSD-UI/" unconditionally.
  base: mode === "gh-pages" ? `/${REPO_NAME}/` : "/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
  },
}));
