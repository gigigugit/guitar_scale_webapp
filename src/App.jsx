import FretboardApp from "./apps/FretboardApp";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4ebde] text-[#402d22]">
      <main className="mx-auto w-[min(1600px,calc(100vw-36px))] py-4 max-sm:w-[min(100vw-18px,100%)] max-sm:py-3">
        <FretboardApp />
      </main>
    </div>
  );
}