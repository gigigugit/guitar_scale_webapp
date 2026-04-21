import("./main.jsx").catch((error) => {
  const bootMessage = document.querySelector(".boot-message");

  if (bootMessage && !bootMessage.querySelector("[data-bootstrap-error]")) {
    const details = document.createElement("p");
    details.dataset.bootstrapError = "true";
    details.textContent = "The source files were opened directly without Vite transformation. Run `npm run dev`, or build and serve the `dist` folder instead.";
    bootMessage.append(details);
  }

  console.warn(
    "Failed to load application: the source files were opened directly without Vite transformation. Run `npm run dev` for development, or run `npm run build` and serve the `dist` folder for a static preview.",
    error,
  );
});
