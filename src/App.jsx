import FretboardApp from "./apps/FretboardApp";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f4ebde] text-[#402d22]">
      <main className="mx-auto w-full max-w-[1600px] px-2 py-2.5 sm:px-4 sm:py-4 max-[height:430px]:px-2 max-[height:430px]:py-1">
        <FretboardApp />
      </main>
    </div>
  );
}
