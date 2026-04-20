import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

if (typeof self !== "undefined" && !self.MonacoEnvironment) {
  self.MonacoEnvironment = {
    getWorker() {
      return new editorWorker();
    },
  };
}

export default function MonacoOutputPanel({
  errorMessage = null,
  onApply,
  onApplyAndSave,
  onChange,
  onCopyCurrent,
  onLoadCurrent,
  statusMessage = null,
  value,
}) {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const isSyncingExternalValueRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const model = monaco.editor.createModel(value, "plaintext");
    const editor = monaco.editor.create(containerRef.current, {
      automaticLayout: true,
      fontFamily: '"Cascadia Code", "Consolas", monospace',
      fontSize: 13,
      formatOnPaste: true,
      lineNumbers: "on",
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      model,
      padding: { bottom: 12, top: 12 },
      readOnly: false,
      roundedSelection: false,
      scrollBeyondLastLine: false,
      tabSize: 2,
      theme: "vs",
      wordWrap: "on",
    });
    const contentSubscription = model.onDidChangeContent(() => {
      if (isSyncingExternalValueRef.current) {
        return;
      }

      onChangeRef.current?.(model.getValue());
    });

    modelRef.current = model;

    return () => {
      contentSubscription.dispose();
      editor.dispose();
      model.dispose();
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const model = modelRef.current;

    if (!model || model.getValue() === value) {
      return;
    }

    isSyncingExternalValueRef.current = true;
    model.setValue(value);
    isSyncingExternalValueRef.current = false;
  }, [value]);

  const buttonClassName = "rounded-full border px-3 py-1.5 text-[0.74rem] font-semibold transition hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-[color:var(--theme-accent)]/12";
  const surfaceButtonStyle = {
    background: "var(--theme-surface)",
    borderColor: "var(--theme-border)",
    color: "var(--theme-app-text)",
  };
  const accentButtonStyle = {
    background: "var(--theme-accent)",
    borderColor: "var(--theme-accent)",
    color: "var(--theme-accent-text)",
  };
  const statusToneStyle = errorMessage
    ? {
        background: "rgba(140, 27, 27, 0.08)",
        borderColor: "rgba(140, 27, 27, 0.22)",
        color: "#8c1b1b",
      }
    : {
        background: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-muted)",
      };

  return (
    <section
      className="mt-4 overflow-hidden rounded-[28px] border"
      style={{
        background: "var(--theme-surface-strong)",
        borderColor: "var(--theme-border)",
        boxShadow: "0 20px 48px var(--theme-fretboard-shadow)",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5"
        style={{
          background: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
        }}
      >
        <div className="min-w-0">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
            Monaco Editor
          </div>
          <div className="text-[1rem] font-semibold tracking-[-0.03em]" style={{ color: "var(--theme-title-color)" }}>
            Live Layout State
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button className={buttonClassName} onClick={onLoadCurrent} style={surfaceButtonStyle} type="button">
            Load Current
          </button>
          <button className={buttonClassName} onClick={onCopyCurrent} style={surfaceButtonStyle} type="button">
            Copy Current
          </button>
          <button className={buttonClassName} onClick={onApply} style={surfaceButtonStyle} type="button">
            Apply
          </button>
          <button className={buttonClassName} onClick={onApplyAndSave} style={accentButtonStyle} type="button">
            Apply + Save
          </button>
        </div>
      </div>
      <div className="grid gap-3 border-b px-4 py-3 sm:px-5" style={{ borderColor: "var(--theme-border)" }}>
        <p className="m-0 text-[0.8rem] leading-5" style={{ color: "var(--theme-muted)" }}>
          Edit the JSON that drives the live fretboard layout, then apply it. Useful keys include panelPaddingX, leftPad, openLaneWidth, preferredFretWidth, standardStringGap, shortNoteRadius, and instrumentStringSpacing.
        </p>
        {errorMessage || statusMessage ? (
          <div className="rounded-[16px] border px-3 py-2 text-[0.78rem] leading-5" style={statusToneStyle}>
            {errorMessage ?? statusMessage}
          </div>
        ) : null}
      </div>
      <div className="h-[360px] w-full sm:h-[430px]" ref={containerRef} />
    </section>
  );
}