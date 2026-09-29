import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Users,
  ArrowRight,
  Heart,
  ShieldCheck,
  Sparkles,
  Brain,
  TrendingUp,
  Phone,
  Wind,
  Sprout,
  Headphones,
  ChevronDown,
  ChevronUp,
  Clock,
  History as HistoryIcon,
  Info,
} from "lucide-react";
import StatsDashboard from "@/components/StatsDashboard";
import MoodCheckInCard from "@/components/MoodCheckInCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import WorryReleaseModal from "@/components/WorryReleaseModal";
import AnimatedCounter from "@/components/AnimatedCounter";
import FloatingOrbs from "@/components/FloatingOrbs";
import MagneticButton from "@/components/MagneticButton";
import ScenicBackdrop from "@/components/ScenicBackdrop";
import { useTranslation } from "@/lib/i18n";

function getGreeting(lang) {
  const hour = new Date().getHours();
  if (lang === "en") {
    if (hour >= 5 && hour < 12)
      return { title: "Good morning", icon: "🌅", message: "Start your day with a calm mind and gentle breath." };
    if (hour >= 12 && hour < 17)
      return { title: "Good afternoon", icon: "☀️", message: "Take a pause in your day to check in with yourself." };
    if (hour >= 17 && hour < 21)
      return { title: "Good evening", icon: "🌇", message: "How was your day? Let your body and mind unwind." };
    return { title: "Good night", icon: "🌙", message: "Set down the worries of the day and rest gently." };
  } else {
    if (hour >= 5 && hour < 12)
      return { title: "อรุณสวัสดิ์", icon: "🌅", message: "เริ่มต้นวันใหม่อย่างอ่อนโยนและใจดีกับตัวเองนะ" };
    if (hour >= 12 && hour < 17)
      return { title: "สวัสดีตอนบ่าย", icon: "☀️", message: "พักสักนิดระหว่างวัน เพื่อดูแลใจและเติมพลัง" };
    if (hour >= 17 && hour < 21)
      return { title: "สวัสดีตอนเย็น", icon: "🌇", message: "วันนี้เป็นอย่างไรบ้าง? มาผ่อนคลายความเหนื่อยล้ากันนะ" };
    return { title: "ราตรีสวัสดิ์", icon: "🌙", message: "คืนนี้วางเรื่องหนักใจลง แล้วพักผ่อนให้สบายใจนะ" };
  }
}

function getFormattedDate(lang) {
  const now = new Date();
  if (lang === "en") {
    return now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }
  return now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" });
}

