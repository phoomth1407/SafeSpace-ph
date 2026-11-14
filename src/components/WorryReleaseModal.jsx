import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Bubbles, Check, Cloud, CloudFog, CloudRain, Flower2, Heart, LockKeyhole, MoonStar, Sparkles, Tornado, Waves, Wind, X } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import ThoughtReleaseScene from "@/components/ThoughtReleaseScene";

const FEELINGS = [
  { id: "heavy", icon: CloudRain, color: "from-sky-100 to-indigo-100 text-sky-700 dark:from-sky-300/15 dark:to-indigo-300/10 dark:text-sky-200", en: "Heavy", th: "หนักใจ" },
  { id: "anxious", icon: Tornado, color: "from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-300/15 dark:to-fuchsia-300/10 dark:text-violet-200", en: "Anxious", th: "กังวล" },
  { id: "sad", icon: MoonStar, color: "from-amber-100 to-rose-100 text-amber-700 dark:from-amber-300/15 dark:to-rose-300/10 dark:text-amber-200", en: "Sad", th: "เศร้า" },
  { id: "tired", icon: Bubbles, color: "from-cyan-100 to-sky-100 text-cyan-700 dark:from-cyan-300/15 dark:to-sky-300/10 dark:text-cyan-200", en: "Tired", th: "เหนื่อย" },
  { id: "unsure", icon: CloudFog, color: "from-slate-100 to-blue-100 text-slate-600 dark:from-slate-300/15 dark:to-blue-300/10 dark:text-slate-200", en: "Not sure", th: "ไม่แน่ใจ" },
];

const RITUALS = [
  { id: "wind", icon: Wind, en: "Let the wind carry it", th: "ฝากสายลมพาไป", iconStyle: "bg-sky-100 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200" },
  { id: "river", icon: Waves, en: "Float it down a river", th: "ปล่อยให้ลอยไปกับสายน้ำ", iconStyle: "bg-cyan-100 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-200" },
  { id: "garden", icon: Flower2, en: "Plant it in a garden", th: "วางไว้ในสวนเงียบ ๆ", iconStyle: "bg-emerald-100 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200" },
  { id: "starlight", icon: Sparkles, en: "Turn it into starlight", th: "เปลี่ยนเป็นแสงดาว", iconStyle: "bg-violet-100 text-violet-700 dark:bg-violet-300/10 dark:text-violet-200" },
];

const NEXT_STEPS = [
  { id: "breathe", en: "Take three slow breaths", th: "หายใจช้า ๆ สามครั้ง", icon: Wind },
  { id: "water", en: "Get a glass of water", th: "ดื่มน้ำสักแก้ว", icon: Waves },
  { id: "reach", en: "Reach out to someone", th: "ทักหาคนที่ไว้ใจ", icon: Heart },
];

