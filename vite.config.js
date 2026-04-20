import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function resolvePagesBase() {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1]?.trim();

  if (!repositoryName) {
    return "/";
  }

  return `/${repositoryName}/`;
}

export default defineConfig(() => ({
  base: process.env.GITHUB_PAGES === "true" ? resolvePagesBase() : "/",
  plugins: [react()],
}));
