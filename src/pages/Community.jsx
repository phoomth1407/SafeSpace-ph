import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send, PenLine, X, Heart, LogIn, Megaphone, Filter, ArrowLeft, Ban, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import CommunityPostCard from "@/components/CommunityPostCard";
import { categoryLabels } from "@/lib/assessmentQuestions";
import { useTranslation } from "@/lib/i18n";

export default function Community() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t, lang } = useTranslation();
  const isAdmin = user?.role === "admin";
  const isBanned = !!user?.banned;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [authorName, setAuthorName] = useState("");
  const [anon, setAnon] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [focusedPostId, setFocusedPostId] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CommunityPost.list("-created_date", 50);
      setPosts(data);
    } catch (err) {
      setError(t("community.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    const params = new URLSearchParams(window.location.search);
    const focus = params.get("focus");
    if (focus) setFocusedPostId(focus);
  }, []);

  const handleDeletePost = async (id) => {
    try {
      await base44.entities.CommunityPost.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
      if (focusedPostId === id) setFocusedPostId(null);
    } catch (err) {
      alert(t("community.deletePostError"));
    }
  };

  const handleSubmit = async () => {
    if (content.trim().length < 10) {
      setError(t("community.errorShort"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("analyzeCommunityPost", {
        content: content.trim(),
        category,
        author_name: anon ? "anonymous" : authorName.trim() || "anonymous",
        ai_enabled: aiEnabled,
        language: lang,
      });
      if (res.data?.error) {
        setError(res.data.error === "banned" ? t("community.banned") : res.data.error);
      } else {
        setContent("");
        setCategory("other");
        setShowForm(false);
        await loadPosts();
      }
    } catch (err) {
      setError(t("community.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnnounce = async () => {
    if (content.trim().length < 5) {
      setError(t("community.errorShort"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await base44.entities.CommunityPost.create({
        content: content.trim(),
        category: "other",
        is_announcement: true,
        author_name: "Admin",
        ai_risk_flag: "safe",
        ai_response: "",
      });
      setContent("");
      setShowAnnounce(false);
      await loadPosts();
    } catch (err) {
      setError(t("community.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const announcements = posts.filter((p) => p.is_announcement);
  const userPosts = posts.filter((p) => !p.is_announcement);
  const filteredPosts = filter === "all" ? userPosts : userPosts.filter((p) => p.category === filter);
  const sortedPosts = [...filteredPosts].sort((a, b) => (b.bumps || 0) - (a.bumps || 0));

  const renderForm = (isAnnounce) => (
    <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
          {isAnnounce ? <Megaphone className="w-4 h-4 text-amber-300" /> : <PenLine className="w-4 h-4" />}
          {isAnnounce ? t("community.postAnnouncement") : t("community.writeTitle")}
        </span>
        <button
          onClick={() => { setShowForm(false); setShowAnnounce(false); setContent(""); setError(null); }}
          className="text-slate-500 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!isAnnounce && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(categoryLabels).map(([key, labelObj]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  category === key ? "bg-slate-100 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {labelObj[lang] || labelObj.th}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("community.authorPlaceholder")}
              disabled={anon}
              className="flex-1 text-sm text-slate-200 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-slate-600 placeholder:text-slate-500 disabled:opacity-40"
            />
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="accent-rose-500" />
              {t("community.anonToggle")}
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none bg-slate-800/40 rounded-xl p-2.5 border border-slate-700">
            <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} className="accent-sky-500" />
            <div className="flex flex-col">
              <span className="text-slate-200">{t("community.aiToggle")}</span>
              <span className="text-[10px] text-slate-500">{t("community.aiToggleDesc")}</span>
            </div>
          </label>
        </>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("community.contentPlaceholder")}
        rows={5}
        className="w-full text-sm text-slate-200 p-3 rounded-xl bg-slate-800/60 border border-slate-700 resize-none focus:outline-none focus:border-slate-600 placeholder:text-slate-500"
      />
      {error && <div className="text-xs text-red-400">{error}</div>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">{content.length} {t("community.chars")}</span>
        <button
          onClick={isAnnounce ? handleAnnounce : handleSubmit}
          disabled={submitting || content.trim().length < (isAnnounce ? 5 : 10)}
          className="flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isAnnounce ? <Megaphone className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
          {submitting ? t("community.analyzing") : isAnnounce ? t("community.postAnnouncement") : t("community.post")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-slate-100">{t("community.title")}</h1>
        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{t("community.subtitle")}</p>
        <button
          onClick={() => navigate("/contact-admin")}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800 rounded-full px-3 py-1.5 hover:border-slate-700 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          {t("contact.tab")}
        </button>
      </div>

      {/* Banned notice */}
      {isAuthenticated && isBanned && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center flex items-center justify-center gap-2">
          <Ban className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-300">{t("community.banned")}</p>
        </div>
      )}

      {/* Write button / form */}
      {!isAuthenticated ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-300 mb-3">
            <LogIn className="w-4 h-4 inline mr-1" />
            {t("community.loginPrompt")}
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => navigate("/login")} className="bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-white transition-colors">
              {t("community.login")}
            </button>
            <button onClick={() => navigate("/register")} className="bg-slate-900 text-slate-200 text-sm font-semibold px-4 py-2 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors">
              {t("community.register")}
            </button>
          </div>
        </div>
      ) : isBanned ? null : !showForm && !showAnnounce ? (
        <div className="space-y-2">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-slate-900/60 rounded-2xl p-4 border border-dashed border-slate-700 text-slate-500 text-sm hover:border-slate-600 hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <PenLine className="w-4 h-4" />
            {t("community.writePlaceholder")}
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAnnounce(true)}
              className="w-full bg-amber-500/10 rounded-2xl p-3 border border-amber-500/20 text-amber-300 text-sm hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              {t("community.postAnnouncement")}
            </button>
          )}
        </div>
      ) : showAnnounce ? (
        renderForm(true)
      ) : (
        renderForm(false)
      )}

      {/* Filter bar */}
      {!focusedPostId && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${filter === "all" ? "bg-slate-100 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            {t("community.filter.all")}
          </button>
          {Object.entries(categoryLabels).map(([key, labelObj]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${filter === key ? "bg-slate-100 text-slate-900" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
            >
              {labelObj[lang] || labelObj.th}
            </button>
          ))}
        </div>
      )}

      {/* Focused post (comments open) */}
      {focusedPostId && (
        <button
          onClick={() => setFocusedPostId(null)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("community.back")}
        </button>
      )}

      {/* Announcements (always at top, not filtered/focused) */}
      {!focusedPostId && announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              isOwner={user?.id === post.created_by_id}
              user={user}
              onDelete={handleDeletePost}
              isAnnouncement
            />
          ))}
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
          </div>
        ) : focusedPostId ? (
          (() => {
            const p = posts.find((x) => x.id === focusedPostId);
            return p ? (
              <CommunityPostCard
                post={p}
                isAdmin={isAdmin}
                isOwner={user?.id === p.created_by_id}
                user={user}
                onDelete={handleDeletePost}
                focused
                onFocus={() => setFocusedPostId(null)}
              />
            ) : null;
          })()
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-sm text-slate-500">{t("community.empty")}</p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              isOwner={user?.id === post.created_by_id}
              user={user}
              onDelete={handleDeletePost}
              onFocus={() => setFocusedPostId(post.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
