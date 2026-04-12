import FretboardApp from "./apps/FretboardApp";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4ebde] text-[#402d22]">
      <main className="mx-auto w-full max-w-[1600px] px-1 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-3">
        <FretboardApp />
      </main>
    </div>
  );
}
