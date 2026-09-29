import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BarChart3, Brain, ClipboardList, Headphones,
  Heart, ShieldCheck, Sparkles, Users, Wind, Leaf, MessageCircle,
  Waves, Compass, Clock3
} from "lucide-react";
import StatsDashboard from "@/components/StatsDashboard";
import MoodCheckInCard from "@/components/MoodCheckInCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import WorryReleaseModal from "@/components/WorryReleaseModal";
import MagneticButton from "@/components/MagneticButton";
import WellnessIllustration, { SoundIllustrationIcon } from "@/components/WellnessIllustration";
import { useTranslation } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1];

const sectionMotion = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function ToolTile({ icon: Icon, illustration, title, subtitle, badge, onClick, accent }) {
  return (
    <motion.button
      variants={sectionMotion}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      className="home-tool group relative min-h-[148px] overflow-hidden rounded-[1.35rem] border p-4 text-left transition-all"
    >
      <div className={`home-tool-glow ${accent}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="home-tool-art h-12 w-12 overflow-hidden rounded-2xl border border-white/50 bg-white/70 p-0.5 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          {illustration === "sound"
            ? <SoundIllustrationIcon type="rain" className="h-full w-full" />
            : <WellnessIllustration type={illustration} className="h-full w-full" />}
        </div>
        <span className="rounded-full border border-slate-200/70 bg-white/75 px-2.5 py-1 text-[10px] font-semibold text-slate-500 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/50 dark:text-slate-400">
          {badge}
        </span>
      </div>
      <div className="relative mt-5 flex items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/80 text-slate-400 shadow-sm transition-transform group-hover:translate-x-1 dark:bg-slate-950/70">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </motion.button>
  );
}

function SidePanel({ side, icon: Icon, title, body, illustration, children }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: side === "left" ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.08, ease }}
      className="home-side-panel hidden xl:flex"
    >
      <div className="home-side-card">
        <div className="home-side-orbit" />
        <div className="relative">
          <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-violet-500/10">
              <Icon className="h-3.5 w-3.5" />
            </span>
            SafeSpace
          </div>
          <div className="home-side-art">
            <WellnessIllustration type={illustration} />
          </div>
          <h2 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{body}</p>
          {children}
        </div>
      </div>
    </motion.aside>
  );
}

export default function Home() {
  const { t, lang } = useTranslation();
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [worryOpen, setWorryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [hour, setHour] = useState(() => new Date().getHours());

  useEffect(() => {
    const timer = window.setInterval(() => setHour(new Date().getHours()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const greeting = useMemo(() => {
    if (hour >= 5 && hour < 12) return t("home.greeting.morning");
    if (hour >= 12 && hour < 18) return t("home.greeting.afternoon");
    return t("home.greeting.evening");
  }, [hour, t]);

  const tools = [
    {
      illustration: "breath", title: t("breath.title"), subtitle: t("breath.subtitle"),
      badge: t("home.tool.badge2"), onClick: () => setBreathingOpen(true), accent: "home-tool-glow-sky"
    },
    {
      illustration: "ground", title: t("ground.title"), subtitle: t("ground.subtitle"),
      badge: t("home.tool.badge3"), onClick: () => setGroundingOpen(true), accent: "home-tool-glow-emerald"
    },
    {
      illustration: "worry", title: t("worry.title"), subtitle: t("worry.subtitle"),
      badge: t("home.tool.interactive"), onClick: () => setWorryOpen(true), accent: "home-tool-glow-violet"
    },
  ];

  return (
    <div className="home-page pb-10">
      <div className="home-ambient" aria-hidden="true">
        <div className="home-ambient-blob home-ambient-blob-a" />
        <div className="home-ambient-blob home-ambient-blob-b" />
        <div className="home-ambient-grid" />
      </div>

      <div className="home-layout">
        <SidePanel
          side="left"
          icon={Wind}
          illustration="breath"
          title={lang === "en" ? "A slower moment" : "ช่วงเวลาที่ช้าลง"}
          body={lang === "en"
            ? "You do not need to solve everything at once. Start with one small step."
            : "ไม่จำเป็นต้องแก้ทุกอย่างในครั้งเดียว เริ่มจากเรื่องเล็ก ๆ ก่อนก็ได้"}
        >
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-[10px] font-medium text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
            <Waves className="h-3.5 w-3.5" />
            {lang === "en" ? "Breathe at your own pace" : "หายใจในจังหวะของตัวเอง"}
          </div>
        </SidePanel>

        <main className="home-main">
          <motion.section
            initial="hidden"
            animate="show"
            variants={sectionMotion}
            className="home-hero"
          >
            <div className="home-hero-sheen" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/65 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700 shadow-sm dark:border-violet-500/20 dark:bg-slate-950/40 dark:text-violet-300">
                  <Heart className="h-3.5 w-3.5" />
                  {t("home.badge")}
                </div>
                <h1 className="text-[2rem] font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-[2.55rem] dark:text-white">
                  {greeting}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {t("home.subtitle")}
                </p>
              </div>

              <a
                href="tel:1323"
                className="home-help-pill shrink-0"
                aria-label={t("home.hotline")}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {lang === "en" ? "Need urgent support?" : "ต้องการความช่วยเหลือด่วน?"}
                  </span>
                  <span className="mt-0.5 block text-xs font-bold text-slate-800 dark:text-slate-100">{t("home.hotline")}</span>
                </span>
              </a>
            </div>

            <div className="relative mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <MoodCheckInCard compact />
              <div className="hidden min-w-[155px] rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm sm:block dark:border-slate-700/60 dark:bg-slate-950/30">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <Compass className="h-4 w-4" />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                  {lang === "en" ? "One step is enough" : "ทีละก้าวก็เพียงพอ"}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                  {lang === "en" ? "Check in whenever it feels useful." : "กลับมาเช็กอินเมื่อรู้สึกว่าอยากทำ"}
                </p>
              </div>
            </div>
          </motion.section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.12fr_.88fr]">
            <motion.section
              initial="hidden"
              animate="show"
              variants={sectionMotion}
              className="home-assessment"
            >
              <div className="home-assessment-art">
                <WellnessIllustration type="worry" />
              </div>
              <div className="relative z-10 max-w-[68%] sm:max-w-[62%]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
                  {t("home.mainCheckin.eyebrow")}
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                  {t("home.mainCheckin.title")}
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm dark:text-slate-400">
                  {t("home.mainCheckin.desc")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-950/40">{t("home.mainCheckin.time")}</span>
                  <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-950/40">{t("home.mainCheckin.private")}</span>
                </div>
                <MagneticButton>
                  <Link
                    to="/assessment"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    <ClipboardList className="h-4 w-4" />
                    {t("home.cta.assessment")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </MagneticButton>
              </div>
            </motion.section>

            <motion.section
              initial="hidden"
              animate="show"
              variants={sectionMotion}
              className="home-tools-panel"
            >
              <div className="relative flex items-end justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">{t("home.tools.eyebrow")}</span>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 dark:text-white">{t("home.tools.title")}</h2>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.055 } } }}
                className="relative mt-4 grid grid-cols-2 gap-2.5"
              >
                {tools.map((tool) => <ToolTile key={tool.title} {...tool} />)}
                <ToolTile
                  illustration="sound"
                  title={t("sound.title")}
                  subtitle={t("sound.subtitle")}
                  badge={t("home.tool.live")}
                  onClick={() => window.dispatchEvent(new Event("safespace:open-sounds"))}
                  accent="home-tool-glow-amber"
                />
              </motion.div>
            </motion.section>
          </div>

          <section className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
            <Link to="/community" className="home-secondary-card group">
              <div className="flex items-start justify-between gap-4">
                <span className="home-secondary-icon bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <Users className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </div>
              <h2 className="mt-4 text-base font-black text-slate-950 dark:text-white">{t("home.community.title")}</h2>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">{t("home.community.desc")}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-600 dark:text-sky-300">
                <MessageCircle className="h-3.5 w-3.5" />
                {lang === "en" ? "Open community" : "เข้าสู่ชุมชน"}
              </span>
            </Link>

            <button onClick={() => setInsightsOpen((v) => !v)} className="home-secondary-card text-left">
              <div className="flex items-start justify-between gap-4">
                <span className="home-secondary-icon bg-violet-500/10 text-violet-600 dark:text-violet-300">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <ArrowRight className={`h-4 w-4 text-slate-400 transition-transform ${insightsOpen ? "rotate-90" : ""}`} />
              </div>
              <h2 className="mt-4 text-base font-black text-slate-950 dark:text-white">{t("home.insights.title")}</h2>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">{t("home.insights.desc")}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-600 dark:text-violet-300">
                <Clock3 className="h-3.5 w-3.5" />
                {insightsOpen
                  ? (lang === "en" ? "Hide insights" : "ซ่อนข้อมูล")
                  : (lang === "en" ? "View insights" : "ดูข้อมูล")}
              </span>
              <AnimatePresence initial={false}>
                {insightsOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="mt-4 overflow-hidden border-t border-slate-200/70 pt-4 dark:border-slate-800"
                  >
                    <StatsDashboard />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </section>

          <section className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/60 px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("home.about.hint")}</p>
              <a href={`${import.meta.env.BASE_URL}about.html`} className="text-sm font-bold text-slate-800 hover:underline dark:text-slate-200">
                {t("home.about.button")}
              </a>
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              {lang === "en" ? "SafeSpace school project" : "โครงการ SafeSpace สำหรับงานโรงเรียน"}
            </span>
          </section>
        </main>

        <SidePanel
          side="right"
          icon={Leaf}
          illustration="ground"
          title={lang === "en" ? "Small things count" : "เรื่องเล็ก ๆ ก็สำคัญ"}
          body={lang === "en"
            ? "Ground yourself, notice what is around you, and give yourself a little space."
            : "ลองกลับมาอยู่กับสิ่งรอบตัว สังเกตสิ่งที่เกิดขึ้น และให้พื้นที่กับตัวเองสักนิด"}
        >
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-[10px] font-medium leading-4 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            {lang === "en" ? "There is no perfect way to feel." : "ไม่มีวิธีที่ถูกต้องเพียงวิธีเดียวในการรู้สึก"}
          </div>
        </SidePanel>
      </div>

      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
      <WorryReleaseModal open={worryOpen} onClose={() => setWorryOpen(false)} />
    </div>
  );
}
