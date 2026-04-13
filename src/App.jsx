import FretboardApp from "./apps/FretboardApp";

export default function App() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--theme-app-bg)",
        backgroundImage:
          "radial-gradient(circle at top, var(--theme-app-glow-soft) 0%, transparent 38%), linear-gradient(180deg, var(--theme-app-bg-accent) 0%, var(--theme-app-bg) 52%, var(--theme-app-bg) 100%)",
        color: "var(--theme-app-text)",
        fontFamily: "var(--theme-ui-font)",
      }}
    >
      <main
        className="mx-auto w-full max-w-[1600px] px-0 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-3"
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <FretboardApp />
      </main>
    </div>
  );
}
