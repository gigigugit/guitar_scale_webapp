export default function HeroHeader({ title, hidden = false }) {
  return (
    <header
      className={[
        "overflow-hidden px-1.5 transition-[max-height,opacity,padding,transform] duration-300 ease-out sm:px-2",
        hidden ? "max-h-0 translate-y-[-8px] pt-0 opacity-0" : "max-h-20 pt-1.5 opacity-100 max-[height:430px]:max-h-12 max-[height:430px]:pt-0.5",
      ].join(" ")}
    >
      <h1 className="m-0 font-sans text-[clamp(1rem,5vw,2rem)] font-normal leading-none tracking-[-0.05em] text-[#3d291e] max-[height:430px]:text-[clamp(0.95rem,3.6vw,1.4rem)]">
        {title}
      </h1>
    </header>
  );
}
