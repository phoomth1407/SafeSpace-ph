import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Brain, ClipboardList, Headphones,
  Heart, ShieldCheck, Sparkles, Users, Wind, Leaf, MessageCircle
} from "lucide-react";
import StatsDashboard from "@/components/StatsDashboard";
import MoodCheckInCard from "@/components/MoodCheckInCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import WorryReleaseModal from "@/components/WorryReleaseModal";
import MagneticButton from "@/components/MagneticButton";
import WellnessIllustration from "@/components/WellnessIllustration";
import { useTranslation } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function ToolTile({ icon: Icon, illustration, title, subtitle, badge, onClick, tone }) {
  return (
    <motion.button
      variants={fadeUp}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      className={`group min-h-[132px] rounded-2xl border p-4 text-left transition-all bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 ${tone}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-950/50 p-1">
          {illustration ? <WellnessIllustration type={illustration} /> : <Icon className="w-5 h-5 text-amber-500 m-auto mt-2.5" />}
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          {badge}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.button>
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
      icon: Wind, illustration: "breath", title: t("breath.title"), subtitle: t("breath.subtitle"),
      badge: t("home.tool.badge2"), onClick: () => setBreathingOpen(true), tone: "hover:border-sky-300/60 dark:hover:border-sky-500/30"
    },
    {
      icon: Leaf, illustration: "ground", title: t("ground.title"), subtitle: t("ground.subtitle"),
      badge: t("home.tool.badge3"), onClick: () => setGroundingOpen(true), tone: "hover:border-emerald-300/60 dark:hover:border-emerald-500/30"
    },
    {
      icon: MessageCircle, illustration: "worry", title: t("worry.title"), subtitle: t("worry.subtitle"),
      badge: t("home.tool.interactive"), onClick: () => setWorryOpen(true), tone: "hover:border-violet-300/60 dark:hover:border-violet-500/30"
    },
  ];

  return (
    <div className="home-page pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 shadow-xl shadow-slate-200/30 dark:shadow-black/20">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-sky-50 dark:from-rose-950/20 dark:via-slate-950 dark:to-sky-950/20" />
        <div className="relative p-5 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-medium text-rose-600 dark:text-rose-300">
                <Heart className="w-3.5 h-3.5" fill="currentColor" />
                {t("home.badge")}
              </div>
              <h1 className="mt-2 text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {greeting}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                {t("home.subtitle")}
              </p>
            </div>
            <a
              href="tel:1323"
              className="shrink-0 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              {t("home.hotline")}
            </a>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <MoodCheckInCard compact />
      </div>

      <div className="mt-5 grid lg:grid-cols-[1.05fr_.95fr] gap-5">
        <motion.section
          initial="hidden" animate="show" variants={fadeUp}
          className="rounded-3xl border border-rose-200/70 dark:border-rose-500/15 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-950 p-5 md:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-rose-500">{t("home.mainCheckin.eyebrow")}</span>
              <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{t("home.mainCheckin.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{t("home.mainCheckin.desc")}</p>
            </div>
            <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 items-center justify-center shadow-sm">
              <Brain className="w-5 h-5 text-rose-500" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1.5">{t("home.mainCheckin.time")}</span>
            <span className="rounded-full bg-white/80 dark:bg-slate-900/70 px-3 py-1.5">{t("home.mainCheckin.private")}</span>
          </div>
          <MagneticButton>
            <Link to="/assessment" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-colors">
              <ClipboardList className="w-4 h-4" />
              {t("home.cta.assessment")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </MagneticButton>
        </motion.section>

        <motion.section
          initial="hidden" animate="show" variants={fadeUp}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-5 md:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-sky-500">{t("home.tools.eyebrow")}</span>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{t("home.tools.title")}</h2>
            </div>
            <Sparkles className="w-5 h-5 text-sky-400" />
          </div>
          <motion.div variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show" className="grid grid-cols-2 gap-2.5">
            {tools.map((tool) => <ToolTile key={tool.title} {...tool} />)}
            <ToolTile
              icon={Headphones}
              illustration="sound"
              title={t("sound.title")}
              subtitle={t("sound.subtitle")}
              badge={t("home.tool.live")}
              onClick={() => window.dispatchEvent(new Event("safespace:open-sounds"))}
              tone="hover:border-amber-300/60 dark:hover:border-amber-500/30"
            />
          </motion.div>
        </motion.section>
      </div>

      <section className="mt-5 grid md:grid-cols-2 gap-4">
        <Link to="/community" className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-start justify-between gap-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-sky-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{t("home.community.title")}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("home.community.desc")}</p>
        </Link>

        <button onClick={() => setInsightsOpen((v) => !v)} className="text-left rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-violet-500" />
            </div>
            <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform ${insightsOpen ? "rotate-90" : ""}`} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{t("home.insights.title")}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("home.insights.desc")}</p>
          {insightsOpen && <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"><StatsDashboard /></div>}
        </button>
      </section>

      <section className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 px-5 py-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("home.about.hint")}</p>
          <a href={`${import.meta.env.BASE_URL}about.html`} className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:underline">
            {t("home.about.button")}
          </a>
        </div>
        <span className="text-[10px] text-slate-400">{lang === "en" ? "SafeSpace school project" : "โครงการ SafeSpace สำหรับงานโรงเรียน"}</span>
      </section>

      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
      <WorryReleaseModal open={worryOpen} onClose={() => setWorryOpen(false)} />
    </div>
  );
}
