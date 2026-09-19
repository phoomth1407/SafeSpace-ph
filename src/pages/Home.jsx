import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Users, ArrowRight, Heart, ShieldCheck, Sparkles, Brain, TrendingUp } from "lucide-react";
import StatsDashboard from "@/components/StatsDashboard";
import MoodCheckInCard from "@/components/MoodCheckInCard";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import WorryReleaseModal from "@/components/WorryReleaseModal";
import TiltCard from "@/components/TiltCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import FloatingOrbs from "@/components/FloatingOrbs";
import MagneticButton from "@/components/MagneticButton";
import WellnessIllustration from "@/components/WellnessIllustration";
import ScenicBackdrop from "@/components/ScenicBackdrop";
import { useTranslation } from "@/lib/i18n";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { t } = useTranslation();
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [worryOpen, setWorryOpen] = useState(false);

  return (
    <div className="space-y-16 md:space-y-20 home-page">
      {/* Hero */}
      <section className="relative text-center pt-8 md:pt-12 pb-8 overflow-hidden hero-panel rounded-[2rem] md:rounded-[2.75rem] border border-white/10 bg-slate-900/35 dark:bg-slate-900/35 shadow-2xl shadow-slate-950/30">
        <ScenicBackdrop className="absolute inset-0 w-full h-full object-cover opacity-95 home-scenic" />
        <FloatingOrbs />
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative z-10 px-5 md:px-10 home-hero-content"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/5 text-slate-200 text-xs px-3.5 py-1.5 rounded-full mb-5 border border-rose-500/15 shadow-lg shadow-slate-950/20 backdrop-blur-md">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-3 h-3 text-rose-500" fill="currentColor" />
            </motion.span>
            {t("home.badge")}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-6xl font-black text-slate-100 leading-[1.02] tracking-[-0.04em] max-w-4xl mx-auto"
          >
            {t("home.title1")}
            <br />
            <motion.span
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="bg-gradient-to-r from-rose-400 via-purple-400 to-sky-400 bg-clip-text text-transparent bg-[length:200%_auto]"
            >
              {t("home.title2")}
            </motion.span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-sm md:text-base text-slate-300/80 mt-5 max-w-2xl mx-auto leading-7">
            {t("home.subtitle")}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <MagneticButton>
              <Link
                to="/assessment"
                className="group bg-white text-slate-950 text-sm font-semibold px-6 py-3.5 rounded-2xl hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl shadow-slate-950/30 ring-1 ring-white/40"
              >
                <ClipboardList className="w-4 h-4" />
                {t("home.cta.assessment")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                to="/community"
                className="bg-white/5 text-slate-100 text-sm font-semibold px-6 py-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <Users className="w-4 h-4" />
                {t("home.cta.community")}
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

      {/* Daily mood check-in */}
      <MoodCheckInCard />

      <div className="text-center -mb-6">
        <h2 className="text-lg font-semibold text-slate-100">{t("tools.title")}</h2>
      </div>

      {/* Guided breathing */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="relative wellness-tool-card wellness-tool-card--breath"
      >
        <motion.button
          onClick={() => setBreathingOpen(true)}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="w-full text-left bg-white dark:bg-slate-900/60 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 hover:border-sky-300/60 dark:hover:border-sky-500/30 transition-colors group shadow-sm hover:shadow-lg hover:shadow-sky-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-500/10 p-1.5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <motion.div
                animate={{ y: [0, -2, 0], scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <WellnessIllustration type="breath" />
              </motion.div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-100">{t("breath.title")}</h2>
              <p className="text-xs text-slate-400 mt-1">{t("breath.subtitle")}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </motion.section>

      {/* Grounding exercise */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="relative wellness-tool-card wellness-tool-card--ground"
      >
        <motion.button
          onClick={() => setGroundingOpen(true)
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="w-full text-left bg-white dark:bg-slate-900/60 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 hover:border-emerald-300/60 dark:hover:border-emerald-500/30 transition-colors group shadow-sm hover:shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 p-1.5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <motion.div
                animate={{ rotate: [0, -1.5, 1.5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <WellnessIllustration type="ground" />
              </motion.div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-100">{t("ground.title")}</h2>
              <p className="text-xs text-slate-400 mt-1">{t("ground.subtitle")}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </motion.section>

      {/* Worry release */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="relative wellness-tool-card wellness-tool-card--worry"
      >
        <motion.button
          onClick={() => setWorryOpen(true)
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="w-full text-left bg-white dark:bg-slate-900/60 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 hover:border-violet-300/60 dark:hover:border-violet-500/30 transition-colors group shadow-sm hover:shadow-lg hover:shadow-violet-500/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-500/10 p-1.5 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <motion.div
                animate={{ scale: [1, 1.03, 1], rotate: [0, 1, -1, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <WellnessIllustration type="worry" />
              </motion.div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-100">{t("worry.title")}</h2>
              <p className="text-xs text-slate-400 mt-1">{t("worry.subtitle")}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.button>
      </motion.section>

      {/* Quick stats */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Brain, value: 21, suffix: "", label: t("home.stats.questions"), color: "text-rose-300 bg-rose-500/10" },
          { icon: ShieldCheck, value: 100, suffix: "%", label: t("home.stats.anonymous"), color: "text-sky-300 bg-sky-500/10" },
          { icon: TrendingUp, value: 30, suffix: "%", label: t("home.stats.stressed"), color: "text-amber-300 bg-amber-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-center"
          >
            <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-xl font-bold text-slate-100">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </motion.section>

      {/* Stats dashboard */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-slate-100">{t("home.why.title")}</h2>
          <p className="text-sm text-slate-400 mt-1">{t("home.why.subtitle")}</p>
        </div>
        <StatsDashboard />
      </motion.section>

      {/* Features */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="grid md:grid-cols-3 gap-4"
      >
        {[
          { to: "/assessment", icon: ClipboardList, title: t("home.features.assessment.title"), desc: t("home.features.assessment.desc"), iconBg: "bg-rose-500/10", iconColor: "text-rose-300" },
          { to: "/community", icon: Users, title: t("home.features.community.title"), desc: t("home.features.community.desc"), iconBg: "bg-sky-500/10", iconColor: "text-sky-300" },
          { to: "/resources", icon: ShieldCheck, title: t("home.features.resources.title"), desc: t("home.features.resources.desc"), iconBg: "bg-emerald-500/10", iconColor: "text-emerald-300" },
        ].map((feature, i) => (
          <motion.div key={i} variants={fadeUp}>
            <TiltCard className="h-full">
              <Link
                to={feature.to}
                className="group block bg-slate-900/60 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-colors h-full"
              >
                <div
                  style={{ transform: "translateZ(40px)" }}
                  className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-4`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.iconColor} group-hover:scale-110 transition-transform`} />
                </div>
                <h3
                  style={{ transform: "translateZ(30px)" }}
                  className="text-base font-semibold text-slate-100 mb-1"
                >
                  {feature.title}
                </h3>
                <p
                  style={{ transform: "translateZ(20px)" }}
                  className="text-xs text-slate-400 leading-relaxed"
                >
                  {feature.desc}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-3 group-hover:text-slate-300 transition-colors">
                  {t("home.features.start")}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </TiltCard>
          </motion.div>
        ))}
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-center overflow-hidden border border-slate-800"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-60 h-60 bg-rose-500/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-sky-500/10 rounded-full blur-2xl"
        />
        <div className="relative">
          <Sparkles className="w-8 h-8 text-rose-300 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-slate-100">{t("home.cta2.title")}</h2>
          <p className="text-xs text-slate-400 mt-2 mb-5">{t("home.cta2.subtitle")}</p>
          <MagneticButton>
            <Link
              to="/assessment"
              className="group inline-flex items-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors"
            >
              {t("home.cta2.button")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </MagneticButton>
        </div>
      </motion.section>
      {/* Standalone project introduction */}
      <section className="flex flex-col items-center gap-3 pt-2 pb-4 text-center">
        <p className="text-xs text-slate-500">{t("home.about.hint")}</p>
        <a
          href={`${import.meta.env.BASE_URL}about.html`}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
        >
          {t("home.about.button")}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>
      </section>

      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
      <WorryReleaseModal open={worryOpen} onClose={() => setWorryOpen(false)} />
    </div>
  );
}
