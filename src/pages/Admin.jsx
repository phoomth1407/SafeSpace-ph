import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ClipboardList, Users, AlertTriangle, TrendingUp, Trash2, Loader2, Shield, Activity, UserX, Flag, CheckCircle, Mail, Search, Filter,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { categoryLabels } from "@/lib/assessmentQuestions";
import { useTranslation } from "@/lib/i18n";

const riskColors = {
  low: "#34d399",
  moderate: "#fbbf24",
  high: "#fb923c",
  severe: "#f87171",
};

export default function Admin() {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [assessments, setAssessments] = useState([]);
  const [guestAssessments, setGuestAssessments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [banTarget, setBanTarget] = useState(null);
  const [banning, setBanning] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const [banDuration, setBanDuration] = useState("permanent");
  const [tab, setTab] = useState("overview");
  const [segment, setSegment] = useState("all");
  const [reports, setReports] = useState([]);
  const [resolving, setResolving] = useState(null);
  const [contactRequests, setContactRequests] = useState([]);
  const [resolvingContact, setResolvingContact] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, g, p, r, cr] = await Promise.all([
          base44.entities.Assessment.list("-created_date", 200),
          base44.entities.GuestAssessment.list("-created_date", 200),
          base44.entities.CommunityPost.list("-created_date", 200),
          base44.entities.Report.filter({ status: "pending" }, "-created_date", 100),
          base44.entities.ContactRequest.filter({ status: "pending" }, "-created_date", 100),
        ]);
        setAssessments(a);
        setGuestAssessments(g);
        setPosts(p);
        setReports(r);
        setContactRequests(cr);
        try {
          const u = await base44.entities.User.list("-created_date", 200);
          setUsers(u);
        } catch {}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBan = async (u) => {
    setBanning(u.id);
    try {
      if (u.banned) {
        await base44.functions.invoke("manageBan", { target_id: u.id, banned: false, banned_until: null });
        setUsers(users.map((x) => (x.id === u.id ? { ...x, banned: false, banned_until: null } : x)));
      } else {
        let bannedUntil = null;
        if (banDuration !== "permanent") {
          const days = parseInt(banDuration);
          const d = new Date();
          d.setDate(d.getDate() + days);
          bannedUntil = d.toISOString();
        }
        await base44.functions.invoke("manageBan", { target_id: u.id, banned: true, banned_until: bannedUntil });
        setUsers(users.map((x) => (x.id === u.id ? { ...x, banned: true, banned_until: bannedUntil } : x)));
      }
    } catch (err) {
      alert(t("admin.deleteFail"));
    } finally {
      setBanning(null);
      setBanTarget(null);
      setBanDuration("permanent");
    }
  };

  const handleResolveContact = async (id) => {
    setResolvingContact(id);
    try {
      await base44.entities.ContactRequest.update(id, { status: "resolved" });
      setContactRequests(contactRequests.filter((c) => c.id !== id));
    } catch {}
    setResolvingContact(null);
  };

  const handleResolveReport = async (id) => {
    setResolving(id);
    try {
      await base44.entities.Report.update(id, { status: "resolved" });
      setReports(reports.filter((r) => r.id !== id));
    } catch {}
    setResolving(null);
  };

  const handleDeletePost = async (id) => {
    if (!confirm(t("admin.deleteConfirm"))) return;
    setDeleting(id);
    try {
      await base44.entities.CommunityPost.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      alert(t("admin.deleteFail"));
    } finally {
      setDeleting(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (showBannedOnly && !u.banned) return false;
    if (userSearch.trim()) {
      const q = userSearch.trim().toLowerCase();
      if (!(u.full_name || "").toLowerCase().includes(q) && !(u.email || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
        <p className="text-sm text-slate-500 mt-3">{t("admin.loading")}</p>
      </div>
    );
  }

  const riskLabels = {
    low: t("risk.low.short"),
    moderate: t("risk.moderate.short"),
    high: t("risk.high.short"),
    severe: t("risk.severe.short"),
  };

  // Dedupe: keep only the latest assessment per user (anti-spam in backend view)
  const latestByUser = {};
  assessments.forEach((a) => {
    const uid = a.created_by_id || a.id;
    if (!latestByUser[uid] || new Date(a.created_date) > new Date(latestByUser[uid].created_date)) {
      latestByUser[uid] = a;
    }
  });
  const latestAssessments = Object.values(latestByUser).sort(
    (a, b) => new Date(b.created_date) - new Date(a.created_date)
  );

  // Filter by segment: all / under20 / over20 / foreigner
  const filteredAssessments = segment === "all"
    ? latestAssessments
    : segment === "foreigner"
      ? latestAssessments.filter((a) => a.nationality === "foreigner")
      : latestAssessments.filter((a) => a.age_group === segment);

  const segments = [
    { id: "all", label: t("admin.seg.all") },
    { id: "under20", label: t("admin.seg.under20") },
    { id: "over20", label: t("admin.seg.over20") },
    { id: "foreigner", label: t("admin.seg.foreigner") },
  ];

  // Statistics (based on latest-per-user)
  const riskCounts = { low: 0, moderate: 0, high: 0, severe: 0 };
  filteredAssessments.forEach((a) => {
    if (riskCounts[a.risk_level] !== undefined) riskCounts[a.risk_level]++;
  });

  const highRiskCount = riskCounts.high + riskCounts.severe;
  const highRiskPct = filteredAssessments.length
    ? Math.round((highRiskCount / filteredAssessments.length) * 100)
    : 0;

  const catCounts = {};
  posts.forEach((p) => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
  });
  const catData = Object.entries(catCounts).map(([key, count]) => ({
    name: categoryLabels[key]?.[lang] || categoryLabels.other[lang],
    count,
  }));

  const pieData = Object.entries(riskCounts).map(([key, value]) => ({
    name: riskLabels[key],
    value,
    key,
  }));

  const guestRiskCounts = { low: 0, moderate: 0, high: 0, severe: 0 };
  guestAssessments.forEach((g) => {
    if (guestRiskCounts[g.risk_level] !== undefined) guestRiskCounts[g.risk_level]++;
  });
  const guestPieData = Object.entries(guestRiskCounts).map(([key, value]) => ({
    name: riskLabels[key],
    value,
    key,
  }));

  const tabs = [
    { id: "overview", label: t("admin.tab.overview") },
    { id: "guest", label: t("admin.tab.guest") },
    { id: "reports", label: t("admin.tab.reports") },
    { id: "contact", label: t("admin.tab.contact") },
    { id: "users", label: t("admin.tab.users") },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{t("admin.title")}</h1>
          <p className="text-xs text-slate-500">{t("admin.subtitle")}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800 w-fit">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`text-xs px-4 py-2 rounded-lg transition-colors ${
              tab === tb.id ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          {/* Segment filter */}
          <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800 w-fit flex-wrap">
            <span className="text-xs text-slate-500 px-2">{t("admin.segLabel")}</span>
            {segments.map((sg) => (
              <button
                key={sg.id}
                onClick={() => setSegment(sg.id)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  segment === sg.id ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sg.label}
              </button>
            ))}
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center mb-2">
                <ClipboardList className="w-4.5 h-4.5 text-sky-300" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{filteredAssessments.length}</div>
              <div className="text-xs text-slate-500">{t("admin.assessments")}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center mb-2">
                <AlertTriangle className="w-4.5 h-4.5 text-red-300" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{highRiskPct}%</div>
              <div className="text-xs text-slate-500">{t("admin.highRisk")}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center mb-2">
                <Users className="w-4.5 h-4.5 text-rose-300" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{posts.length}</div>
              <div className="text-xs text-slate-500">{t("admin.posts")}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2">
                <Activity className="w-4.5 h-4.5 text-amber-300" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{posts.filter((p) => p.ai_risk_flag === "high").length}</div>
              <div className="text-xs text-slate-500">{t("admin.highRiskPosts")}</div>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 mb-1">{t("admin.riskDist")}</h3>
              <p className="text-xs text-slate-500 mb-3">{filteredAssessments.length} {t("admin.riskDistSub")}</p>
              {filteredAssessments.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={riskColors[entry.key]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a", fontSize: 12, color: "#e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-slate-600">{t("admin.noData")}</div>
              )}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {pieData.map((d) => (
                  <div key={d.key} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: riskColors[d.key] }} />
                    <span className="text-xs text-slate-400">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-100 mb-1">{t("admin.postsByCat")}</h3>
              <p className="text-xs text-slate-500 mb-3">{posts.length} {t("admin.postsByCatSub")}</p>
              {catData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={catData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a", fontSize: 12, color: "#e2e8f0" }} />
                    <Bar dataKey="count" fill="#608AD9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-slate-600">{t("admin.noData")}</div>
              )}
            </motion.div>
          </div>

          {/* Recent assessments */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-100">{t("admin.recentAssessments")}</h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredAssessments.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: riskColors[a.risk_level] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-200">{riskLabels[a.risk_level]}</span>
                      <span className="text-xs text-slate-500">{a.risk_score || 0}</span>
                      {a.age_group && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {a.age_group === "under20" ? "<20" : "20+"}
                        </span>
                      )}
                      {a.nationality === "foreigner" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">INTL</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{a.ai_summary}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">
                    {new Date(a.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
              {filteredAssessments.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{t("admin.noData")}</p>}
            </div>
          </div>

          {/* Community posts management */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-100">{t("admin.managePosts")}</h3>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {posts.map((p) => (
                <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {categoryLabels[p.category]?.[lang] || categoryLabels.other[lang]}
                      </span>
                      {p.ai_risk_flag === "high" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-300">{t("riskflag.high")}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{p.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(p.id)}
                    disabled={deleting === p.id}
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
              {posts.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{t("admin.noPosts")}</p>}
            </div>
          </div>
        </>
      ) : tab === "guest" ? (
        /* Guest assessments tab */
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{t("admin.guestAssessments")}</h3>
              <p className="text-xs text-slate-500">{t("admin.guestSub")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-slate-700/40 flex items-center justify-center mb-2">
                <UserX className="w-4.5 h-4.5 text-slate-300" />
              </div>
              <div className="text-2xl font-bold text-slate-100">{guestAssessments.length}</div>
              <div className="text-xs text-slate-500">{t("admin.guestAssessments")}</div>
            </div>
            {Object.entries(riskCounts).map(([key]) => {
              const count = guestAssessments.filter((g) => g.risk_level === key).length;
              return (
                <div key={key} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                  <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ background: riskColors[key] }} />
                  <div className="text-2xl font-bold text-slate-100">{count}</div>
                  <div className="text-xs text-slate-500">{riskLabels[key]}</div>
                </div>
              );
            })}
          </div>

          {/* Guest depression donut */}
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 mb-1">{t("admin.guestDepression")}</h3>
            <p className="text-xs text-slate-500 mb-3">{t("admin.guestDepressionSub")}</p>
            {guestAssessments.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={guestPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {guestPieData.map((entry, i) => <Cell key={i} fill={riskColors[entry.key]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #1e293b", background: "#0f172a", fontSize: 12, color: "#e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {guestPieData.map((d) => (
                    <div key={d.key} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: riskColors[d.key] }} />
                      <span className="text-xs text-slate-400">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-slate-600">{t("admin.guestEmpty")}</div>
            )}
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {guestAssessments.map((g) => (
                <div key={g.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800">
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: riskColors[g.risk_level] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-200">{riskLabels[g.risk_level]}</span>
                      <span className="text-xs text-slate-500">{g.risk_score || 0}</span>
                      {g.language && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">{g.language === "en" ? "EN" : "ไทย"}</span>}
                    </div>
                    {g.depression_chance && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{g.depression_chance}</p>}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{g.ai_summary}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 flex-shrink-0">
                    {new Date(g.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {guestAssessments.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{t("admin.guestEmpty")}</p>}
            </div>
          </div>
        </div>
      ) : tab === "reports" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{t("admin.reports")}</h3>
              <p className="text-xs text-slate-500">{reports.length} {t("admin.tab.reports")}</p>
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {reports.map((r) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Flag className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {r.target_type === "post" ? t("admin.managePosts") : t("community.comments")}
                      </span>
                      <span className="text-xs text-amber-300">{r.reason}</span>
                    </div>
                    {r.target_content && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-1">{r.target_content}</p>
                    )}
                    <p className="text-[10px] text-slate-600">
                      {new Date(r.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Link
                      to={`/community?focus=${r.post_id}`}
                      className="text-[10px] text-sky-300 hover:text-sky-200 px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors text-center"
                    >
                      {t("admin.viewPost")}
                    </Link>
                    <button
                      onClick={() => handleResolveReport(r.id)}
                      disabled={resolving === r.id}
                      className="text-[10px] text-emerald-300 hover:text-emerald-200 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 flex items-center gap-1 justify-center"
                    >
                      {resolving === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      {t("admin.markResolved")}
                    </button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{t("admin.noReports")}</p>}
            </div>
          </div>
        </div>
      ) : tab === "contact" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{t("admin.contact")}</h3>
              <p className="text-xs text-slate-500">{contactRequests.length} {t("admin.tab.contact")}</p>
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {contactRequests.map((c) => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        {t(`contact.type.${c.type}`)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200">{c.subject}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">{c.message}</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      {new Date(c.created_date).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleResolveContact(c.id)}
                    disabled={resolvingContact === c.id}
                    className="flex-shrink-0 text-[10px] text-emerald-300 hover:text-emerald-200 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-40 flex items-center gap-1"
                  >
                    {resolvingContact === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                    {t("admin.markResolved")}
                  </button>
                </div>
              ))}
              {contactRequests.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{t("admin.noContact")}</p>}
            </div>
          </div>
        </div>
      ) : tab === "users" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-100">{t("admin.users")}</h3>
              <p className="text-xs text-slate-500">{users.length} {t("admin.tab.users")}</p>
            </div>
          </div>

          {/* Ban confirmation */}
          {banTarget && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-red-300">{t("admin.banConfirm")}</p>
              {!banTarget.banned && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">{t("admin.banDuration")}</span>
                  {[
                    { id: "1", label: t("admin.ban.1day") },
                    { id: "7", label: t("admin.ban.7days") },
                    { id: "30", label: t("admin.ban.30days") },
                    { id: "permanent", label: t("admin.ban.permanent") },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setBanDuration(d.id)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        banDuration === d.id ? "bg-slate-100 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setBanTarget(null); setBanDuration("permanent"); }}
                  className="text-xs text-slate-400 px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors"
                >
                  {t("community.cancel")}
                </button>
                <button
                  onClick={() => handleBan(banTarget)}
                  disabled={banning === banTarget.id}
                  className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  {banning === banTarget.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                  {banTarget.banned ? t("admin.unban") : t("admin.ban")}
                </button>
              </div>
            </div>
          )}

          {/* Search + filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[150px] relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={t("admin.searchUser")}
                className="w-full text-xs text-slate-200 pl-8 pr-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-slate-600 placeholder:text-slate-500"
              />
            </div>
            <button
              onClick={() => setShowBannedOnly(!showBannedOnly)}
              className={`text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border ${
                showBannedOnly
                  ? "bg-red-500/10 text-red-300 border-red-500/20"
                  : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {t("admin.bannedOnly")}
            </button>
          </div>

          <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredUsers.map((u) => {
                const banExpired = u.banned && u.banned_until && new Date(u.banned_until) < new Date();
                return (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-slate-300">{(u.full_name || u.email || "?").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-slate-200 truncate">{u.full_name || u.email}</span>
                        {u.role === "admin" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-900">admin</span>}
                        {u.banned && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${banExpired ? "bg-slate-700/40 text-slate-400" : "bg-red-500/10 text-red-300"}`}>
                            {banExpired ? t("admin.banExpired") : t("admin.banned")}
                            {u.banned_until && !banExpired && ` · ${new Date(u.banned_until).toLocaleDateString(lang === "en" ? "en-US" : "th-TH", { day: "numeric", month: "short" })}`}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    </div>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => { setBanTarget(banTarget?.id === u.id ? null : u); setBanDuration("permanent"); }}
                        disabled={banning === u.id}
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 ${
                          banTarget?.id === u.id
                            ? "bg-slate-700 text-slate-300"
                            : u.banned
                              ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                              : "bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        }`}
                      >
                        {u.banned ? t("admin.unban") : t("admin.ban")}
                      </button>
                    )}
                  </div>
                );
              })}
              {filteredUsers.length === 0 && <p className="text-xs text-slate-600 text-center py-4">{t("admin.noData")}</p>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
