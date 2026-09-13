import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Loader2, TrendingUp, Megaphone } from "lucide-react";
import { categoryLabels } from "@/lib/assessmentQuestions";
import { useTranslation } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import CommentSection from "@/components/CommentSection";
import ReportButton from "@/components/ReportButton";
import BanModal from "@/components/BanModal";

export default function CommunityPostCard({ post, isAdmin, isOwner, user, onDelete, isAnnouncement, focused, onFocus }) {
  const { t, lang } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hearts, setHearts] = useState(post.hearts || 0);
  const [bumps, setBumps] = useState(post.bumps || 0);
  const [hearted, setHearted] = useState(
    Array.isArray(post.hearted_by) && user?.id ? post.hearted_by.includes(user.id) : false
  );
  const [bumped, setBumped] = useState(
    Array.isArray(post.bumped_by) && user?.id ? post.bumped_by.includes(user.id) : false
  );
  const [interacting, setInteracting] = useState(null);
  const [banUserId, setBanUserId] = useState(null);

  const categoryColors = {
    bullying: "bg-orange-500/10 text-orange-300",
    family: "bg-purple-500/10 text-purple-300",
    study: "bg-blue-500/10 text-blue-300",
    relationship: "bg-pink-500/10 text-pink-300",
    mental: "bg-rose-500/10 text-rose-300",
    other: "bg-slate-700/40 text-slate-300"
  };

  const riskBadge = {
    safe: { label: t("riskflag.safe"), class: "bg-emerald-500/10 text-emerald-300" },
    moderate: { label: t("riskflag.moderate"), class: "bg-amber-500/10 text-amber-300" },
    high: { label: t("riskflag.high"), class: "bg-red-500/10 text-red-300" }
  };

  const catColor = categoryColors[post.category] || categoryColors.other;
  const catLabel = categoryLabels[post.category]?.[lang] || categoryLabels.other[lang];
  const risk = riskBadge[post.ai_risk_flag] || riskBadge.safe;
  const canDelete = isAdmin || isOwner;
  const authorDisplay = post.author_name || (isAnnouncement ? t("community.admin") : t("community.anon"));

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(post.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const handleInteract = async (action) => {
    setInteracting(action);
    try {
      const res = await base44.functions.invoke("communityInteract", { post_id: post.id, action });
      const data = res.data;
      if (data?.error) return;
      setHearts(data.hearts);
      setBumps(data.bumps);
      setHearted(data.hearted);
      setBumped(data.bumped);
    } catch (err) {
      // ignore
    } finally {
      setInteracting(null);
    }
  };

  if (isAnnouncement) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-amber-500/10 to-indigo-500/10 rounded-2xl p-4 border border-amber-500/30 space-y-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1 font-medium">
            <Megaphone className="w-3 h-3" />
            {t("community.announcement")}
          </span>
          {isAdmin && post.created_by_id ? (
  <button onClick={() => setBanUserId(post.created_by_id)} className="text-[10px] text-slate-500 ml-auto hover:text-rose-300 underline transition-colors">
    {authorDisplay}
  </button>
) : (
  <span className="text-[10px] text-slate-500 ml-auto">{authorDisplay}</span>
)}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${
                confirming ? "bg-red-500 text-white" : "text-slate-600 hover:bg-red-500/10 hover:text-red-400"
              }`}
              title={confirming ? t("community.confirmDelete") : t("community.deletePost")}
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
          {post.content}
        </p>

        <BanModal userId={banUserId} onClose={() => setBanUserId(null)} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${catColor}`}>{catLabel}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${risk.class}`}>{risk.label}</span>
        {isAdmin && post.created_by_id ? (
  <button onClick={() => setBanUserId(post.created_by_id)} className="text-[10px] text-slate-500 ml-auto hover:text-rose-300 underline transition-colors">
    {authorDisplay}
  </button>
) : (
  <span className="text-[10px] text-slate-500 ml-auto">{authorDisplay}</span>
)}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${
              confirming ? "bg-red-500 text-white" : "text-slate-600 hover:bg-red-500/10 hover:text-red-400"
            }`}
            title={confirming ? t("community.confirmDelete") : t("community.deletePost")}
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        )}
        {user && !isOwner && !isAdmin && (
          <ReportButton
            targetType="post"
            targetId={post.id}
            reportedUserId={post.created_by_id}
            postId={post.id}
            targetContent={post.content}
          />
        )}
      </div>

      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {post.ai_response && (
        <div className="bg-gradient-to-br from-sky-500/10 to-rose-500/10 rounded-xl p-3 border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-500/80 to-sky-500/80 flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white" fill="white" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t("community.aiSupport")}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{post.ai_response}</p>
        </div>
      )}

      {/* Interactions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => handleInteract("heart")}
          disabled={interacting === "heart" || !user}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
            hearted
              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
              : "bg-slate-800/50 text-slate-400 border-slate-700 hover:text-rose-300"
          }`}
        >
          {interacting === "heart" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className={`w-3.5 h-3.5 ${hearted ? "fill-current" : ""}`} />}
          {hearts}
        </button>
        <button
          onClick={() => handleInteract("bump")}
          disabled={interacting === "bump" || !user}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
            bumped
              ? "bg-sky-500/20 text-sky-300 border-sky-500/30"
              : "bg-slate-800/50 text-slate-400 border-slate-700 hover:text-sky-300"
          }`}
        >
          {interacting === "bump" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
          {t("community.bump")} {bumps}
        </button>
      </div>

      <CommentSection
        post={post}
        user={user}
        isAdmin={isAdmin}
        expanded={!!focused}
        onToggle={() => onFocus && onFocus(focused ? null : post.id)}
      />

      <BanModal userId={banUserId} onClose={() => setBanUserId(null)} />
    </motion.div>
  );
}
