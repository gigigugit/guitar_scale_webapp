import("./main.jsx").catch((error) => {
  console.warn(
    "Failed to load application: the source files were opened directly without Vite transformation. Run `npm run dev` for development, or run `npm run build` and serve the `dist` folder for a static preview.",
    error,
  );
});
