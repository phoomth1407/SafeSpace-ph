import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, Users, Phone, ArrowRight, Heart, ShieldCheck, Sparkles, Brain, TrendingUp } from "lucide-react";
import StatsDashboard from "@/components/StatsDashboard";
import TiltCard from "@/components/TiltCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import FloatingOrbs from "@/components/FloatingOrbs";
import MagneticButton from "@/components/MagneticButton";
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

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative text-center pt-6 pb-4 overflow-hidden">
        <FloatingOrbs />
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-300 text-xs px-3 py-1 rounded-full mb-4 border border-rose-500/20">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-3 h-3" fill="currentColor" />
            </motion.span>
            {t("home.badge")}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-3xl md:text-5xl font-bold text-slate-100 leading-tight"
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

          <motion.p variants={fadeUp} className="text-sm text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
            {t("home.subtitle")}
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mt-8">
            <MagneticButton>
              <Link
                to="/assessment"
                className="group bg-slate-100 text-slate-900 text-sm font-semibold px-6 py-3 rounded-full hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/40"
              >
                <ClipboardList className="w-4 h-4" />
                {t("home.cta.assessment")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                to="/community"
                className="bg-slate-900 text-slate-200 text-sm font-semibold px-6 py-3 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                {t("home.cta.community")}
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </section>

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
          <p className="text-xs text-slate-500 mt-1">{t("home.why.subtitle")}</p>
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
    </div>
  );
}
