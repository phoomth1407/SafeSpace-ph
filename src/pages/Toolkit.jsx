import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Compass, Headphones, Pin, Play, Plus, Sprout, Target, Wind, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const PIN_KEY = "safespace_toolkit_pins_v1";
const GOAL_KEY = "safespace_gentle_goal_v1";
const VALID_TOOLS = ["breathing", "grounding", "thought", "sounds"];
const TONE_CLASSES = {
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
  violet: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
};

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentWeekKey() {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDateKey(monday);
}

function readPins() {
  try {
    const value = JSON.parse(localStorage.getItem(PIN_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id) => VALID_TOOLS.includes(id)) : [];
  } catch {
    return [];
  }
}

function readGoal() {
  try {
    const goal = JSON.parse(localStorage.getItem(GOAL_KEY) || "null");
    if (!goal || typeof goal.title !== "string") return null;
    return {
      title: goal.title.slice(0, 80),
      target: Math.min(7, Math.max(1, Number(goal.target) || 2)),
      count: goal.weekKey === currentWeekKey() ? Math.max(0, Number(goal.count) || 0) : 0,
      weekKey: currentWeekKey(),
    };
  } catch {
    return null;
  }
}

export default function Toolkit() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const en = lang === "en";
  const [pins, setPins] = useState(readPins);
  const [goal, setGoal] = useState(readGoal);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("2");
  const weekKey = currentWeekKey();

  useEffect(() => {
    try { localStorage.setItem(PIN_KEY, JSON.stringify(pins)); } catch { /* Keep pins in memory for this visit. */ }
  }, [pins]);

  useEffect(() => {
    try {
      if (goal) localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
      else localStorage.removeItem(GOAL_KEY);
    } catch { /* Keep the current goal in memory for this visit. */ }
  }, [goal]);

  const tools = [
    { id: "breathing", title: t("breath.title"), description: en ? "Follow a gentle breathing rhythm." : "ฝึกตามจังหวะหายใจอย่างอ่อนโยน", icon: Wind, tone: "sky" },
    { id: "grounding", title: t("ground.title"), description: en ? "Reconnect with what is around you." : "กลับมาเชื่อมโยงกับสิ่งรอบตัว", icon: Compass, tone: "emerald" },
    { id: "thought", title: t("worry.title"), description: en ? "Write down a thought and choose how to release it." : "เขียนความคิดแล้วเลือกวิธีวางพักไว้", icon: Sprout, tone: "violet" },
    { id: "sounds", title: en ? "Ambient sounds" : "เสียงบรรยากาศ", description: en ? "Mix rain, ocean, forest, and other sounds." : "ผสมเสียงฝน ทะเล ป่า และเสียงอื่น ๆ", icon: Headphones, tone: "amber" },
  ];
  const pinnedTools = pins.map((id) => tools.find((tool) => tool.id === id)).filter(Boolean);
  const availableTools = tools.filter((tool) => !pins.includes(tool.id));
  const currentGoalCount = goal?.weekKey === weekKey ? goal.count : 0;

  const togglePin = (id) => setPins((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]);

  const launchTool = (id) => navigate("/", { state: { safeSpaceOpenTool: id } });

  const startGoalEdit = () => {
    setGoalTitle(goal?.title || (en ? "Use a tool that feels helpful" : "ลองใช้เครื่องมือที่รู้สึกว่าเป็นประโยชน์"));
    setGoalTarget(String(goal?.target || 2));
    setEditingGoal(true);
  };

  const saveGoal = (event) => {
    event.preventDefault();
    const title = goalTitle.trim().slice(0, 80);
    if (!title) return;
    setGoal({ title, target: Math.min(7, Math.max(1, Number(goalTarget) || 1)), count: goal?.weekKey === weekKey ? goal.count : 0, weekKey });
    setEditingGoal(false);
  };

  const logSmallStep = () => setGoal((current) => current
    ? { ...current, count: (current.weekKey === weekKey ? current.count : 0) + 1, weekKey }
    : current);

  const renderToolCard = (tool, isPinned) => {
    const Icon = tool.icon;
    return <article key={tool.id} className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${TONE_CLASSES[tool.tone]}`}><Icon className="h-5 w-5" /></div>
        <button type="button" onClick={() => togglePin(tool.id)} aria-pressed={isPinned} aria-label={isPinned ? (en ? `Unpin ${tool.title}` : `เลิกปักหมุด${tool.title}`) : (en ? `Pin ${tool.title}` : `ปักหมุด${tool.title}`)} className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition-colors ${isPinned ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-400/30 dark:bg-violet-400/10 dark:text-violet-200" : "border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-300"}`}>
          <Pin className="h-3.5 w-3.5" />{isPinned ? (en ? "Pinned" : "ปักหมุดแล้ว") : (en ? "Pin" : "ปักหมุด")}
        </button>
      </div>
      <div className="mt-5"><h3 className="font-semibold text-slate-900 dark:text-white">{tool.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{tool.description}</p></div>
      <button type="button" onClick={() => launchTool(tool.id)} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"><Play className="h-4 w-4" />{en ? "Open tool" : "เปิดเครื่องมือ"}</button>
    </article>;
  };

  return <div className="mx-auto max-w-5xl space-y-7 pb-8">
    <header className="flex items-center gap-4 pt-1">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-200"><Pin className="h-6 w-6" /></div>
      <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-violet-600 dark:text-violet-300">SafeSpace</p><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{en ? "My toolkit" : "ชุดเครื่องมือของฉัน"}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{en ? "Keep the tools you like close by." : "เก็บเครื่องมือที่ชอบไว้ใกล้มือ"}</p></div>
    </header>

    <section className="space-y-4" aria-labelledby="pinned-tools-title">
      <div><h2 id="pinned-tools-title" className="text-lg font-bold text-slate-900 dark:text-white">{en ? "Quick access" : "เข้าถึงด่วน"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{en ? "Pin a tool and it will appear here for one-tap access." : "ปักหมุดเครื่องมือเพื่อให้แสดงที่นี่และเปิดใช้ได้ทันที"}</p></div>
      {pinnedTools.length ? <div className="grid gap-3 sm:grid-cols-2">{pinnedTools.map((tool) => renderToolCard(tool, true))}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white/45 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-white/[.03] dark:text-slate-400">{en ? "Your pinned tools will show here. Choose one below to get started." : "เครื่องมือที่ปักหมุดจะแสดงที่นี่ เลือกเครื่องมือด้านล่างเพื่อเริ่มต้น"}</div>}
    </section>

    {availableTools.length > 0 && <section className="space-y-4" aria-labelledby="available-tools-title">
      <div><h2 id="available-tools-title" className="text-lg font-bold text-slate-900 dark:text-white">{en ? "Choose tools to pin" : "เลือกเครื่องมือเพื่อปักหมุด"}</h2></div>
      <div className="grid gap-3 sm:grid-cols-2">{availableTools.map((tool) => renderToolCard(tool, false))}</div>
    </section>}

    <section className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-white/90 to-emerald-50/70 p-5 shadow-sm dark:border-emerald-300/10 dark:from-slate-900/80 dark:to-emerald-950/30 md:p-7" aria-labelledby="gentle-goal-title">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"><Target className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><h2 id="gentle-goal-title" className="text-lg font-bold text-slate-900 dark:text-white">{en ? "A gentle goal" : "เป้าหมายเล็ก ๆ ที่ยืดหยุ่นได้"}</h2><p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{en ? "Set an intention for this week. You can change or pause it at any time—there are no streaks." : "ตั้งใจทำสิ่งเล็ก ๆ ในสัปดาห์นี้ เปลี่ยนหรือพักเป้าหมายได้เสมอ โดยไม่มีสถิติวันที่ขาด"}</p></div>
      </div>

      {editingGoal ? <form onSubmit={saveGoal} className="mt-5 space-y-4 rounded-2xl bg-white/75 p-4 dark:bg-slate-950/40">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{en ? "My intention" : "สิ่งที่ตั้งใจทำ"}<input value={goalTitle} onChange={(event) => setGoalTitle(event.target.value)} maxLength={80} required className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/60 dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder={en ? "For example, take a short pause" : "เช่น พักใจสั้น ๆ สักครั้ง"} /></label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">{en ? "A flexible weekly target" : "จำนวนครั้งที่ยืดหยุ่นต่อสัปดาห์"}<select value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white">{[1, 2, 3, 4, 5, 6, 7].map((count) => <option key={count} value={count}>{count} {en ? (count === 1 ? "time a week" : "times a week") : "ครั้งต่อสัปดาห์"}</option>)}</select></label>
        <div className="flex flex-wrap gap-2"><button type="submit" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200"><Check className="h-4 w-4" />{en ? "Save goal" : "บันทึกเป้าหมาย"}</button><button type="button" onClick={() => setEditingGoal(false)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5"><X className="h-4 w-4" />{en ? "Cancel" : "ยกเลิก"}</button></div>
      </form> : goal ? <div className="mt-5 rounded-2xl bg-white/75 p-4 dark:bg-slate-950/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-semibold text-slate-900 dark:text-white">{goal.title}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{en ? `${currentGoalCount} of ${goal.target} small steps this week` : `ทำไป ${currentGoalCount} จาก ${goal.target} ครั้งในสัปดาห์นี้`}</p></div><button type="button" onClick={startGoalEdit} className="min-h-9 self-start rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5">{en ? "Adjust goal" : "ปรับเป้าหมาย"}</button></div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950"><div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 dark:bg-emerald-300" style={{ width: `${Math.min(100, (currentGoalCount / goal.target) * 100)}%` }} role="progressbar" aria-label={en ? "Weekly goal progress" : "ความคืบหน้าเป้าหมายประจำสัปดาห์"} aria-valuemin={0} aria-valuemax={goal.target} aria-valuenow={Math.min(currentGoalCount, goal.target)} /></div>
        {currentGoalCount >= goal.target && <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-200">{en ? "You reached this week's intention. It is okay to adjust or pause it." : "ทำตามความตั้งใจของสัปดาห์นี้ได้แล้ว จะปรับหรือพักเป้าหมายก็ได้"}</p>}
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={logSmallStep} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200"><Plus className="h-4 w-4" />{en ? "Log a small step" : "บันทึกก้าวเล็ก ๆ"}</button><button type="button" onClick={() => setGoal(null)} className="min-h-10 rounded-xl px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5">{en ? "Pause goal" : "พักเป้าหมาย"}</button></div>
      </div> : <button type="button" onClick={startGoalEdit} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-300 dark:text-emerald-950 dark:hover:bg-emerald-200"><Plus className="h-4 w-4" />{en ? "Set a gentle goal" : "ตั้งเป้าหมายเล็ก ๆ"}</button>}
      <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{en ? "Your pins and goal stay in this browser on this device." : "รายการปักหมุดและเป้าหมายจะเก็บไว้ในเบราว์เซอร์ของอุปกรณ์นี้"}</p>
    </section>
  </div>;
}
