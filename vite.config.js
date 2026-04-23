import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appVersion = process.env.npm_package_version ?? "dev";

export default defineConfig(() => ({
  base: process.env.GITHUB_PAGES === "true" ? "/guitar_scale_webapp/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [react()],
}));
