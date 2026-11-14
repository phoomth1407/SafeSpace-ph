import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Compass, RotateCcw, X } from "lucide-react";
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
    <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden="true">
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
  const reduceMotion = useReducedMotion();
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
    <div className="wellness-modal-root fixed inset-0 z-[100] flex h-[100dvh] w-screen items-stretch justify-stretch overflow-hidden p-0">
      <button aria-label={t("ground.close")} onClick={onClose} className="wellness-modal-backdrop absolute inset-0" />
      <div role="dialog" aria-modal="true" aria-labelledby="ground-modal-title" className="relative z-10 flex h-full w-full flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_10%_85%,rgba(167,243,208,.7),transparent_40%),radial-gradient(ellipse_at_90%_10%,rgba(186,230,253,.65),transparent_42%),linear-gradient(145deg,#f7fffb,#effaf5_52%,#f3f8ff)] px-5 py-5 text-slate-900 dark:bg-[radial-gradient(ellipse_at_10%_85%,rgba(16,185,129,.12),transparent_40%),radial-gradient(ellipse_at_90%_10%,rgba(56,189,248,.12),transparent_42%),linear-gradient(145deg,#071b18,#0b1b24_52%,#0e1228)] dark:text-white sm:px-8 sm:py-7">
        <button type="button" aria-label={t("ground.close")} onClick={onClose} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/70 text-slate-600 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button>
        <header className="mx-auto flex w-full max-w-7xl items-center gap-3 pr-12">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 text-emerald-700 shadow-sm ring-1 ring-white dark:from-emerald-300/15 dark:to-sky-300/15 dark:text-emerald-200 dark:ring-white/10"><Compass className="h-6 w-6" /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-emerald-700 dark:text-emerald-200">SafeSpace · 5–4–3–2–1</p><h2 id="ground-modal-title" className="text-xl font-semibold sm:text-2xl">{t("ground.title")}</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{t("ground.subtitle")}</p></div>
        </header>

        <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.9fr)] lg:gap-12 lg:py-8">
          <section className="relative flex min-h-[42vh] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/35 p-6 text-center shadow-[0_28px_90px_rgba(34,120,83,.1)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.04] lg:min-h-[65vh]">
            <div className="absolute inset-0 opacity-50" aria-hidden="true"><div className="absolute left-[18%] top-[15%] h-52 w-52 rounded-full bg-emerald-200/70 blur-3xl dark:bg-emerald-400/10"/><div className="absolute bottom-[12%] right-[10%] h-64 w-64 rounded-full bg-sky-200/70 blur-3xl dark:bg-sky-400/10"/></div>
            <div className="relative z-10">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-white/90 to-emerald-50/80 shadow-[0_18px_55px_rgba(16,185,129,.16)] ring-1 ring-white dark:from-emerald-200/10 dark:to-sky-200/10 dark:ring-white/10 sm:h-36 sm:w-36"><GroundingStepIcon type={done ? "safe" : current.id} /></div>
              <motion.div key={current?.id || "done"} initial={reduceMotion ? false : { opacity: 0, y: 14, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .45 }} className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-200">{done ? (lang === "en" ? "A moment for you" : "ช่วงเวลานี้เป็นของคุณ") : stepLabel}</p>
                <p className="mt-1 text-7xl font-light tabular-nums tracking-tight text-emerald-700 dark:text-emerald-200 sm:text-8xl">{done ? <Check className="mx-auto h-20 w-20" strokeWidth={1.4} /> : current.count}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{done ? t("ground.completeTitle") : (lang === "en" ? "Notice gently, at your own pace" : "ค่อย ๆ รับรู้ ในจังหวะของคุณ")}</p>
              </motion.div>
              <div className="mx-auto mt-7 flex max-w-md items-center gap-2" aria-label={lang === "en" ? `Step ${Math.min(currentIndex + 1, STEPS.length)} of ${STEPS.length}` : `ขั้นตอน ${Math.min(currentIndex + 1, STEPS.length)} จาก ${STEPS.length}`}>
                {STEPS.map((step, index) => <span key={step.id} aria-current={index === currentIndex && !done ? "step" : undefined} className={`h-2 flex-1 rounded-full transition-colors ${index < completed.length ? "bg-emerald-500" : index === currentIndex && !done ? "bg-emerald-300 dark:bg-emerald-400" : "bg-slate-200 dark:bg-white/10"}`} />)}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/75 bg-white/65 p-6 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.05] sm:p-8 lg:max-w-none">
            {!done ? (
              <motion.div key={current.id} initial={reduceMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .3 }}>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-200">{lang === "en" ? "Bring your attention here" : "พาความสนใจกลับมาตรงนี้"}</p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{t(`ground.step.${current.id}.title`)}</h3>
                <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">{t(`ground.step.${current.id}.desc`)}</p>
                <p className="mt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{lang === "en" ? "Take your time. There is no need to get every step exactly right." : "ค่อย ๆ ทำ ไม่จำเป็นต้องทำทุกขั้นตอนให้สมบูรณ์แบบ"}</p>
                <button type="button" onClick={completeCurrent} className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl !bg-emerald-700 px-5 text-base font-semibold !text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:!bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:!bg-emerald-300 dark:!text-emerald-950 dark:hover:!bg-emerald-200"><Check className="h-5 w-5" />{t("ground.doneButton")}</button>
              </motion.div>
            ) : (
              <motion.div initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-4">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-200">{lang === "en" ? "You are here" : "คุณอยู่ตรงนี้แล้ว"}</p><h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{t("ground.completeTitle")}</h3><p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">{t("ground.completeDesc")}</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setCompleted([])} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl !bg-emerald-700 px-4 text-sm font-semibold !text-white transition hover:!bg-emerald-800 dark:!bg-emerald-300 dark:!text-emerald-950 dark:hover:!bg-emerald-200"><RotateCcw className="h-4 w-4" />{t("ground.restart")}</button><button type="button" onClick={onClose} className="min-h-12 rounded-2xl border border-slate-300 bg-white/60 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/[.04] dark:text-slate-200 dark:hover:bg-white/[.08]">{t("ground.close")}</button></div>
              </motion.div>
            )}
          </section>
        </main>
      </div>
    </div>,
    document.body
  );
}
