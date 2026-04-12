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
    "rounded-full px-4 py-1.5 text-[0.82rem] font-semibold leading-none transition focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10",
    isActive ? "bg-[#5b3824] text-[#f9e3c9] shadow-[0_6px_14px_rgba(91,56,36,0.18)]" : "bg-[rgba(255,255,255,0.4)] text-[#775f51] hover:bg-[rgba(255,255,255,0.7)]",
  ].join(" ");

export default function BottomControlsSheet({ children, isOpen, onToggle, onHeightChange, primaryTabLabel = "Controls", secondaryTabLabel = "Tab 2", secondaryContent = null, tabs: providedTabs = null }) {
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

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto w-[min(1600px,calc(100vw-36px))] max-sm:w-[min(100vw-18px,100%)]">
        {isOpen ? (
          <section ref={sectionRef} className="pointer-events-auto rounded-t-[28px] border border-[#d9cbc0]/90 bg-[linear-gradient(180deg,rgba(252,246,239,0.98),rgba(244,234,223,0.98))] px-4 pb-4 pt-3 shadow-[0_-20px_50px_rgba(67,43,28,0.18)] backdrop-blur sm:px-5 sm:pb-5">
            <div className="mb-3 flex flex-col items-center gap-2.5">
              <div className="relative flex min-h-10 w-full items-center justify-end gap-2">
                <button
                  aria-expanded="true"
                  aria-label="Collapse controls"
                  className="absolute left-1/2 inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#d7c7bb] bg-[#fbf7f2] text-[#735f54] shadow-[0_4px_12px_rgba(91,56,36,0.08)] transition hover:-translate-y-px hover:text-[#4b3428] focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10"
                  onClick={onToggle}
                  type="button"
                >
                  <ChevronIcon open={isOpen} />
                </button>
                <div className="flex flex-wrap items-center justify-end gap-2 pl-12">
                  {tabs.map((tab) => (
                    <button key={tab.id} className={tabButtonClassName(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)} type="button">
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-auto pr-1 transition-[max-height] duration-300 ease-out" style={{ maxHeight: "min(74vh, 680px)" }}>
                {activeTabContent}
              </div>
            </div>
          </section>
        ) : (
          <div className="flex justify-center pb-3">
            <button
              aria-expanded="false"
              aria-label="Expand controls"
              className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbb9ab] bg-[rgba(251,247,242,0.92)] text-[#6d5a4e] shadow-[0_10px_22px_rgba(91,56,36,0.12)] backdrop-blur transition hover:-translate-y-px hover:text-[#4b3428] focus:outline-none focus:ring-4 focus:ring-[#5b3824]/10"
              onClick={onToggle}
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