export default function WorryReleaseModal({ open, onClose }) {
  const { lang } = useTranslation();
  const en = lang === "en";
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [feeling, setFeeling] = useState("heavy");
  const [thought, setThought] = useState("");
  const [ritual, setRitual] = useState("wind");
  const [nextStep, setNextStep] = useState(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const copy = {
    eyebrow: en ? "A SMALL PAUSE FOR YOU" : "พักใจสักครู่",
    title: en ? "Let the thought rest" : "พักความคิดไว้ก่อน",
    intro: en ? "You don't have to solve it right now. We'll make a little room around it." : "ตอนนี้ยังไม่ต้องแก้ทุกอย่างก็ได้ เรามาลองเว้นที่ว่างให้ความคิดนี้สักนิด",
    feelingTitle: en ? "What feels closest right now?" : "ตอนนี้รู้สึกใกล้เคียงกับข้อไหนที่สุด?",
    feelingHint: en ? "It's okay if you can't name it." : "ถ้ายังบอกไม่ถูกก็ไม่เป็นไร",
    thoughtTitle: en ? "Give the thought a place to land" : "เขียนความคิดให้มีที่วาง",
    thoughtHint: en ? "Write a few words, a sentence, or just the part that keeps returning." : "เขียนสั้น ๆ สักคำ ประโยค หรือเฉพาะส่วนที่วนกลับมาในใจ",
    placeholder: en ? "If I could put one thing down for a moment, it would be…" : "ถ้าพักเรื่องหนึ่งไว้ก่อนได้ เรื่องนั้นคือ…",
    private: en ? "This stays in this moment and is cleared when you close the exercise." : "ข้อความนี้อยู่แค่ในหน้าต่างนี้ และจะถูกล้างเมื่อปิดกิจกรรม",
    choose: en ? "Choose how you'd like to set it down" : "เลือกวิธีวางความคิดนี้ลงชั่วคราว",
    release: en ? "Release this thought" : "ปล่อยความคิดนี้ไป",
    breathe: en ? "Take one easy breath" : "หายใจสบาย ๆ หนึ่งครั้ง",
    doneTitle: en ? "You made a little space" : "คุณสร้างพื้นที่ว่างให้ใจได้แล้ว",
    doneText: en ? "The thought can still be there, and you can still take a gentle next step." : "ความคิดอาจยังอยู่ตรงนั้น และคุณก็ยังเลือกก้าวต่อไปอย่างอ่อนโยนได้",
    nextTitle: en ? "What would feel kind to do next?" : "ต่อจากนี้ อยากดูแลตัวเองแบบไหนดี?",
    finish: en ? "Finish this pause" : "จบช่วงพักใจ",
    restart: en ? "Try another thought" : "ลองพักกับอีกความคิด",
    close: en ? "Close exercise" : "ปิดกิจกรรม",
    continue: en ? "Continue" : "ต่อไป",
    step: en ? "Step" : "ขั้นตอน",
  };

  useEffect(() => {
    if (!open) {
      setStep(0);
      setFeeling("heavy");
      setThought("");
      setRitual("wind");
      setNextStep(null);
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => { if (event.key === "Escape") onCloseRef.current?.(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const closeAndClear = () => {
    setThought("");
    onCloseRef.current?.();
  };

  const stepLabels = en ? ["Notice", "Name it", "Choose", "Pause"] : ["สำรวจใจ", "เขียนออกมา", "เลือกวิธี", "พักสักครู่"];

  return createPortal(
    <div className="wellness-modal-root fixed inset-0 z-[200] flex h-[100dvh] w-screen items-center justify-center p-0">
      <button type="button" aria-label={copy.close} onClick={closeAndClear} className="wellness-modal-backdrop absolute inset-0" />
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="thought-rest-title"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative flex h-[100dvh] max-h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none border-0 bg-[#f8f7ff] text-slate-900 shadow-none dark:bg-[#0f1329] dark:text-white"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-rose-300/35 blur-3xl dark:bg-rose-500/15" />
          <div className="absolute -right-16 top-12 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl dark:bg-violet-500/20" />
          <div className="absolute bottom-[-11rem] left-[28%] h-80 w-80 rounded-full bg-violet-300/35 blur-3xl dark:bg-sky-500/15" />
        </div>

        <header className="relative z-10 flex items-center justify-between gap-4 border-b border-slate-200/70 px-5 py-4 dark:border-white/10 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 text-violet-600 shadow-sm ring-1 ring-white dark:bg-white/10 dark:text-violet-200 dark:ring-white/10"><Cloud className="h-6 w-6" /></div>
            <div className="min-w-0"><p className="text-[10px] font-bold tracking-[.18em] text-violet-600 dark:text-violet-300">{copy.eyebrow}</p><h2 id="thought-rest-title" className="truncate text-lg font-bold sm:text-xl">{copy.title}</h2></div>
          </div>
          <button type="button" aria-label={copy.close} onClick={closeAndClear} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-white/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"><X className="h-5 w-5" /></button>
        </header>

        {step < 3 && (
          <div className="relative z-10 px-5 pt-4 sm:px-8">
            <div className="flex items-center gap-2" aria-label={`${copy.step} ${step + 1} ${en ? "of 3" : "จาก 3"}`}>
              {stepLabels.slice(0, 3).map((label, index) => <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5 text-[10px] font-semibold sm:text-xs ${index <= step ? "text-violet-700 dark:text-violet-200" : "text-slate-400"}`}><span className={`grid h-6 w-6 place-items-center rounded-full ${index < step ? "bg-violet-600 text-white" : index === step ? "bg-white text-violet-700 ring-2 ring-violet-400 dark:bg-violet-300 dark:text-violet-950" : "bg-slate-200/70 dark:bg-white/10"}`}>{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="hidden sm:inline">{label}</span></div>
                {index < 2 && <div className={`h-px flex-1 ${index < step ? "bg-violet-400" : "bg-slate-300/70 dark:bg-white/10"}`} />}
              </React.Fragment>)}
            </div>
          </div>
        )}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && <motion.div key="feeling" initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -14 }} transition={{ duration: 0.22 }}>
              <div className="mx-auto max-w-xl text-center"><p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500 dark:text-slate-400">{en ? "A gentle check-in" : "สำรวจใจเบา ๆ"}</p><h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{copy.feelingTitle}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{copy.intro}</p></div>
              <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5">
                {FEELINGS.map((item) => { const FeelingIcon = item.icon; return <button key={item.id} type="button" aria-pressed={feeling === item.id} onClick={() => setFeeling(item.id)} className={`group rounded-2xl border px-3 py-4 text-center transition-all ${feeling === item.id ? "border-violet-400 bg-white/90 shadow-lg shadow-violet-900/10 ring-2 ring-violet-300/50 dark:border-violet-300/70 dark:bg-white/10" : "border-white/80 bg-white/45 hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[.04] dark:hover:bg-white/[.08]"}`}><span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br shadow-sm transition-transform group-hover:scale-110 ${item.color}`} aria-hidden="true"><FeelingIcon className="h-6 w-6" strokeWidth={1.8} /></span><span className="mt-2 block text-xs font-semibold">{en ? item.en : item.th}</span></button>; })}
              </div>
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">{copy.feelingHint}</p>
              <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/80 bg-white/55 p-5 dark:border-white/10 dark:bg-white/[.04]"><p className="text-sm font-semibold">{en ? "For this moment, you can…" : "ในช่วงเวลานี้ คุณเลือกได้ที่จะ…"}</p><p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{en ? "Pause without judging yourself. You are more than the thought passing through." : "พักโดยไม่ต้องตัดสินตัวเอง คุณเป็นมากกว่าความคิดที่กำลังผ่านเข้ามา"}</p></div>
            </motion.div>}

            {step === 1 && <motion.div key="write" initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -14 }} transition={{ duration: 0.22 }} className="mx-auto max-w-2xl">
              <div className="mb-5"><span className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-300/10 dark:text-violet-200"><LockKeyhole className="h-3.5 w-3.5" />{en ? "Just for you" : "สำหรับคุณเท่านั้น"}</span><h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{copy.thoughtTitle}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.thoughtHint}</p></div>
              <div className="rounded-[1.7rem] border border-white/90 bg-white/80 p-3 shadow-xl shadow-violet-950/5 dark:border-white/10 dark:bg-white/[.06] sm:p-4"><textarea autoFocus value={thought} onChange={(event) => setThought(event.target.value)} maxLength={500} rows={7} placeholder={copy.placeholder} className="w-full resize-none rounded-[1.25rem] border-0 bg-transparent p-4 text-base leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-violet-300/60 dark:text-slate-100 dark:placeholder:text-slate-500" /><div className="flex items-center justify-between gap-3 px-4 pb-2"><p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"><LockKeyhole className="h-3.5 w-3.5" />{copy.private}</p><span className="shrink-0 text-[11px] tabular-nums text-slate-400">{thought.length}/500</span></div></div>
              <div className="mt-4 flex flex-wrap gap-2">{(en ? ["What feels out of my hands?", "What do I wish someone knew?", "What can wait until later?"] : ["อะไรที่ควบคุมไม่ได้ตอนนี้?", "อยากให้ใครเข้าใจเรื่องอะไร?", "มีอะไรที่รอไว้ก่อนได้บ้าง?"]).map((prompt) => <button type="button" key={prompt} onClick={() => setThought((current) => current ? `${current}\n${prompt} ` : `${prompt} `)} className="rounded-full border border-white/80 bg-white/50 px-3 py-2 text-left text-[11px] text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/[.04] dark:text-slate-300 dark:hover:bg-white/[.08]">{prompt}</button>)}</div>
            </motion.div>}

            {step === 2 && <motion.div key="ritual" initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -14 }} transition={{ duration: 0.22 }}>
              <div className="mx-auto max-w-xl text-center"><p className="text-xs font-semibold uppercase tracking-[.14em] text-violet-600 dark:text-violet-300">{en ? "Pick a small ritual" : "เลือกพิธีเล็ก ๆ ให้ใจ"}</p><h3 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{copy.choose}</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{en ? "There is no wrong way. Just choose the image that feels gentle." : "ไม่มีวิธีไหนผิด เลือกภาพที่รู้สึกอ่อนโยนกับใจได้เลย"}</p></div>
              <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">{RITUALS.map(({ id, icon: Icon, en: labelEn, th: labelTh, iconStyle }) => <button key={id} type="button" aria-pressed={ritual === id} onClick={() => setRitual(id)} className={`flex items-center gap-4 rounded-3xl border p-4 text-left transition-all ${ritual === id ? "border-violet-400 bg-white/90 shadow-lg shadow-violet-900/10 ring-2 ring-violet-300/50 dark:border-violet-300/70 dark:bg-white/[.08]" : "border-white/80 bg-white/45 hover:-translate-y-0.5 hover:bg-white/80 dark:border-white/10 dark:bg-white/[.04] dark:hover:bg-white/[.08]"}`}><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${iconStyle}`}><Icon className="h-7 w-7" /></span><span><span className="block text-sm font-bold">{en ? labelEn : labelTh}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">{id === "wind" ? (en ? "Watch it drift beyond your reach." : "มองดูมันลอยไปไกลเกินเอื้อม") : id === "river" ? (en ? "Let the water carry it onward." : "ให้สายน้ำค่อย ๆ พาไป") : id === "garden" ? (en ? "Set it down and let the earth hold it." : "วางไว้ให้ผืนดินช่วยรับน้ำหนัก") : (en ? "Let it grow smaller beneath a wide sky." : "ปล่อยให้มันเล็กลงใต้ท้องฟ้ากว้าง")}</span></span>{ritual === id && <Check className="ml-auto h-4 w-4 shrink-0 text-violet-600 dark:text-violet-300" />}</button>)}</div>
              <div className="mx-auto mt-6 max-w-2xl rounded-3xl border border-violet-200/60 bg-violet-100/40 p-4 dark:border-violet-300/10 dark:bg-violet-300/[.06]"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-violet-700 dark:text-violet-200">{en ? "A note to yourself" : "ข้อความถึงตัวเอง"}</p><p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{en ? "I can come back to this when I have more space. For now, I can rest." : "ฉันกลับมาคิดเรื่องนี้ได้เมื่อพร้อม ตอนนี้ขอพักใจก่อน"}</p></div>
            </motion.div>}

            {step === 3 && <motion.div key="release" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mx-auto flex h-full min-h-[280px] w-full flex-1 flex-col">
              <ThoughtReleaseScene thought={thought} ritual={ritual} language={lang} onContinue={() => setStep(4)} />
            </motion.div>}

            {step === 4 && <motion.div key="finish" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-xl py-3 text-center">
              <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-[2rem] bg-gradient-to-br from-violet-200 to-sky-100 text-violet-700 shadow-xl shadow-violet-900/10 dark:from-violet-300/15 dark:to-sky-300/10 dark:text-violet-100"><span className="relative" aria-hidden="true">{React.createElement(FEELINGS.find((item) => item.id === feeling)?.icon || Cloud, { className: "h-12 w-12", strokeWidth: 1.7 })}<motion.span className="absolute -right-3 -top-3 text-violet-500 dark:text-violet-200" animate={reduceMotion ? {} : { y: [0, -6, 0], rotate: [0, 12, 0] }} transition={{ duration: 2.8, repeat: Infinity }}><Sparkles className="h-5 w-5" /></motion.span></span></div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-violet-600 dark:text-violet-300">{copy.eyebrow}</p><h3 className="mt-2 text-3xl font-bold tracking-tight">{copy.doneTitle}</h3><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.doneText}</p>
              <div className="mt-7 rounded-3xl border border-white/80 bg-white/65 p-5 text-left dark:border-white/10 dark:bg-white/[.05]"><p className="text-sm font-bold">{copy.nextTitle}</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{NEXT_STEPS.map(({ id, icon: Icon, en: labelEn, th: labelTh }) => <button key={id} type="button" aria-pressed={nextStep === id} onClick={() => setNextStep(id)} className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-xs font-medium transition ${nextStep === id ? "border-violet-400 bg-violet-100/80 text-violet-900 dark:bg-violet-300/10 dark:text-violet-100" : "border-slate-200/80 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-white/[.03] dark:hover:bg-white/[.07]"}`}><Icon className="h-4 w-4 shrink-0" />{en ? labelEn : labelTh}</button>)}</div>{nextStep && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{en ? "A small step is enough. You can do it in your own time." : "ก้าวเล็ก ๆ ก็เพียงพอ ทำเมื่อพร้อมได้เลย"}</p>}</div>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row"><button type="button" onClick={closeAndClear} className="rounded-full !bg-violet-700 px-6 py-3 text-sm font-semibold !text-white shadow-lg transition hover:-translate-y-0.5 hover:!bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">{copy.finish}</button><button type="button" onClick={() => { setThought(""); setStep(0); setFeeling("heavy"); setRitual("wind"); setNextStep(null); }} className="rounded-full border border-slate-300 bg-white/50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/[.04] dark:text-slate-200 dark:hover:bg-white/[.08]">{copy.restart}</button></div>
            </motion.div>}
          </AnimatePresence>
        </div>

        {step < 3 && <footer className="relative z-10 flex items-center justify-between gap-3 border-t border-slate-200/70 bg-white/35 px-5 py-4 dark:border-white/10 dark:bg-white/[.02] sm:px-8">
          <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white/70 disabled:invisible dark:text-slate-300 dark:hover:bg-white/[.08]"><ArrowLeft className="h-4 w-4" />{en ? "Back" : "ย้อนกลับ"}</button>
          {step < 2 ? <button type="button" onClick={() => setStep((current) => current + 1)} disabled={step === 1 && !thought.trim()} className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5 hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-200">{copy.continue}<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={() => setStep(3)} disabled={!thought.trim()} className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5 hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-violet-300 dark:text-violet-950 dark:hover:bg-violet-200">{copy.release}<Sparkles className="h-4 w-4" /></button>}
        </footer>}
      </motion.section>
    </div>,
    document.body,
  );
}
