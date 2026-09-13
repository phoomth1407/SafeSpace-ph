import React, { useMemo, useState } from "react";
import { Smile, Meh, Frown, HeartCrack, CloudRain, SunMedium } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const MOODS = [
  { id:"great", icon:SunMedium, emoji:"😊", color:"text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
  { id:"good", icon:Smile, emoji:"🙂", color:"text-sky-300 bg-sky-500/10 border-sky-500/20" },
  { id:"okay", icon:Meh, emoji:"😐", color:"text-slate-300 bg-slate-500/10 border-slate-500/20" },
  { id:"worried", icon:CloudRain, emoji:"😟", color:"text-amber-300 bg-amber-500/10 border-amber-500/20" },
  { id:"sad", icon:Frown, emoji:"😔", color:"text-blue-300 bg-blue-500/10 border-blue-500/20" },
  { id:"stressed", icon:CloudRain, emoji:"😣", color:"text-orange-300 bg-orange-500/10 border-orange-500/20" },
  { id:"heavy", icon:HeartCrack, emoji:"😞", color:"text-rose-300 bg-rose-500/10 border-rose-500/20" },
];

const FACTORS = ["study","family","friends","sleep","health","relationships","other"];

export default function MoodCheckInCard() {
  const { t, lang } = useTranslation();
  const [mood, setMood] = useState(() => localStorage.getItem("safespace_mood") || "");
  const [factor, setFactor] = useState(() => localStorage.getItem("safespace_mood_factor") || "");
  const [saved, setSaved] = useState(Boolean(localStorage.getItem("safespace_mood")));
  const selected = useMemo(() => MOODS.find((m) => m.id === mood), [mood]);

  const save = () => {
    if (!mood) return;
    localStorage.setItem("safespace_mood", mood);
    if (factor) localStorage.setItem("safespace_mood_factor", factor);
    else localStorage.removeItem("safespace_mood_factor");
    setSaved(true);
  };

  return (
    <section className="bg-white dark:bg-slate-900/60 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t("mood.title")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t("mood.subtitle")}</p>
        </div>
        {saved && <span className="text-xs text-emerald-600 dark:text-emerald-300">{t("mood.saved")}</span>}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-4">
        {MOODS.map((item) => {
          const Icon=item.icon;
          const active=mood===item.id;
          return (
            <button
              key={item.id}
              onClick={()=>{ setMood(item.id); setSaved(false); }}
              className={`rounded-2xl border p-2.5 transition-all ${active ? item.color+" ring-2 ring-rose-300/30" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700"}`}
              aria-label={t(`mood.${item.id}`)}
            >
              <div className="text-2xl">{item.emoji}</div>
              <div className="mt-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">{t(`mood.${item.id}`)}</div>
              <Icon className="w-3.5 h-3.5 mx-auto mt-1 opacity-70" />
            </button>
          );
        })}
      </div>

      {mood && (
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">{t("mood.factorTitle")}</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {FACTORS.map((id)=>(
              <button
                key={id}
                onClick={()=>setFactor(factor===id ? "" : id)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${factor===id ? "bg-rose-500/10 border-rose-400/30 text-rose-700 dark:text-rose-300" : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}
              >
                {t(`mood.factor.${id}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">{selected ? t(`mood.insight.${mood}`) : ""}</p>
            <button onClick={save} className="shrink-0 px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:opacity-90">
              {t("mood.save")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
