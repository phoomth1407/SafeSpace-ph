import React, { useEffect, useState } from "react";
import { Check, RotateCcw, X, Eye, Hand, Ear, Wind, Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const STEPS = [
  { id: "see", count: 5, icon: Eye },
  { id: "touch", count: 4, icon: Hand },
  { id: "hear", count: 3, icon: Ear },
  { id: "smell", count: 2, icon: Wind },
  { id: "safe", count: 1, icon: Heart },
];

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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button aria-label={t("ground.close")} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-1">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🌿</span>
          </div>
          <h2 className="text-xl font-semibold !text-slate-900 dark:!text-slate-100">{t("ground.title")}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t("ground.subtitle")}</p>
        </div>

        <div className="flex items-center gap-1.5 mt-5">
          {STEPS.map((step, index) => (
            <div key={step.id} className={`h-1.5 flex-1 rounded-full ${index < completed.length ? "bg-emerald-400" : index === currentIndex ? "bg-emerald-200 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-800"}`} />
          ))}
        </div>

        {!done ? (
          <div className="mt-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
              {React.createElement(current.icon, { className: "w-7 h-7 text-emerald-700 dark:text-emerald-300" })}
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
    </div>
  );
}
