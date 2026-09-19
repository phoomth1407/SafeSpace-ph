import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ClipboardList, ChevronRight, Calendar, LogIn, TrendingUp, TrendingDown, Minus, Trash2, Sparkles, ArrowUpRight } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { appClient } from "@/api/appClient";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Surface from "@/components/fx/Surface";
import { Reveal, Stagger, StaggerItem } from "@/components/fx/Reveal";

export default function History() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useTranslation();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) { setLoading(false); return; }
      setLoadError(false);
      try {
        const data = await appClient.entities.Assessment.list("-created_date", 20);
        setAssessments(data);
      } catch (err) {
        setAssessments([]);
        setLoadError(true);
      } finally { setLoading(false); }
    };
    load();
    const retry = () => load();
    window.addEventListener("safespace:history-retry", retry);
    return () => window.removeEventListener("safespace:history-retry", retry);
  }, [isAuthenticated]);

  const handleDelete = (assessment) => { if (assessment?.id) setDeleteTarget(assessment); };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeletingId(deleteTarget.id);
    setDeleteError(false);
    try {
      await appClient.entities.Assessment.delete(deleteTarget.id);
      setAssessments((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) { setDeleteError(true); }
    finally { setDeletingId(null); }
  };

  const riskConfig = {
    low: { label: t("risk.low.short"), color: "text-emerald-300 bg-emerald-500/10 border-emerald-400/15", accent: "emerald" },
    moderate: { label: t("risk.moderate.short"), color: "text-amber-300 bg-amber-500/10 border-amber-400/15", accent: "amber" },
    high: { label: t("risk.high.short"), color: "text-orange-300 bg-orange-500/10 border-orange-400/15", accent: "orange" },
    severe: { label: t("risk.severe.short"), color: "text-red-300 bg-red-500/10 border-red-400/15", accent: "red" }
  };

  if (!isAuthenticated) {
    return (
      <div className="history-page max-w-4xl mx-auto space-y-6">
        <Reveal className="history-hero">
          <div className="history-hero-glow" />
          <div className="history-hero-icon"><ClipboardList className="w-6 h-6" /></div>
          <div className="history-hero-copy">
            <span className="history-eyebrow"><Sparkles className="w-3.5 h-3.5" /> {t("history.title")}</span>
            <h1>{t("history.title")}</h1>
            <p>{t("history.subtitle")}</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <Surface className="history-login-card p-7 sm:p-9 text-center">
            <div className="history-empty-orb"><LogIn className="w-7 h-7" /></div>
            <p className="text-sm text-slate-300 dark:text-slate-300 mb-5">{t("history.loginPrompt")}</p>
            <div className="flex gap-2.5 justify-center flex-wrap">
              <Link to="/login" className="ss-btn"><LogIn className="w-4 h-4" />{t("nav.login")}</Link>
              <Link to="/register" className="ss-btn-ghost">{t("nav.register")}</Link>
            </div>
          </Surface>
        </Reveal>
      </div>
    );
  }

  const trendData = [...assessments].sort((a, b) => new Date(a.created_date) - new Date(b.created_date)).map((a) => ({
    score: a.risk_score || 0,
    date: new Date(a.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short" }),
    risk: a.risk_level,
  }));

  let trend = "stable";
  let trendIcon = <Minus className="w-4 h-4" />;
  let trendColor = "text-slate-400";
  if (trendData.length >= 2) {
    const first = trendData[0].score;
    const last = trendData[trendData.length - 1].score;
    if (last < first - 5) { trend = "up"; trendIcon = <TrendingUp className="w-4 h-4" />; trendColor = "text-emerald-300"; }
    else if (last > first + 5) { trend = "down"; trendIcon = <TrendingDown className="w-4 h-4" />; trendColor = "text-red-300"; }
  }
  const trendLabel = trend === "up" ? t("history.trendUp") : trend === "down" ? t("history.trendDown") : t("history.trendStable");
  const latest = assessments[0];

  return (
    <div className="history-page max-w-5xl mx-auto space-y-7">
      <Reveal className="history-hero">
        <div className="history-hero-glow" />
        <div className="history-hero-art" aria-hidden="true"><span /><span /><span /><span /><div className="history-art-line" /></div>
        <div className="history-hero-icon"><ClipboardList className="w-6 h-6" /></div>
        <div className="history-hero-copy">
          <span className="history-eyebrow"><Sparkles className="w-3.5 h-3.5" /> {t("history.latestOnly")}</span>
          <h1>{t("history.title")}</h1>
          <p>{t("history.subtitle")}</p>
        </div>
        <div className="history-count-card"><span>{assessments.length}</span><small>{lang === "en" ? "saved" : "รายการ"}</small></div>
      </Reveal>

      {loading ? (
        <Surface className="history-state-card p-12" as="section"><Loader2 className="w-7 h-7 text-sky-300 animate-spin" /><p>{lang === "en" ? "Loading your history..." : "กำลังโหลดประวัติของคุณ..."}</p></Surface>
      ) : loadError ? (
        <Surface className="history-state-card p-10" as="section">
          <div className="history-empty-orb is-error"><ClipboardList className="w-6 h-6" /></div><p>{t("history.error")}</p>
          <button type="button" onClick={() => { setLoading(true); setLoadError(false); window.dispatchEvent(new Event("safespace:history-retry")); }} className="ss-btn">{t("history.retry")}</button>
        </Surface>
      ) : assessments.length === 0 ? (
        <Surface className="history-state-card p-10" as="section">
          <div className="history-empty-orb"><ClipboardList className="w-7 h-7" /></div><p>{t("history.empty")}</p>
          <Link to="/assessment" className="ss-btn"><ClipboardList className="w-4 h-4" />{t("history.start")}</Link>
        </Surface>
      ) : (
        <>
          <div className="history-overview-grid">
            <Reveal delay={0.04}>
              <Surface className="history-latest-card p-5 h-full" interactive>
                <div className="history-card-label"><span>{lang === "en" ? "Latest check-in" : "การประเมินล่าสุด"}</span><ArrowUpRight className="w-4 h-4" /></div>
                <div className="history-latest-row">
                  <div className="history-score-ring"><span>{latest?.risk_score || 0}</span><small>/100</small></div>
                  <div className="min-w-0">
                    <span className={"history-risk-pill " + (riskConfig[latest?.risk_level]?.color || riskConfig.moderate.color)}>{riskConfig[latest?.risk_level]?.label || riskConfig.moderate.label}</span>
                    <p>{latest?.ai_summary}</p>
                    <span className="history-date"><Calendar className="w-3.5 h-3.5" />{latest ? new Date(latest.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                  </div>
                </div>
              </Surface>
            </Reveal>
            {trendData.length >= 2 && (
              <Reveal delay={0.09}>
                <Surface className="history-trend-card p-5 h-full" as="section">
                  <div className="history-card-label"><span>{t("history.trend")}</span><span className={"history-trend-status " + trendColor}>{trendIcon}{trendLabel}</span></div>
                  <div className="history-chart-wrap">
                    <ResponsiveContainer width="100%" height={205}>
                      <AreaChart data={trendData} margin={{ top: 10, right: 6, left: -26, bottom: 0 }}>
                        <defs><linearGradient id="historyScoreGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.34} /><stop offset="100%" stopColor="#7dd3fc" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 6" stroke="rgba(148,163,184,.13)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid rgba(148,163,184,.18)", background: "rgba(15,23,42,.94)", fontSize: 12, color: "#e2e8f0", boxShadow: "0 18px 45px rgba(2,6,23,.35)" }} />
                        <Area type="monotone" dataKey="score" stroke="#7dd3fc" strokeWidth={2.5} fill="url(#historyScoreGradient)" isAnimationActive="auto" animationDuration={1100} animationBegin={120} animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="history-chart-note">{trendLabel} · {trendData[0].score} → {trendData[trendData.length - 1].score}</p>
                </Surface>
              </Reveal>
            )}
          </div>

          {deleteError && <div role="alert" className="history-error">{t("history.deleteError")}</div>}

          <section>
            <div className="history-section-heading"><div><span className="history-eyebrow">{t("history.latestOnly")}</span><h2>{t("history.title")}</h2></div><span>{assessments.length} / 20</span></div>
            <Stagger className="space-y-3.5">
              {assessments.map((a) => {
                const risk = riskConfig[a.risk_level] || riskConfig.moderate;
                return (
                  <StaggerItem key={a.id}>
                    <Surface className="history-assessment-card p-0 overflow-hidden" interactive>
                      <div className={"history-card-accent history-card-accent--" + risk.accent} />
                      <div className="flex items-center gap-4 p-4 sm:p-5">
                        <Link to={"/result/" + a.id} className="min-w-0 flex-1 flex items-center gap-3.5">
                          <div className={"history-list-icon " + risk.color}><ClipboardList className="w-5 h-5" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={"history-risk-pill " + risk.color}>{risk.label}</span>
                              <span className="history-score-mini">{a.risk_score || 0}/100</span>
                              {a.analysis_source === "offline-model" && <span className="history-offline-pill">{t("result.source.offline")}</span>}
                            </div>
                            <p className="history-summary">{a.ai_summary}</p>
                            <span className="history-date"><Calendar className="w-3.5 h-3.5" />{new Date(a.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        </Link>
                        <button type="button" aria-label={t("history.delete")} title={t("history.delete")} onClick={() => handleDelete(a)} disabled={deletingId === a.id} className="history-delete-btn">
                          {deletingId === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </Surface>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </section>
        </>
      )}

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && !deletingId && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-md rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <AlertDialogHeader><AlertDialogTitle className="text-slate-900 dark:text-slate-100">{t("history.deleteTitle")}</AlertDialogTitle><AlertDialogDescription className="text-slate-600 dark:text-slate-400">{t("history.deleteConfirm")}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>{t("history.deleteCancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={Boolean(deletingId)} className="bg-red-600 text-white hover:bg-red-700">{deletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}{t("history.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
