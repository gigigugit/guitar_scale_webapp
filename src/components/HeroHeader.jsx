export default function HeroHeader({ children = null, hidden = false, isSmartphone = false, showTitle = true, title }) {
  const headingClassName = isSmartphone ? "m-0 font-normal leading-[0.96] tracking-[-0.045em]" : "m-0 font-normal leading-none tracking-[-0.05em]";
  const headingStyle = {
    color: "var(--theme-title-color)",
    fontFamily: "var(--theme-title-font)",
    fontSize: isSmartphone ? "var(--theme-title-size-mobile)" : "var(--theme-title-size-desktop)",
  };

  return (
    <header
      className={[
        "flex justify-center overflow-hidden transition-[max-height,opacity,padding,transform] duration-300 ease-out",
        hidden ? "max-h-0 translate-y-[-8px] pb-0 pt-0 opacity-0" : "max-h-[14rem] pb-0.5 pt-1 opacity-100 max-[height:430px]:max-h-[9rem] max-[height:430px]:pb-0 max-[height:430px]:pt-0.5",
      ].join(" ")}
    >
      <div className="w-[min(100%,1260px)] px-1 sm:px-2">
        {showTitle ? <h1 className={headingClassName} style={headingStyle}>{title}</h1> : null}
        {children ? <div className={showTitle ? "mt-1.5" : undefined}>{children}</div> : null}
      </div>
    </header>
  );
}
