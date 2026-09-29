import React, { useMemo, useState } from "react";
import { Smile, Meh, Frown, HeartCrack, CloudRain, SunMedium, Flame, Check, Sparkles } from "lucide-react";
import { MoodIllustration } from "@/components/WellnessIllustration";
import { useTranslation } from "@/lib/i18n";

const MOODS = [
  { id: "great", icon: SunMedium, color: "text-emerald-500 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
  { id: "good", icon: Smile, color: "text-sky-500 dark:text-sky-300 bg-sky-500/10 border-sky-500/20" },
  { id: "okay", icon: Meh, color: "text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/20" },
  { id: "worried", icon: CloudRain, color: "text-amber-500 dark:text-amber-300 bg-amber-500/10 border-amber-500/20" },
  { id: "sad", icon: Frown, color: "text-blue-500 dark:text-blue-300 bg-blue-500/10 border-blue-500/20" },
  { id: "stressed", icon: CloudRain, color: "text-orange-500 dark:text-orange-300 bg-orange-500/10 border-orange-500/20" },
  { id: "heavy", icon: HeartCrack, color: "text-rose-500 dark:text-rose-300 bg-rose-500/10 border-rose-500/20" },
];

const FACTORS = ["study", "family", "friends", "sleep", "health", "relationships", "other"];

const DAY_LABELS = {
  th: ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};

function getWeekDays() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (currentDay + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      dateStr,
      dayNumber: d.getDate(),
      isToday: dateStr === now.toISOString().slice(0, 10),
      isPast: d < new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    });
  }
  return days;
}

export default function MoodCheckInCard() {
  const { t, lang } = useTranslation();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("safespace_mood_history");
      if (stored) return JSON.parse(stored);
      // Migrate legacy single mood if present
      const legacyMood = localStorage.getItem("safespace_mood");
      const legacyFactor = localStorage.getItem("safespace_mood_factor");
      if (legacyMood) {
        return { [todayStr]: { mood: legacyMood, factor: legacyFactor || "" } };
      }
    } catch {}
    return {};
  });

  const todayEntry = history[todayStr];
  const [mood, setMood] = useState(() => todayEntry?.mood || localStorage.getItem("safespace_mood") || "");
  const [factor, setFactor] = useState(() => todayEntry?.factor || localStorage.getItem("safespace_mood_factor") || "");
  const [saved, setSaved] = useState(() => Boolean(todayEntry?.mood));
  const [isEditing, setIsEditing] = useState(() => !todayEntry?.mood);

  const selected = useMemo(() => MOODS.find((m) => m.id === mood), [mood]);
  const weekDays = useMemo(() => getWeekDays(), [todayStr]);

  // Calculate current streak
  const streak = useMemo(() => {
    let count = 0;
    const checkDate = new Date();
    // Check backwards day by day
    for (let i = 0; i < 30; i++) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (history[dStr]?.mood) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0 && !history[dStr]?.mood) {
        // Today not logged yet, check yesterday to continue yesterday's streak
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [history]);

  const save = () => {
    if (!mood) return;
    const updated = {
      ...history,
      [todayStr]: { mood, factor, timestamp: Date.now() },
    };
    setHistory(updated);
    try {
      localStorage.setItem("safespace_mood_history", JSON.stringify(updated));
      localStorage.setItem("safespace_mood", mood);
      if (factor) localStorage.setItem("safespace_mood_factor", factor);
      else localStorage.removeItem("safespace_mood_factor");
    } catch {}
    setSaved(true);
    setIsEditing(false);
  };

  const dayNames = DAY_LABELS[lang] || DAY_LABELS.th;

  return (
    <section className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all">
      {/* Top Header & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-100">
              {t("mood.title")}
            </h2>
            {saved && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3" />
                {t("mood.saved")}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("mood.subtitle")}
          </p>
        </div>

        {/* 7-Day Mini Streak Strip */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 dark:bg-slate-950/50 px-3 py-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1 mr-2 text-xs font-semibold text-amber-500 dark:text-amber-400">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}</span>
            <span className="text-[10px] text-slate-400 font-normal">
              {lang === "en" ? "days" : "วัน"}
            </span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mr-1" />
          <div className="flex items-center gap-1">
            {weekDays.map((d, idx) => {
              const hasCheckIn = Boolean(history[d.dateStr]?.mood);
              return (
                <div key={d.dateStr} className="flex flex-col items-center">
                  <span className="text-[9px] font-medium text-slate-400 mb-0.5">
                    {dayNames[idx]}
                  </span>
                  <div
                    title={`${d.dateStr}${hasCheckIn ? ": " + history[d.dateStr].mood : ""}`}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                      hasCheckIn
                        ? "bg-emerald-500 text-white font-bold shadow-xs"
                        : d.isToday
                        ? "border-2 border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold"
                        : "bg-slate-200/60 dark:bg-slate-800/60 text-slate-400"
                    }`}
                  >
                    {hasCheckIn ? "✓" : d.dayNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mood Selector (Interactive Grid) */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-4">
        {MOODS.map((item) => {
          const Icon = item.icon;
          const active = mood === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMood(item.id);
                setSaved(false);
                setIsEditing(true);
              }}
              className={`rounded-2xl border p-2 text-center transition-all ${
                active
                  ? item.color + " ring-2 ring-rose-400/30 scale-[1.03] shadow-sm"
                  : "border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]"
              }`}
              aria-label={t(`mood.${item.id}`)}
            >
              <div className="w-9 h-9 mx-auto rounded-xl overflow-hidden">
                <MoodIllustration mood={item.id} className="w-full h-full" />
              </div>
              <div className="mt-1 text-[10px] font-medium text-slate-700 dark:text-slate-200 truncate">
                {t(`mood.${item.id}`)}
              </div>
              <Icon className="w-3 h-3 mx-auto mt-0.5 opacity-60 text-slate-500 dark:text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* Factor and Save Panel */}
      {mood && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {t("mood.factorTitle")}
            </label>
            {selected && (
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                "{t(`mood.insight.${mood}`)}"
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {FACTORS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFactor(factor === id ? "" : id);
                  setSaved(false);
                  setIsEditing(true);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  factor === id
                    ? "bg-rose-500/10 border-rose-400/40 text-rose-600 dark:text-rose-300"
                    : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {t(`mood.factor.${id}`)}
              </button>
            ))}

            <div className="ml-auto mt-2 sm:mt-0 flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                disabled={saved && !isEditing}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  saved && !isEditing
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default"
                    : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 active:scale-95"
                }`}
              >
                {saved && !isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    {t("mood.saved")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("mood.save")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
