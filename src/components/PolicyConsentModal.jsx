import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function PolicyConsentModal({
  open,
  title,
  popupContent,
  fullPolicy,
  lang = "en",
  requiredConsents = [],
  onAccept,
  onDecline,
  onReadFull,
}) {
  const [checks, setChecks] = useState({});
  const [fullOpen, setFullOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (open) {
      setChecks({});
      setFullOpen(false);
      setSaveError("");
      setSaving(false);
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const allRequired = requiredConsents.every((item) => checks[item.id] === true);

  const accept = async () => {
    if (!allRequired || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      await onAccept?.();
    } catch {
      setSaveError(lang === "en" ? "We couldn't save your acceptance. Please try again." : "บันทึกการยอมรับไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-slate-950/45 backdrop-blur-xl" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col">
        {!fullOpen ? (
          <>
            <div className="px-5 sm:px-7 py-5 border-b border-slate-800">
              <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 mb-1">SafeSpace</div>
              <h2 className="text-xl font-bold text-slate-100">{title}</h2>
            </div>
            <div className="overflow-y-auto px-5 sm:px-7 py-5 text-sm leading-7 text-slate-300">
              {popupContent}
              {requiredConsents.map((item) => (
                <label key={item.id} className="flex items-start gap-3 mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checks[item.id] === true}
                    onChange={(e) => setChecks((v) => ({ ...v, [item.id]: e.target.checked }))}
                    className="mt-1 h-4 w-4 shrink-0 accent-sky-500"
                  />
                  <span className="text-xs leading-5 text-slate-300">{item.label}</span>
                </label>
              ))}
              {saveError && <p role="alert" className="mt-3 text-sm text-rose-300">{saveError}</p>}
            </div>
            <div className="px-5 sm:px-7 py-4 border-t border-slate-800 bg-slate-950/95 space-y-3">
              <button type="button" onClick={() => { onReadFull?.(); setFullOpen(true); }} className="text-sm text-sky-300 hover:text-sky-200 underline underline-offset-4">
                {lang === "en" ? "Read the full policy" : "อ่านนโยบายฉบับเต็ม"}
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onDecline} disabled={saving} className="flex-1 px-5 py-3 rounded-2xl border border-slate-600 text-slate-200 text-sm font-semibold hover:bg-slate-900 disabled:opacity-50 transition-colors">
                  {lang === "en" ? "Decline" : "ปฏิเสธ"}
                </button>
                <button type="button" disabled={!allRequired || saving} onClick={accept} className="flex-1 px-5 py-3 rounded-2xl bg-slate-100 text-slate-900 text-sm font-semibold hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  {saving ? (lang === "en" ? "Saving…" : "กำลังบันทึก…") : (lang === "en" ? "Agree and Continue" : "ยอมรับและดำเนินการต่อ")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-5 sm:px-7 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">{title}</h2>
              <button type="button" onClick={() => setFullOpen(false)} className="text-sm text-slate-300 px-3 py-2 rounded-xl border border-slate-700">
                {lang === "en" ? "Back" : "กลับ"}
              </button>
            </div>
            <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-5 text-sm leading-7 text-slate-300">
              {fullPolicy.map(([heading, body]) => (
                <section key={heading}>
                  <h3 className="font-semibold text-slate-100 mb-1">{heading}</h3>
                  <p>{body}</p>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
