export default function HeroHeader({ title, hidden = false }) {
  return (
    <header
      className={[
        "overflow-hidden px-2 transition-[max-height,opacity,padding,transform] duration-300 ease-out",
        hidden ? "max-h-0 translate-y-[-8px] pt-0 opacity-0" : "max-h-20 pt-2 opacity-100",
      ].join(" ")}
    >
      <h1 className="m-0 font-sans text-[clamp(1rem,5vw,2rem)] font-normal leading-none tracking-[-0.05em] text-[#3d291e]">
        {title}
      </h1>
    </header>
  );
}
