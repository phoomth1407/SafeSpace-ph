import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Wind, Play, Pause, RotateCcw, Waves } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const PATTERNS = {
  box: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  sleep: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  coherent: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
};

export default function BreathingExerciseModal({ open, onClose }) {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState("box");
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(PATTERNS.box.inhale);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const phases = useMemo(() => {
    const p = PATTERNS[pattern];
    return [
      { key: "inhale", seconds: p.inhale },
      ...(p.hold1 ? [{ key: "hold", seconds: p.hold1 }] : []),
      { key: "exhale", seconds: p.exhale },
      ...(p.hold2 ? [{ key: "hold", seconds: p.hold2 }] : []),
    ];
  }, [pattern]);

  const chime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = audioRef.current || new AudioContext();
      audioRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  useEffect(() => {
    if (!open) {
      setRunning(false);
      setPhaseIndex(0);
      setRemaining(PATTERNS[pattern].inhale);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  useEffect(() => {
    setPhaseIndex(0);
    setRemaining(phases[0].seconds);
    if (running) chime();
  }, [pattern]);

  useEffect(() => {
    if (!running || !open) return undefined;
    intervalRef.current = setInterval(() => {
      setRemaining((current) => {
        if (current > 1) return current - 1;
        const next = (phaseIndex + 1) % phases.length;
        setPhaseIndex(next);
        chime();
        return phases[next].seconds;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, open, phaseIndex, phases]);

  if (!open) return null;

  const phase = phases[phaseIndex];
  const progress = remaining / phase.seconds;
  const scale = phase.key === "inhale" ? 1.18 - progress * 0.18 : phase.key === "exhale" ? 1 + progress * 0.18 : 1.18;

  return createPortal(
    <div className="wellness-modal-root fixed inset-0 z-[100] flex h-[100dvh] w-screen items-stretch justify-stretch overflow-hidden p-0">
      <button aria-label={t("breath.close")} onClick={onClose} className="wellness-modal-backdrop absolute inset-0" />
      <div role="dialog" aria-modal="true" aria-labelledby="breath-modal-title" className="relative z-10 flex h-full w-full flex-col overflow-y-auto bg-[radial-gradient(ellipse_at_15%_15%,rgba(186,230,253,.75),transparent_38%),radial-gradient(ellipse_at_85%_80%,rgba(221,214,254,.8),transparent_40%),linear-gradient(145deg,#f8fbff,#f4f0ff_55%,#fff7f8)] px-5 py-5 text-slate-900 dark:bg-[radial-gradient(ellipse_at_15%_15%,rgba(14,116,144,.22),transparent_38%),radial-gradient(ellipse_at_85%_80%,rgba(91,33,182,.25),transparent_40%),linear-gradient(145deg,#081322,#11132d_55%,#1c1027)] dark:text-white sm:px-8 sm:py-7">
        <button type="button" aria-label={t("breath.close")} onClick={onClose} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/70 text-slate-600 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800">
          <X className="h-5 w-5" />
        </button>
        <header className="mx-auto flex w-full max-w-7xl items-center gap-3 pr-12">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 text-sky-700 shadow-sm ring-1 ring-white dark:from-sky-300/15 dark:to-violet-300/15 dark:text-sky-200 dark:ring-white/10"><Wind className="h-6 w-6" /></span>
          <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-sky-700 dark:text-sky-200">SafeSpace · {t("breath.title")}</p><h2 id="breath-modal-title" className="text-xl font-semibold sm:text-2xl">{t("breath.title")}</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{t("breath.subtitle")}</p></div>
        </header>

        <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-6 py-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:gap-12 lg:py-8">
          <section className="relative flex min-h-[42vh] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/35 shadow-[0_28px_90px_rgba(62,91,160,.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[.04] lg:min-h-[65vh]">
            <div className="absolute inset-0 opacity-50" aria-hidden="true"><div className="absolute left-[14%] top-[18%] h-48 w-48 rounded-full bg-sky-300/50 blur-3xl dark:bg-sky-400/15" /><div className="absolute bottom-[8%] right-[12%] h-64 w-64 rounded-full bg-violet-300/50 blur-3xl dark:bg-violet-400/15" /></div>
            <div className="relative flex flex-col items-center text-center">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/60 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[.05] dark:text-slate-300"><Waves className="h-4 w-4 text-sky-600 dark:text-sky-300" />{t("breath.cycleTip")}</span>
              <div className="relative grid h-[min(56vw,22rem)] w-[min(56vw,22rem)] place-items-center sm:h-80 sm:w-80">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-300/35 via-cyan-200/20 to-violet-300/35 blur-2xl transition-transform duration-1000" style={{ transform: `scale(${scale * 1.22})` }} />
                <div className="absolute inset-5 rounded-full border border-white/70 dark:border-white/15" />
                <div className="absolute inset-0 rounded-full border border-sky-200/75 dark:border-sky-300/15" style={{ transform: `scale(${scale})`, transition: "transform 900ms ease-in-out" }} />
                <div className="relative flex h-[68%] w-[68%] flex-col items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-white/90 via-sky-50/90 to-violet-100/90 shadow-[0_25px_70px_rgba(99,102,241,.18)] transition-transform duration-1000 dark:border-white/15 dark:from-slate-900/90 dark:via-sky-950/80 dark:to-violet-950/80" style={{ transform: `scale(${scale})` }}>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{t(`breath.phase.${phase.key}`)}</p><span className="mt-1 text-6xl font-light tabular-nums text-sky-700 dark:text-sky-200 sm:text-7xl">{remaining}</span><span className="text-xs text-slate-500 dark:text-slate-400">{t("breath.seconds")}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-xl space-y-6 lg:max-w-none">
            <div><p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500 dark:text-slate-400">{t("breath.subtitle")}</p><h3 className="mt-2 text-2xl font-semibold sm:text-3xl">{t("breath.title")}</h3></div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[ ["box", t("breath.box"), "4 · 4 · 4 · 4"], ["sleep", t("breath.sleep"), "4 · 7 · 8"], ["coherent", t("breath.coherent"), "5 · 5"] ].map(([id, label, cadence]) => (
                <button key={id} type="button" aria-pressed={pattern === id} onClick={() => { setPattern(id); setRunning(false); }} className={`rounded-2xl border p-4 text-left transition-all ${pattern === id ? "border-sky-400 bg-white/85 text-sky-900 shadow-lg shadow-sky-900/10 ring-2 ring-sky-200/70 dark:border-sky-300/50 dark:bg-sky-300/10 dark:text-sky-100 dark:ring-sky-300/10" : "border-white/80 bg-white/45 text-slate-700 hover:bg-white/75 dark:border-white/10 dark:bg-white/[.04] dark:text-slate-300 dark:hover:bg-white/[.08]"}`}>
                  <span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{cadence} {t("breath.seconds")}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={() => setRunning((value) => !value)} className="col-span-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl !bg-violet-700 px-5 text-base font-semibold !text-white shadow-lg shadow-violet-900/15 transition hover:-translate-y-0.5 hover:!bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 dark:!bg-violet-300 dark:!text-violet-950 dark:hover:!bg-violet-200">{running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}{running ? t("breath.pause") : t("breath.start")}</button>
              <button type="button" onClick={() => { setRunning(false); setPhaseIndex(0); setRemaining(phases[0].seconds); }} className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300/80 bg-white/50 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/[.04] dark:text-slate-200 dark:hover:bg-white/[.08]"><RotateCcw className="h-4 w-4" />{t("breath.reset")}</button>
            </div>
          </section>
        </main>
      </div>
    </div>,
    document.body
  );
}
