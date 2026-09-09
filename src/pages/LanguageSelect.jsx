import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Globe, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function LanguageSelect() {
  const { setLang, t } = useTranslation();
  const [selected, setSelected] = useState(null);

  const choose = (lang) => setSelected(lang);

  const confirm = () => {
    if (selected) setLang(selected);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md text-center space-y-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/80 to-sky-500/80 flex items-center justify-center mx-auto"
        >
          <Heart className="w-8 h-8 text-white" fill="white" />
        </motion.div>

        <div>
          <h1 className="text-3xl font-bold text-slate-100">{t("lang.title")}</h1>
          <p className="text-sm text-slate-400 mt-2">{t("lang.subtitle")}</p>
          <p className="text-xs text-slate-500 mt-1 italic">{t("lang.tagline")}</p>
        </div>

        {/* Language options */}
        <div className="space-y-3">
          {[
            { code: "th", label: t("lang.thai"), flag: "🇹🇭" },
            { code: "en", label: t("lang.english"), flag: "🇺🇸" },
          ].map((opt) => (
            <motion.button
              key={opt.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => choose(opt.code)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                selected === opt.code
                  ? "border-rose-400/60 bg-rose-500/10 text-slate-100"
                  : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
              }`}
            >
              <span className="text-2xl">{opt.flag}</span>
              <span className="flex-1 text-left text-sm font-medium">{opt.label}</span>
              <Globe className="w-4 h-4 opacity-50" />
              {selected === opt.code && (
                <div className="w-5 h-5 rounded-full bg-rose-500/30 border border-rose-400/60 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-rose-300" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: selected ? 1.02 : 1 }}
          whileTap={{ scale: selected ? 0.98 : 1 }}
          onClick={confirm}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3.5 rounded-2xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {t("lang.continue")}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
}
