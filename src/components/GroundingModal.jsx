import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, RotateCcw, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const STEPS = [
  { id: "see", count: 5 },
  { id: "touch", count: 4 },
  { id: "hear", count: 3 },
  { id: "smell", count: 2 },
  { id: "safe", count: 1 },
];

function GroundingStepIcon({ type }) {
  const id = "ground-" + type;
  const grad = "url(#" + id + ")";
  return (
    <svg viewBox="0 0 64 64" className="w-9 h-9" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="12" y1="10" x2="52" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <filter id={id + "-shadow"} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#047857" floodOpacity=".16" />
        </filter>
      </defs>
      <circle cx="32" cy="32" r="25" fill={grad} fillOpacity=".08" />
      {type === "see" && <g filter={"url(#" + id + "-shadow)"}><path d="M8 32s8-13 24-13 24 13 24 13-8 13-24 13S8 32 8 32Z" fill="white" fillOpacity=".8" stroke={grad} strokeWidth="2.5"/><circle cx="32" cy="32" r="8" fill={grad}/><circle cx="29.5" cy="29.5" r="2.2" fill="white" fillOpacity=".9"/></g>}
      {type === "touch" && <g filter={"url(#" + id + "-shadow)"}><path d="M25 47c-3.5-1.8-5.6-5.2-6.2-9.6l-2-12.8a3.2 3.2 0 0 1 6.3-.9l1.5 8.1V16a3.2 3.2 0 1 1 6.4 0v14-17a3.2 3.2 0 1 1 6.4 0v17-14a3.2 3.2 0 1 1 6.4 0v17.4l1.3-3.2a3.2 3.2 0 0 1 6 2.2l-3.6 10.1c-1.5 4.2-5.4 6.9-9.9 6.9H31c-2.1 0-4.2-.5-6-1.5Z" fill={grad} fillOpacity=".9"/><path d="M31 30V17M37.4 30V13M43.8 31V17" stroke="white" strokeOpacity=".75" strokeWidth="1.8" strokeLinecap="round"/></g>}
      {type === "hear" && <g filter={"url(#" + id + "-shadow)"}><path d="M39.5 43.5c-3.2 3.8-9.7 2.8-9.7-2.4 0-4.1 4.1-4.7 6.2-7.1 2.6-3 2.3-8.9-3.2-10.1-5.6-1.2-9.8 2.8-9.8 8.4" stroke={grad} strokeWidth="3.4" strokeLinecap="round"/><path d="M43 14.5c6.2 3.4 9.6 9.7 9.2 16.5M47 10c8.3 4.4 13.2 12.5 12.7 21.5" stroke={grad} strokeWidth="2.3" strokeLinecap="round" opacity=".75"/><circle cx="25" cy="32" r="2.2" fill={grad}/></g>}
      {type === "smell" && <g filter={"url(#" + id + "-shadow)"}><path d="M25 13c0 8-6 14-6 21 0 5 4 8 13 8s13-3 13-8c0-7-6-13-6-21" stroke={grad} strokeWidth="3" strokeLinecap="round"/><path d="M25 47c2.3 1.7 11.7 1.7 14 0" stroke={grad} strokeWidth="2.3" strokeLinecap="round"/><path d="M21 9c-1.8-2-1.8-4 0-6M32 9c-1.8-2-1.8-4 0-6M43 9c-1.8-2-1.8-4 0-6" stroke={grad} strokeWidth="2.2" strokeLinecap="round" opacity=".7"/></g>}
      {type === "safe" && <g filter={"url(#" + id + "-shadow)"}><path d="M32 51S13 41.4 13 27c0-7 4.4-11.5 10.2-11.5 3.6 0 6.7 2 8.8 5 2.1-3 5.2-5 8.8-5C45.6 15.5 50 20 50 27c0 14.4-18 24-18 24Z" fill={grad} fillOpacity=".18" stroke={grad} strokeWidth="2.7"/><path d="M21 29.5c3 3.5 6.1 6.1 10.7 9.1 4-3.3 7.1-6.6 10.3-11.4" stroke={grad} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></g>}
    </svg>
  );
}

export default function GroundingModal({ open, onClose }) {
  const { t, lang } = useTranslation();
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    if (!open) setCompleted([]);
  }, [open]);

  if (!open) return null;

  const currentIndex = completed.length;
  const current = STEPS[currentIndex];
  const done = completed.length === STEPS.length;
  const stepLabel = lang === "en"
    ? `Step ${currentIndex + 1} of ${STEPS.length}`
    : `ขั้นตอนที่ ${currentIndex + 1} จาก ${STEPS.length}`;

  const completeCurrent = () => {
    if (!current) return;
    setCompleted((items) => [...items, current.id]);
  };

  return createPortal(
    <div className="wellness-modal-root fixed inset-0 z-[100] w-screen h-screen min-h-dvh flex items-center justify-center p-4 sm:p-6">
      <button aria-label={t("ground.close")} onClick={onClose} className="wellness-modal-backdrop absolute inset-0" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <button type="button" aria-label={t("ground.close")} onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-1">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🌿</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t("ground.title")}</h2>
          <p className="text-xs text-slate-400 mt-1">{t("ground.subtitle")}</p>
        </div>

        <div className="flex items-center gap-1.5 mt-5">
          {STEPS.map((step, index) => (
            <div key={step.id} className={`h-1.5 flex-1 rounded-full ${index < completed.length ? "bg-emerald-400" : index === currentIndex ? "bg-emerald-200 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-800"}`} />
          ))}
        </div>

        {!done ? (
          <div className="mt-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
              <GroundingStepIcon type={current.id} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-5">{stepLabel}</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-2">{t(`ground.step.${current.id}.title`)}</h3>
            <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 mt-3">{current.count}</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{t(`ground.step.${current.id}.desc`)}</p>
            <button
              onClick={completeCurrent}
              className="w-full mt-6 h-12 rounded-2xl !bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900 font-semibold flex items-center justify-center gap-2 hover:!bg-slate-800 dark:hover:!bg-white transition-colors"
            >
              <Check className="w-4 h-4" />
              {t("ground.doneButton")}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-emerald-700 dark:text-emerald-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4">{t("ground.completeTitle")}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{t("ground.completeDesc")}</p>
            <button
              onClick={() => setCompleted([])}
              className="w-full mt-6 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t("ground.restart")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
