import("./main.jsx").catch((error) => {
  console.warn(
    "Dragon Scales must be opened through Vite. Run `npm run dev` for development, or run `npm run build` and serve the `dist` folder for a static preview.",
    error,
  );
});