export default function Home() {
  const { t, lang } = useTranslation();
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [worryOpen, setWorryOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const greeting = useMemo(() => getGreeting(lang), [lang]);
  const formattedDate = useMemo(() => getFormattedDate(lang), [lang]);

  const handleOpenSounds = () => {
    window.dispatchEvent(new Event("safespace:open-sounds"));
  };

  return (
    <div className="home-page space-y-6 md:space-y-8 max-w-5xl mx-auto pb-6">
      {/* App Top Welcome & Emergency Quick Assist Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
              <Heart className="w-3 h-3 fill-rose-500" /> SafeSpace
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
            <span>{greeting.title}</span>
            <span className="text-2xl">{greeting.icon}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {greeting.message}
          </p>
        </div>

        {/* Emergency Hotline Quick Access Pill */}
        <a
          href="tel:1323"
          title={lang === "en" ? "Emergency Hotline 1323" : "สายด่วนสุขภาพจิต 1323"}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200/80 dark:border-red-500/20 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all shadow-xs shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse">
            <Phone className="w-3 h-3" />
          </div>
          <div>
            <div className="text-[11px] leading-tight font-bold">
              {lang === "en" ? "Hotline 1323" : "สายด่วนสุขภาพจิต 1323"}
            </div>
            <div className="text-[10px] text-red-500/80 dark:text-red-300/80 leading-tight">
              {lang === "en" ? "Free 24/7 Support" : "โทรฟรี ปรึกษา 24 ชม."}
            </div>
          </div>
        </a>
      </section>

      {/* Daily Mood & 7-Day Habit Tracker Card */}
      <MoodCheckInCard />

      {/* Main Core Application Dashboard (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Primary Assessment Hero Hub (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-900/40 dark:bg-slate-900/40 p-6 md:p-8 shadow-xl shadow-slate-950/10 min-h-[360px]">
          <ScenicBackdrop className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <FloatingOrbs />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-white/10 text-slate-100 text-xs px-3 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>{lang === "en" ? "Self-Screening Assessment" : "แบบประเมินสุขภาวะเบื้องต้น"}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3 leading-tight tracking-tight">
              {t("home.title1")}{" "}
              <span className="bg-gradient-to-r from-rose-300 via-purple-300 to-sky-300 bg-clip-text text-transparent">
                {t("home.title2")}
              </span>
            </h2>

            <p className="text-xs md:text-sm text-slate-200/90 mt-2.5 max-w-lg leading-relaxed">
              {lang === "en"
                ? "Answer 21 thoughtful questions in a warm, confidential environment. Receive personalized AI insights and guidance tailored for you."
                : "สำรวจอารมณ์ของคุณผ่านคำถาม 21 ข้อในพื้นที่ที่ปลอดภัย รับผลวิเคราะห์และคำแนะนำเฉพาะบุคคลจาก AI เพื่อเข้าใจตนเองมากยิ่งขึ้น"}
            </p>

            {/* Micro Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] font-medium text-slate-200">
              <span className="inline-flex items-center gap-1 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {lang === "en" ? "100% Anonymous" : "นิรนาม 100%"}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                {lang === "en" ? "~5 Minutes" : "~5 นาที"}
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                {lang === "en" ? "AI Insights" : "วิเคราะห์ด้วย AI"}
              </span>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/15">
            <MagneticButton>
              <Link
                to="/assessment"
                className="group inline-flex items-center gap-2 bg-white text-slate-950 font-bold text-sm px-5 py-3 rounded-2xl hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <ClipboardList className="w-4 h-4 text-rose-500" />
                {t("home.cta.assessment")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>

            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 text-xs text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all"
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              {t("nav.history")}
            </Link>
          </div>
        </div>

        {/* Right Column: Interactive Self-Care Studio (5 cols - 2x2 Grid) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {lang === "en" ? "Self-Care Studio" : "สตูดิโอดูแลใจ"}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {lang === "en" ? "Quick exercises" : "เครื่องมือด่วน"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {/* Tool 1: Guided Breathing */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setBreathingOpen(true)}
              className="flex flex-col justify-between p-4 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-sky-400/60 dark:hover:border-sky-500/40 text-left transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Wind className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  {lang === "en" ? "2 min" : "2 นาที"}
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {t("breath.title")}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {lang === "en" ? "Box & 4-7-8 breathing to calm your nervous system." : "ฝึกหายใจเข้า-ออก ปรับจังหวะชีพจรเพื่อคลายกังวล"}
                </p>
              </div>
            </motion.button>

            {/* Tool 2: Grounding Exercise */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setGroundingOpen(true)}
              className="flex flex-col justify-between p-4 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/60 dark:hover:border-emerald-500/40 text-left transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  5-4-3-2-1
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {t("ground.title")}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {lang === "en" ? "Reconnect with reality through your 5 senses." : "ดึงสติกลับสู่ปัจจุบันผ่านประสาทสัมผัสทั้ง 5"}
                </p>
              </div>
            </motion.button>

            {/* Tool 3: Worry Release */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setWorryOpen(true)}
              className="flex flex-col justify-between p-4 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-violet-400/60 dark:hover:border-violet-500/40 text-left transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  {lang === "en" ? "Let Go" : "ปลดปล่อย"}
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {t("worry.title")}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {lang === "en" ? "Write down your heavy thoughts and set them free." : "พิมพ์ความคิดหนักใจแล้วปล่อยให้ลอยลับไป"}
                </p>
              </div>
            </motion.button>

            {/* Tool 4: Ambient Sound Mixer */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenSounds}
              className="flex flex-col justify-between p-4 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-500/40 text-left transition-all shadow-xs hover:shadow-md group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Audio
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {lang === "en" ? "Ambient Sounds" : "เสียงบำบัด & ผ่อนคลาย"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {lang === "en" ? "Rain, ocean waves, singing bowl, and gentle lofi." : "เสียงฝน คลื่นทะเล ขันทิเบต และดนตรี Lo-Fi ผ่อนคลาย"}
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Secondary App Hub (Community & Resources) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Community Card */}
        <Link
          to="/community"
          className="group relative overflow-hidden rounded-3xl p-5 md:p-6 bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-sky-400/50 transition-all hover:shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                {lang === "en" ? "Safe & Anonymous" : "ปลอดภัยและไม่ระบุตัวตน"}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t("home.features.community.title")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === "en" ? "Share your feelings and support other youth." : "แบ่งปันความรู้สึก และรับฟังกำลังใจจากเพื่อนร่วมทาง"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
        </Link>

        {/* Resources & Hotlines Card */}
        <Link
          to="/resources"
          className="group relative overflow-hidden rounded-3xl p-5 md:p-6 bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400/50 transition-all hover:shadow-md flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {lang === "en" ? "24/7 Crisis Support" : "สายด่วนและคำแนะนำ 24 ชม."}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t("home.features.resources.title")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === "en" ? "Trusted mental health contacts and self-help guides." : "เบอร์ติดต่อกรมสุขภาพจิตและแหล่งความรู้ดูแลใจ"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
        </Link>
      </div>

      {/* Expandable Project Insights & Public Health Statistics (HDC Data) */}
      <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/40 overflow-hidden transition-all shadow-xs">
        <button
          type="button"
          onClick={() => setShowInsights(!showInsights)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {lang === "en" ? "Mental Health Insights & HDC Statistics" : "ข้อมูลและสถิติสุขภาพจิตในประเทศไทย (HDC)"}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === "en" ? "Click to view Department of Mental Health data and research" : "คลิกเพื่อดูสถิติและข้อมูลอ้างอิงจากกรมสุขภาพจิต"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <span>{showInsights ? (lang === "en" ? "Hide" : "ซ่อน") : (lang === "en" ? "View" : "ดูสถิติ")}</span>
            {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        <AnimatePresence>
          {showInsights && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-200/80 dark:border-slate-800/80 p-5 md:p-6 space-y-6"
            >
              {/* Quick stats numbers */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Brain, value: 21, suffix: "", label: t("home.stats.questions"), color: "text-rose-400 bg-rose-500/10" },
                  { icon: ShieldCheck, value: 100, suffix: "%", label: t("home.stats.anonymous"), color: "text-sky-400 bg-sky-500/10" },
                  { icon: TrendingUp, value: 30, suffix: "%", label: t("home.stats.stressed"), color: "text-amber-400 bg-amber-500/10" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 md:p-4 border border-slate-200/60 dark:border-slate-800 text-center">
                    <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Research charts */}
              <div>
                <div className="text-center mb-4">
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">{t("home.why.title")}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl mx-auto">{t("home.why.subtitle")}</p>
                </div>
                <StatsDashboard />
              </div>

              {/* About link */}
              <div className="pt-2 text-center">
                <a
                  href={`${import.meta.env.BASE_URL}about.html`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium underline transition-colors"
                >
                  {t("home.about.button")}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Modals */}
      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
      <WorryReleaseModal open={worryOpen} onClose={() => setWorryOpen(false)} />
    </div>
  );
}
