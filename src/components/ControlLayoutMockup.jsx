function MockCard({ children, className = "" }) {
  return <section className={["rounded-[22px] border border-[#dccdc1] bg-[rgba(255,255,255,0.62)] p-4 shadow-[0_10px_24px_rgba(91,56,36,0.08)]", className].join(" ")}>{children}</section>;
}

function MockLabel({ children }) {
  return <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8b7668]">{children}</p>;
}

function MockValue({ children, className = "" }) {
  return <div className={["mt-2 flex min-h-11 items-center rounded-[16px] border border-[#d9cbc0] bg-[#fdfaf7] px-3 text-[0.95rem] font-semibold text-[#473127] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]", className].join(" ")}>{children}</div>;
}

function MockChip({ active = false, children }) {
  return <span className={["inline-flex min-h-9 items-center rounded-full border px-3 text-[0.82rem] font-semibold", active ? "border-[#7c5843] bg-[#5b3824] text-[#f7dcc0]" : "border-[#d7c9be] bg-[#fdf8f3] text-[#755f51]"].join(" ")}>{children}</span>;
}

function MockTrack({ label, leftValue, rightValue }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8c7769]">
        <span>{label}</span>
        <span>{leftValue} - {rightValue}</span>
      </div>
      <div className="relative h-3 rounded-full bg-[#e5d8cd]">
        <div className="absolute inset-y-0 left-[18%] right-[22%] rounded-full bg-[linear-gradient(90deg,#7c5843,#b57b54)]" />
        <div className="absolute left-[18%] top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#fefaf7] bg-[#5b3824] shadow-[0_2px_8px_rgba(91,56,36,0.25)]" />
        <div className="absolute right-[22%] top-1/2 h-5 w-5 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#fefaf7] bg-[#5b3824] shadow-[0_2px_8px_rgba(91,56,36,0.25)]" />
      </div>
    </div>
  );
}

function MockSectionTitle({ children }) {
  return <h3 className="m-0 text-[0.96rem] font-semibold uppercase tracking-[0.15em] text-[#5a4030]">{children}</h3>;
}
function SwitchyardMockup({ state }) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <MockCard className="bg-[linear-gradient(180deg,rgba(255,251,246,0.95),rgba(244,234,223,0.95))]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MockSectionTitle>Switch Groups</MockSectionTitle>
            <div className="flex flex-wrap gap-2">
              {state.displayModes.map((mode) => (
                <MockChip key={mode} active={mode === state.displayMode}>{mode}</MockChip>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MockCard className="p-3">
              <MockLabel>Key Bus</MockLabel>
              <MockValue className="justify-between"><span>{state.selectedKey}</span><span className="text-[#8b7668]">Root</span></MockValue>
            </MockCard>
            <MockCard className="p-3">
              <MockLabel>Scale Bank</MockLabel>
              <MockValue className="justify-between"><span>{state.scaleName}</span><span className="text-[#8b7668]">Shape</span></MockValue>
            </MockCard>
            <MockCard className="p-3">
              <MockLabel>Instrument</MockLabel>
              <MockValue>{state.instrument}</MockValue>
            </MockCard>
            <MockCard className="p-3">
              <MockLabel>Tuning</MockLabel>
              <MockValue>{state.tuningName}</MockValue>
            </MockCard>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_1fr]">
            <MockCard className="p-3">
              <MockTrack label="Fret Sweep" leftValue={state.startFret} rightValue={state.endFret} />
            </MockCard>
            <MockCard className="p-3">
              <MockTrack label="String Sweep" leftValue={state.highString} rightValue={state.lowString} />
            </MockCard>
          </div>
        </MockCard>

        <MockCard className="bg-[linear-gradient(180deg,rgba(92,58,40,0.98),rgba(70,43,29,0.98))] text-[#f7ddc2]">
          <div className="grid gap-3">
            <div className="rounded-[18px] border border-[#8d6c53] bg-[rgba(255,255,255,0.06)] p-3">
              <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#e0c09e]">Output lane</p>
              <div className="mt-3 grid gap-2">
                <button className="rounded-[16px] border border-[#9a7458] px-3 py-3 text-left text-[0.88rem] font-semibold" type="button">Copy Tab</button>
                <button className="rounded-[16px] border border-[#9a7458] px-3 py-3 text-left text-[0.88rem] font-semibold" type="button">Save Tab</button>
                <button className="rounded-[16px] bg-[#f3d1a7] px-3 py-3 text-left text-[0.88rem] font-semibold text-[#4c2f20]" type="button">Close View</button>
              </div>
            </div>
            <div className="rounded-[18px] border border-[#8d6c53] bg-[rgba(255,255,255,0.06)] p-3">
              <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#e0c09e]">Enabled degrees</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {state.noteLabels.map((label, index) => (
                  <MockChip key={label} active={index < state.scaleLength && state.noteSelections[index]}>{label}</MockChip>
                ))}
              </div>
            </div>
          </div>
        </MockCard>
      </div>
    </section>
  );
}

