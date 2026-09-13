import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X, Wind, Cloud, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const MODES = [
  { id: "lantern", icon: "🏮", iconComponent: Sparkles },
  { id: "leaves", icon: "🍃", iconComponent: Wind },
  { id: "stardust", icon: "✨", iconComponent: Star },
];

export default function WorryReleaseModal({ open, onClose }) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [mode, setMode] = useState("lantern");
  const [released, setReleased] = useState(false);

  useEffect(() => {
    if (!open) {
      setText("");
      setMode("lantern");
      setReleased(false);
    }
  }, [open]);

  if (!open) return null;

  const release = () => {
    if (!text.trim()) return;
    setReleased(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button aria-label={t("worry.close")} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900">
          <X className="w-5 h-5" />
        </button>

        {!released ? (
          <>
            <div className="text-center pt-1">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✨</span>
              </div>
              <h2 className="text-xl font-semibold !text-slate-900 dark:!text-slate-100">{t("worry.title")}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t("worry.subtitle")}</p>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              rows={5}
              placeholder={t("worry.placeholder")}
              className="mt-5 w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-black dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-violet-300/50"
            />

            <div className="mt-4">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">{t("worry.chooseMode")}</div>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map(({ id, icon }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`rounded-2xl border p-3 text-center transition-colors ${mode === id ? "bg-violet-500/10 border-violet-400/40" : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
                  >
                    <div className="text-2xl">{icon}</div>
                    <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1">{t(`worry.mode.${id}`)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-500 dark:text-slate-400 text-right">{text.length}/500</div>

            <button
              onClick={release}
              disabled={!text.trim()}
              className="w-full mt-4 h-12 rounded-2xl !bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900 font-semibold disabled:opacity-40 transition-opacity"
            >
              {t("worry.release")}
            </button>
          </>
        ) : (
          <div className="relative min-h-[360px] flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/2 top-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/30 dark:bg-violet-500/20 blur-2xl animate-pulse" />
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-violet-300/70 dark:bg-violet-300/40 animate-ping"
                  style={{
                    left: `${10 + ((i * 37) % 80)}%`,
                    top: `${10 + ((i * 53) % 80)}%`,
                    animationDelay: `${i * 70}ms`,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="relative text-6xl mb-5"
              initial={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={
                mode === "lantern"
                  ? { y: -120, opacity: 0.15, scale: 0.75, rotate: -4 }
                  : mode === "leaves"
                    ? { x: 150, y: -35, opacity: 0.08, rotate: 28 }
                    : { y: -20, opacity: 0, scale: 0.35, rotate: 180 }
              }
              transition={{ duration: 3.2, ease: "easeOut" }}
            >
              {MODES.find((m) => m.id === mode)?.icon}
            </motion.div>

            <motion.div
              className="relative w-full max-w-sm mb-4 min-h-16 flex items-center justify-center"
              initial="hidden"
              animate="visible"
            >
              {Array.from({ length: mode === "stardust" ? 24 : 10 }).map((_, i) => (
                <motion.span
                  key={`release-particle-${i}`}
                  className={`absolute rounded-full ${mode === "lantern" ? "bg-amber-300" : mode === "leaves" ? "bg-emerald-300" : "bg-violet-300"}`}
                  style={{
                    width: mode === "stardust" ? 4 : 5,
                    height: mode === "stardust" ? 4 : 5,
                    left: `${45 + ((i * 17) % 20)}%`,
                    top: `${45 + ((i * 29) % 16)}%`,
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{
                    opacity: [0, 0.9, 0],
                    x: (i % 2 ? 1 : -1) * (35 + (i % 5) * 14),
                    y: -30 - (i % 6) * 12,
                    scale: [0.4, 1, 0.2],
                  }}
                  transition={{ duration: 2.6 + (i % 4) * 0.2, delay: i * 0.04, ease: "easeOut" }}
                />
              ))}
            </motion.div>

            <motion.h3
              className="relative text-xl font-semibold !text-slate-900 dark:!text-slate-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              {t("worry.releasedTitle")}
            </motion.h3>
            <motion.p
              className="relative max-w-sm text-sm !text-slate-800 dark:!text-slate-300 mt-2 leading-relaxed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15, duration: 0.7 }}
            >
              {t(`worry.releaseMessage.${mode}`)}
            </motion.p>

            <button
              onClick={onClose}
              className="relative w-full mt-7 h-11 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              {t("worry.close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
