import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Wind, Play, Pause, RotateCcw } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button aria-label={t("breath.close")} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center mx-auto mb-3">
            <Wind className="w-5 h-5 text-sky-700 dark:text-sky-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t("breath.title")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("breath.subtitle")}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {[
            ["box", t("breath.box")],
            ["sleep", t("breath.sleep")],
            ["coherent", t("breath.coherent")],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setPattern(id); setRunning(false); }}
              className={`px-3 py-2 rounded-full text-xs border transition-colors ${pattern === id ? "bg-sky-500/10 border-sky-400/30 text-sky-700 dark:text-sky-300" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative h-64 flex items-center justify-center">
          <div
            className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-sky-300/40 via-cyan-300/30 to-rose-300/30 dark:from-sky-500/30 dark:via-cyan-500/20 dark:to-rose-500/20 blur-xl transition-transform duration-1000"
            style={{ transform: `scale(${scale})` }}
          />
          <div
            className="relative w-36 h-36 rounded-full bg-gradient-to-br from-sky-100 to-rose-100 dark:from-sky-950/70 dark:to-rose-950/70 border border-sky-300/50 dark:border-sky-500/30 flex flex-col items-center justify-center shadow-inner"
            style={{ transform: `scale(${scale})`, transition: "transform 900ms ease-in-out" }}
          >
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t(`breath.phase.${phase.key}`)}</span>
            <span className="text-4xl font-bold text-sky-700 dark:text-sky-300 mt-1">{remaining}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{t("breath.seconds")}</span>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 -mt-2">
          {t("breath.cycleTip")}
        </div>

        <button
          onClick={() => setRunning((v) => !v)}
          className="w-full mt-4 h-12 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold flex items-center justify-center gap-2 hover:opacity-90"
        >
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {running ? t("breath.pause") : t("breath.start")}
        </button>
        <button
          onClick={() => { setRunning(false); setPhaseIndex(0); setRemaining(phases[0].seconds); }}
          className="w-full mt-2 h-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {t("breath.reset")}
        </button>
      </div>
    </div>
  );
}