function ModuleWallMockup({ state }) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.05fr_1.25fr]">
        <MockCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MockSectionTitle>Modules</MockSectionTitle>
            <div className="flex flex-wrap gap-2">
              <MockChip active>{state.instrument}</MockChip>
              <MockChip>{state.tuningName}</MockChip>
              <MockChip>Max {state.maxFret}</MockChip>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <MockCard className="p-3">
              <MockLabel>Pitch Module</MockLabel>
              <MockValue>{state.selectedKey}</MockValue>
            </MockCard>
            <MockCard className="p-3">
              <MockLabel>Scale Module</MockLabel>
              <MockValue>{state.scaleName}</MockValue>
            </MockCard>
            <MockCard className="p-3 sm:col-span-2">
              <MockLabel>View Mode</MockLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {state.displayModes.map((mode) => (
                  <MockChip key={mode} active={mode === state.displayMode}>{mode}</MockChip>
                ))}
              </div>
            </MockCard>
          </div>

          <div className="mt-4 grid gap-3">
            <MockCard className="p-3">
              <MockTrack label="Fret Corridor" leftValue={state.startFret} rightValue={state.endFret} />
            </MockCard>
            <MockCard className="p-3">
              <MockTrack label="String Corridor" leftValue={state.highString} rightValue={state.lowString} />
            </MockCard>
          </div>
        </MockCard>

        <MockCard className="bg-[linear-gradient(180deg,rgba(255,248,240,0.96),rgba(240,229,218,0.96))]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {state.noteLabels.map((label, index) => (
              <div key={label} className={["rounded-[18px] border p-3 shadow-[0_4px_12px_rgba(91,56,36,0.05)]", index < state.scaleLength && state.noteSelections[index] ? "border-[#7c5843] bg-[linear-gradient(180deg,rgba(91,56,36,0.95),rgba(118,77,53,0.92))] text-[#f7dcc0]" : "border-[#ded2c7] bg-[#fffaf6] text-[#6f5c50]"].join(" ")}>
                <p className="m-0 text-[0.7rem] uppercase tracking-[0.16em] opacity-75">Patch</p>
                <p className="mt-1 text-[1.02rem] font-semibold">{label}</p>
                <div className="mt-3 h-1.5 rounded-full bg-[rgba(255,255,255,0.18)]">
                  <div className={["h-full rounded-full", index < state.scaleLength && state.noteSelections[index] ? "w-full bg-[#f2d0a8]" : "w-1/3 bg-[#d5c5b6]"].join(" ")} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "Capture Shape",
              "Mirror Position",
              "Send To Notes",
            ].map((label, index) => (
              <button key={label} className={["rounded-[18px] px-4 py-4 text-left text-[0.88rem] font-semibold shadow-[0_4px_12px_rgba(91,56,36,0.06)]", index === 2 ? "bg-[#5b3824] text-[#f7dcc0]" : "border border-[#d8cac0] bg-[#fffaf5] text-[#52382a]"].join(" ")} type="button">
                {label}
              </button>
            ))}
          </div>
        </MockCard>
      </div>
    </section>
  );
}

function PatchBayMockup({ state }) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <MockCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MockSectionTitle>Scale Setup</MockSectionTitle>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MockCard className="p-3">
              <MockLabel>Pitch Set</MockLabel>
              <MockValue className="justify-between"><span>{state.selectedKey}</span><span className="text-[#8b7668]">Root</span></MockValue>
            </MockCard>
            <MockCard className="p-3">
              <MockLabel>Shape Logic</MockLabel>
              <MockValue className="justify-between"><span>{state.scaleName}</span><span className="text-[#8b7668]">Scale</span></MockValue>
            </MockCard>
            <MockCard className="p-3">
              <MockLabel>Label Mode</MockLabel>
              <MockValue className="justify-between"><span>{state.displayMode}</span><span className="text-[#8b7668]">Label</span></MockValue>
            </MockCard>
          </div>

          <div className="mt-4">
            <MockCard className="p-3">
              <MockLabel>Fret Region</MockLabel>
              <MockTrack label="Window" leftValue={state.startFret} rightValue={state.endFret} />
            </MockCard>
          </div>
        </MockCard>

        <MockCard className="bg-[linear-gradient(180deg,rgba(255,248,240,0.95),rgba(240,228,216,0.95))]">
          <MockSectionTitle>Action</MockSectionTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Pin favorite setup",
              "Cycle degree palette",
              "Send to clipboard",
              "Save as study card",
            ].map((label) => (
              <button key={label} className="rounded-[18px] border border-[#d8cac0] bg-[#fffaf5] px-4 py-4 text-left text-[0.88rem] font-semibold text-[#52382a] shadow-[0_4px_12px_rgba(91,56,36,0.06)]" type="button">
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-[18px] border border-dashed border-[#ccb8a9] p-4">
            <p className="m-0 text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-[#8d7768]">Instrument</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <MockChip active>{state.instrument}</MockChip>
              <MockChip>{state.tuningName}</MockChip>
            </div>
          </div>
        </MockCard>
      </div>

      <MockCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MockSectionTitle>Degree Patch Cables</MockSectionTitle>
          <p className="m-0 text-[0.84rem] text-[#7c685a]">A denser, modular take on the current degree chips.</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-7">
          {state.noteLabels.map((label, index) => (
            <button
              key={label}
              className={[
                "min-h-0 rounded-full border px-3 py-2 text-center text-[0.9rem] font-semibold leading-none shadow-[0_4px_12px_rgba(91,56,36,0.05)]",
                index < state.scaleLength && state.noteSelections[index]
                  ? "border-[#7c5843] bg-[linear-gradient(180deg,rgba(91,56,36,0.92),rgba(115,74,51,0.92))] text-[#f7dcc0]"
                  : "border-[#ded2c7] bg-[#fffaf6] text-[#6f5c50]",
              ].join(" ")}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </MockCard>
    </section>
  );
}

export default function ControlLayoutMockup({ state, variant }) {
  if (variant === "switchyard") {
    return <SwitchyardMockup state={state} />;
  }

  if (variant === "module-wall") {
    return <ModuleWallMockup state={state} />;
  }

  if (variant === "patch-bay") {
    return <PatchBayMockup state={state} />;
  }

  return <SwitchyardMockup state={state} />;
}