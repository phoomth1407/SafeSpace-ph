import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ClipboardList, ChevronRight, Calendar, LogIn, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";

export default function History() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useTranslation();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const data = await base44.entities.Assessment.list("-created_date", 20);
        setAssessments(data);
      } catch (err) {
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  const riskConfig = {
    low: { label: t("risk.low.short"), color: "text-emerald-300 bg-emerald-500/10" },
    moderate: { label: t("risk.moderate.short"), color: "text-amber-300 bg-amber-500/10" },
    high: { label: t("risk.high.short"), color: "text-orange-300 bg-orange-500/10" },
    severe: { label: t("risk.severe.short"), color: "text-red-300 bg-red-500/10" }
  };

  // Guest: prompt to login
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center pt-2">
          <h1 className="text-2xl font-bold text-slate-100">{t("history.title")}</h1>
          <p className="text-sm text-slate-400 mt-1.5">{t("history.subtitle")}</p>
        </div>
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 mb-4">{t("history.loginPrompt")}</p>
          <div className="flex gap-2 justify-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white transition-colors">
              <LogIn className="w-4 h-4" />
              {t("nav.login")}
            </Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 bg-slate-900 text-slate-200 text-sm font-semibold px-5 py-2.5 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors">
              {t("nav.register")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Trend data (oldest → newest)
  const trendData = [...assessments]
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .map((a) => ({
      score: a.risk_score || 0,
      date: new Date(a.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short" }),
      risk: a.risk_level,
    }));

  // Trend direction (lower score = better/improving)
  let trend = "stable";
  let trendIcon = <Minus className="w-4 h-4" />;
  let trendColor = "text-slate-400";
  if (trendData.length >= 2) {
    const first = trendData[0].score;
    const last = trendData[trendData.length - 1].score;
    if (last < first - 5) {
      trend = "up";
      trendIcon = <TrendingUp className="w-4 h-4" />;
      trendColor = "text-emerald-300";
    } else if (last > first + 5) {
      trend = "down";
      trendIcon = <TrendingDown className="w-4 h-4" />;
      trendColor = "text-red-300";
    }
  }
  const trendLabel = trend === "up" ? t("history.trendUp") : trend === "down" ? t("history.trendDown") : t("history.trendStable");

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-slate-100">{t("history.title")}</h1>
        <p className="text-sm text-slate-400 mt-1.5">{t("history.subtitle")}</p>
        <p className="text-[10px] text-slate-600 mt-1">{t("history.latestOnly")}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
        </div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 mb-4">{t("history.empty")}</p>
          <Link to="/assessment" className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white transition-colors">
            <ClipboardList className="w-4 h-4" />
            {t("history.start")}
          </Link>
        </div>
      ) : (
        <>
          {/* Trend chart */}
          {trendData.length >= 2 && (
            <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100">{t("history.trend")}</h3>
                <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                  {trendIcon}
                  {trendLabel}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f0a8b0" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f0a8b0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a", fontSize: 12, color: "#e2e8f0" }} />
                  <Area type="monotone" dataKey="score" stroke="#f0a8b0" strokeWidth={2} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                {trend === "up" ? t("history.trendUp") : trend === "down" ? t("history.trendDown") : t("history.trendStable")}
                {" · "}
                {trendData[0].score} → {trendData[trendData.length - 1].score}
              </p>
            </div>
          )}

          {/* Assessment list */}
          <div className="space-y-3">
            {assessments.map((a) => {
              const risk = riskConfig[a.risk_level] || riskConfig.moderate;
              return (
                <Link
                  key={a.id}
                  to={`/result/${a.id}`}
                  className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-3"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${risk.color}`}>
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${risk.color}`}>{risk.label}</span>
                      <span className="text-xs text-slate-500">{a.risk_score || 0}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{a.ai_summary}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
