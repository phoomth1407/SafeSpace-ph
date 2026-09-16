import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Phone, Lightbulb, AlertTriangle, Heart, RotateCcw, Wind, Sprout, Users, BookOpen } from "lucide-react";
import { appClient } from "@/api/appClient";
import { useTranslation } from "@/lib/i18n";
import BreathingExerciseModal from "@/components/BreathingExerciseModal";
import GroundingModal from "@/components/GroundingModal";
import WorryReleaseModal from "@/components/WorryReleaseModal";

export default function AssessmentResult() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [breathingOpen, setBreathingOpen] = useState(false);
  const [groundingOpen, setGroundingOpen] = useState(false);
  const [worryOpen, setWorryOpen] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      // Guest mode: result from location.state
      if (!id && location.state?.result) {
        setResult(location.state.result);
        setLoading(false);
        return;
      }
      if (!id) {
        setError(t("result.notfound"));
        setLoading(false);
        return;
      }
      // Logged-in: fetch from database
      try {
        const data = await appClient.entities.Assessment.get(id);
        setResult(data);
      } catch (err) {
        setError(t("result.notfound"));
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        <p className="text-sm text-slate-300 mt-3">{t("result.loading")}</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-sm text-slate-300">{error || t("result.notfound")}</p>
        <Link to="/assessment" className="text-sm text-rose-300 font-medium underline">{t("result.retry")}</Link>
      </div>
    );
  }

  const riskConfig = {
    low: { label: t("risk.low"), color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20", bar: "from-emerald-400 to-emerald-500" },
    moderate: { label: t("risk.moderate"), color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/20", bar: "from-amber-400 to-amber-500" },
    high: { label: t("risk.high"), color: "text-orange-300", bg: "bg-orange-500/10 border-orange-500/20", bar: "from-orange-400 to-orange-500" },
    severe: { label: t("risk.severe"), color: "text-red-300", bg: "bg-red-500/10 border-red-500/20", bar: "from-red-400 to-red-500" }
  };

  const risk = riskConfig[result.risk_level] || riskConfig.moderate;
  const score = result.risk_score || 0;
  const isHighRisk = result.risk_level === "high" || result.risk_level === "severe";
  const isGuest = !id || location.state?.isGuest;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("result.back")}
      </button>

      {/* Risk summary card */}
      <div className={`rounded-2xl p-6 border ${risk.bg}`}>
        <div className="text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{t("result.yourResult")}</div>
          <h1 className={`text-2xl font-bold ${risk.color}`}>{risk.label}</h1>
          <div className="mt-4 mx-auto max-w-xs">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${risk.bar} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">{t("result.riskScore")}: {score}/100</div>
          </div>
        </div>
      </div>

      {/* AI analysis */}
      {result.depression_chance && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <div className="text-purple-700 dark:text-purple-300 text-sm font-bold">{result.analysis_source === "offline-model" ? "LM" : "AI"}</div>
            </div>
            <h2 className="text-sm font-semibold !text-black dark:!text-white">{t("result.aiAnalysis")}</h2>
          </div>
          <div className="mb-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              {result.analysis_source === "offline-model" ? t("result.source.offline") : t("result.source.ai")}
            </span>
          </div>
          <div className="text-xs text-black dark:text-slate-400 mb-1">{t("result.trend")}</div>
          <p className="text-sm !text-black dark:!text-white leading-relaxed">{result.depression_chance}</p>
          {result.similar_case && (
            <>
              <div className="text-xs text-black dark:text-slate-400 mt-4 mb-1">{t("result.factors")}</div>
              <p className="text-sm !text-black dark:!text-white leading-relaxed">{result.similar_case}</p>
            </>
          )}
        </div>
      )}

      {/* Screening note */}
      <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-200 dark:border-amber-500/20">
        <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong>{t("result.noteTitle")}:</strong> {t("result.note")}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/80 to-sky-500/80 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <h2 className="text-sm font-semibold !text-black dark:!text-white">{t("result.summary")}</h2>
        </div>
        <p className="text-sm !text-black dark:!text-white leading-relaxed">{result.ai_summary}</p>
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-sky-300" />
            </div>
            <h2 className="text-sm font-semibold !text-black dark:!text-white">{t("result.recommendations")}</h2>
          </div>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-black dark:text-slate-300 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 !text-black dark:!text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

            {/* Personalized next steps */}
      <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-sky-700 dark:text-sky-300" />
          </div>
          <h2 className="text-sm font-semibold !text-black dark:!text-white">{t("result.personalized")}</h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{t("result.personalizedReason")}</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {(Array.isArray(result.tool_recommendations) && result.tool_recommendations.length
            ? result.tool_recommendations
            : [
                { id: "breath", reason: "" },
                { id: "ground", reason: "" },
                { id: "community", reason: "" },
                { id: "resources", reason: "" },
              ]
          ).slice(0, 4).map((tool, index) => {
            const common = "text-left w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:shadow-md transition-all";
            const title = t(`result.tool.${tool.id}`);
            const reason = tool.reason || "";
            const iconMap = {
              breath: <Wind className="w-4 h-4 text-sky-700 dark:text-sky-300 mb-2" />,
              ground: <Sprout className="w-4 h-4 text-emerald-700 dark:text-emerald-300 mb-2" />,
              worry: <Heart className="w-4 h-4 text-violet-700 dark:text-violet-300 mb-2" />,
              community: <Users className="w-4 h-4 text-violet-700 dark:text-violet-300 mb-2" />,
              resources: <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-300 mb-2" />,
              sound: <span className="text-base block mb-2">🎧</span>,
            };

            const content = (
              <>
                {iconMap[tool.id] || <Lightbulb className="w-4 h-4 text-slate-700 dark:text-slate-300 mb-2" />}
                <div className="text-sm font-semibold !text-black dark:!text-white">{title}</div>
                {reason && <div className="text-xs !text-black dark:!text-white mt-1 leading-relaxed">{reason}</div>}
              </>
            );

            if (tool.id === "community") {
              return (
                <motion.div key={tool.id + index} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                  <Link to="/community" className={common + " block"}>{content}</Link>
                </motion.div>
              );
            }
            if (tool.id === "resources") {
              return (
                <motion.div key={tool.id + index} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                  <Link to="/resources" className={common + " block"}>{content}</Link>
                </motion.div>
              );
            }
            if (tool.id === "sound") {
              return (
                <motion.button key={tool.id + index} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={() => window.dispatchEvent(new Event("safespace:open-sounds"))} className={common}>{content}</motion.button>
              );
            }
            if (tool.id === "worry") {
              return (
                <motion.button key={tool.id + index} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={() => setWorryOpen(true)} className={common}>{content}</motion.button>
              );
            }
            if (tool.id === "ground") {
              return (
                <motion.button key={tool.id + index} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={() => setGroundingOpen(true)} className={common}>{content}</motion.button>
              );
            }
            return (
              <motion.button key={tool.id + index} whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.985 }} onClick={() => setBreathingOpen(true)} className={common}>{content}</motion.button>
            );
          })}
        </div>
      </div>

      {/* Emergency alert for high risk */}
      {isHighRisk && (
        <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-5 border border-red-200 dark:border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-red-400" />
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">{t("result.emergency.title")}</h2>
          </div>
          <p className="text-xs text-red-700/80 dark:text-red-300/80 leading-relaxed mb-3">
            {t("result.emergency.desc")}
          </p>
          <div className="flex gap-2">
            <a href="tel:1327" className="flex-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200 text-sm font-semibold px-4 py-2.5 rounded-xl text-center hover:bg-red-500/30 transition-colors border border-red-500/30">
              {t("result.emergency.call1")}
            </a>
            <a href="tel:1667" className="flex-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200 text-sm font-semibold px-4 py-2.5 rounded-xl text-center hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors border border-red-200 dark:border-red-500/30">
              {t("result.emergency.call2")}
            </a>
          </div>
        </div>
      )}

      {/* Guest prompt */}
      {isGuest && (
        <div className="bg-sky-50 dark:bg-sky-500/10 rounded-2xl p-5 border border-sky-200 dark:border-sky-500/20 text-center">
          <p className="text-sm text-sky-700 dark:text-sky-200 mb-3">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            {t("result.guest.prompt")}
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/register" className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-white transition-colors">
              {t("result.guest.register")}
            </Link>
            <Link to="/login" className="bg-slate-900 text-slate-200 text-sm font-semibold px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors">
              {t("result.guest.login")}
            </Link>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/assessment"
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t("result.retake")}
        </Link>
        <Link
          to="/resources"
          className="flex-1 flex items-center justify-center gap-1.5 bg-slate-900 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
        >
          <Phone className="w-4 h-4" />
          {t("result.hotlines")}
        </Link>
      </div>
      <BreathingExerciseModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
      <GroundingModal open={groundingOpen} onClose={() => setGroundingOpen(false)} />
      <WorryReleaseModal open={worryOpen} onClose={() => setWorryOpen(false)} />
    </div>
  );
}
