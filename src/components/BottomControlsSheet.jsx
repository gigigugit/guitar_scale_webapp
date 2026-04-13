import { useEffect, useRef, useState } from "react";

function ChevronIcon({ open }) {
  return (
    <svg aria-hidden="true" className={["h-4 w-4 transition-transform duration-200", open ? "rotate-180" : "rotate-0"].join(" ")} fill="none" viewBox="0 0 20 20">
      <path d="M5 12.5L10 7.5L15 12.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

const tabButtonClassName = (isActive) =>
  [
    "whitespace-nowrap rounded-full border px-3 py-1.5 text-[0.76rem] font-semibold leading-none transition focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10 sm:px-4 sm:text-[0.82rem]",
    isActive ? "shadow-[0_6px_14px_rgba(91,56,36,0.18)]" : "hover:-translate-y-px",
  ].join(" ");

export default function BottomControlsSheet({ children, isOpen, isSmartphone = false, onToggle, onHeightChange, primaryTabLabel = "Controls", secondaryTabLabel = "Tab 2", secondaryContent = null, tabs: providedTabs = null }) {
  const fallbackTabs = [
    { id: "primary", label: primaryTabLabel, content: children },
    { id: "secondary", label: secondaryTabLabel, content: secondaryContent },
  ];
  const tabs = providedTabs?.length ? providedTabs : fallbackTabs;
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "primary");
  const sectionRef = useRef(null);

  useEffect(() => {
    if (tabs.some((tab) => tab.id === activeTab)) {
      return;
    }

    setActiveTab(tabs[0]?.id ?? "primary");
  }, [activeTab, tabs]);

  useEffect(() => {
    if (!onHeightChange) {
      return undefined;
    }

    if (!isOpen) {
      onHeightChange(0);
      return undefined;
    }

    const element = sectionRef.current;
    if (!element) {
      return undefined;
    }

    const reportHeight = () => onHeightChange(element.offsetHeight);
    reportHeight();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(reportHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [activeTab, isOpen, onHeightChange, tabs]);

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content ?? null;
  const dockStyle = {
    paddingLeft: "max(0.5rem, env(safe-area-inset-left))",
    paddingRight: "max(0.5rem, env(safe-area-inset-right))",
  };
  const openSectionStyle = isSmartphone ? { paddingBottom: "calc(0.9rem + env(safe-area-inset-bottom))" } : undefined;
  const closedButtonWrapStyle = isSmartphone ? { paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" } : undefined;
  const sheetMaxHeight = isSmartphone ? "min(62vh, 560px)" : "min(74vh, 680px)";
  const activeTabStyle = { background: "var(--theme-accent)", borderColor: "var(--theme-accent-strong)", color: "var(--theme-accent-text)", fontFamily: "var(--theme-ui-font)" };
  const inactiveTabStyle = { background: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-muted)", fontFamily: "var(--theme-ui-font)" };
  const drawerStyle = {
    ...openSectionStyle,
    background: "linear-gradient(180deg, var(--theme-drawer-start), var(--theme-drawer-end))",
    borderColor: "var(--theme-drawer-border)",
    color: "var(--theme-app-text)",
    fontFamily: "var(--theme-ui-font)",
  };
  const iconButtonStyle = { background: "var(--theme-surface)", borderColor: "var(--theme-border)", color: "var(--theme-muted)" };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30" style={dockStyle}>
      <div className="mx-auto w-full max-w-[1600px]">
        {isOpen ? (
          <section
            ref={sectionRef}
            className="pointer-events-auto rounded-t-[24px] border border-[#d9cbc0]/90 bg-[linear-gradient(180deg,rgba(252,246,239,0.98),rgba(244,234,223,0.98))] px-3 pb-4 pt-3 shadow-[0_-20px_50px_rgba(67,43,28,0.18)] backdrop-blur sm:rounded-t-[28px] sm:px-5 sm:pb-5"
            style={drawerStyle}
          >
            <div className="mb-3 grid gap-2.5 sm:mb-4">
              <div className="flex justify-center">
                <button
                  aria-expanded="true"
                  aria-label="Collapse controls"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7c7bb] bg-[#fbf7f2] text-[#735f54] shadow-[0_4px_12px_rgba(91,56,36,0.08)] transition hover:-translate-y-px hover:text-[#4b3428] focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10"
                  onClick={onToggle}
                  style={iconButtonStyle}
                  type="button"
                >
                  <ChevronIcon open={isOpen} />
                </button>
              </div>
              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <div className="flex min-w-max items-center gap-2 sm:justify-center">
                  {tabs.map((tab) => (
                    <button key={tab.id} className={tabButtonClassName(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)} style={activeTab === tab.id ? activeTabStyle : inactiveTabStyle} type="button">
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-auto pr-1 transition-[max-height] duration-300 ease-out" style={{ maxHeight: sheetMaxHeight }}>
                {activeTabContent}
              </div>
            </div>
          </section>
        ) : (
          <div className="flex justify-center pb-3" style={closedButtonWrapStyle}>
            <button
              aria-expanded="false"
              aria-label="Expand controls"
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbb9ab] bg-[rgba(251,247,242,0.92)] text-[#6d5a4e] shadow-[0_10px_22px_rgba(91,56,36,0.12)] backdrop-blur transition hover:-translate-y-px hover:text-[#4b3428] focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10"
              onClick={onToggle}
              style={iconButtonStyle}
              type="button"
            >
              <ChevronIcon open={isOpen} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}