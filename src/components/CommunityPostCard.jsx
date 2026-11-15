import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Trash2, Loader2, TrendingUp, Megaphone, Pin } from "lucide-react";
import { categoryLabels } from "@/lib/assessmentQuestions";
import { useTranslation } from "@/lib/i18n";
import { appClient } from "@/api/appClient";
import CommentSection from "@/components/CommentSection";
import ReportButton from "@/components/ReportButton";
import BanModal from "@/components/BanModal";
import CommunityTranslation from "@/components/CommunityTranslation";

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px) and (pointer: coarse)");
    const update = () => setIsPhone(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);
  return isPhone;
}

function CommunityPostCard({ post, isAdmin, canBanUsers, canModerateComments, canPinPosts, isOwner, user, onDelete, onTogglePin, isAnnouncement, focused, onFocus, onCommentIntent }) {
  const { t, lang } = useTranslation();
  const isPhone = useIsPhone();
  const Card = isPhone ? "div" : motion.div;
  const motionProps = isPhone ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };
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
  const [pinning, setPinning] = useState(false);

  const categoryColors = {
    bullying: "bg-orange-500/10 text-orange-300",
    family: "bg-purple-500/10 text-purple-300",
    study: "bg-blue-500/10 text-blue-300",
    relationship: "bg-pink-500/10 text-pink-300",
    mental: "bg-rose-500/10 text-rose-300",
    other: "bg-slate-700/40 text-slate-300"
  };

  const catColor = categoryColors[post.category] || categoryColors.other;
  const catLabel = categoryLabels[post.category]?.[lang] || categoryLabels.other[lang];
  const canDelete = isAdmin || isOwner;
  const authorDisplay = post.author_name || (isAnnouncement ? t("community.admin") : t("community.anon"));
  const authorRole = post.author_role || (isAnnouncement ? "admin" : "user");
  const authorColor = authorRole === "admin" ? "text-amber-400" : authorRole === "tester" ? "text-violet-400" : "text-slate-500";

  const togglePin = async () => {
    if (!onTogglePin || pinning) return;
    setPinning(true);
    try { await onTogglePin(post.id, !post.is_pinned); }
    finally { setPinning(false); }
  };

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
      const res = await appClient.functions.invoke("communityInteract", { post_id: post.id, action });
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
      <Card
        {...motionProps}
        className="community-post-card community-announcement-card bg-gradient-to-br from-amber-500/10 to-indigo-500/10 rounded-2xl p-4 border border-amber-500/30 space-y-3"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 flex items-center gap-1 font-medium">
            <Megaphone className="w-3 h-3" />
            {t("community.announcement")}
          </span>
          {canBanUsers && post.created_by_id ? (
  <button onClick={() => setBanUserId(post.created_by_id)} className={`text-[10px] ml-auto hover:text-rose-300 underline transition-colors ${authorColor}`}>
    {authorDisplay}
  </button>
) : (
  <span className={`text-[10px] ml-auto ${authorColor}`}>{authorDisplay}</span>
)}
          {authorRole === "tester" && <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">{lang === "en" ? "Tester" : "ผู้ทดสอบ"}</span>}
          {authorRole === "admin" && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">{lang === "en" ? "Admin" : "ผู้ดูแล"}</span>}
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
        <p data-translation-source className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
          {post.content}
        </p>
        <CommunityTranslation text={post.content || ""} lang={lang} />

        <BanModal userId={banUserId} onClose={() => setBanUserId(null)} />
      </Card>
    );
  }

  return (
    <Card
      {...motionProps}
      className="community-post-card bg-slate-900/60 rounded-2xl p-4 border border-slate-800 space-y-3"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${catColor}`}>{catLabel}</span>
        {canBanUsers && post.created_by_id ? (
  <button onClick={() => setBanUserId(post.created_by_id)} className={`text-[10px] ml-auto hover:text-rose-300 underline transition-colors ${authorColor}`}>
    {authorDisplay}
  </button>
) : (
  <span className={`text-[10px] ml-auto ${authorColor}`}>{authorDisplay}</span>
)}
        {authorRole === "tester" && <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">{lang === "en" ? "Tester" : "ผู้ทดสอบ"}</span>}
        {authorRole === "admin" && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">{lang === "en" ? "Admin" : "ผู้ดูแล"}</span>}
        {post.is_pinned && <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-medium text-sky-300"><Pin className="h-2.5 w-2.5" />{lang === "en" ? "Pinned" : "ปักหมุด"}</span>}
        {canPinPosts && !isAnnouncement && (
          <button type="button" onClick={togglePin} disabled={pinning} aria-pressed={!!post.is_pinned} title={post.is_pinned ? (lang === "en" ? "Unpin post" : "เลิกปักหมุดโพสต์") : (lang === "en" ? "Pin post" : "ปักหมุดโพสต์")} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${post.is_pinned ? "text-sky-300" : "text-slate-600 hover:text-sky-300"}`}>
            {pinning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pin className="h-3 w-3" />}
          </button>
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

      <p data-translation-source className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>
      <CommunityTranslation text={post.content || ""} lang={lang} />

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
        canModerateComments={canModerateComments}
        expanded={!!focused}
        onToggle={() => onFocus && onFocus(focused ? null : post.id)}
        onCommentIntent={onCommentIntent}
      />

      <BanModal userId={banUserId} onClose={() => setBanUserId(null)} />
    </Card>
  );
}

export default React.memo(CommunityPostCard, (prev, next) => (
  prev.post === next.post &&
  prev.isAdmin === next.isAdmin &&
  prev.canBanUsers === next.canBanUsers &&
  prev.canModerateComments === next.canModerateComments &&
  prev.canPinPosts === next.canPinPosts &&
  prev.isOwner === next.isOwner &&
  prev.user?.id === next.user?.id &&
  prev.isAnnouncement === next.isAnnouncement &&
  prev.focused === next.focused &&
  prev.onCommentIntent === next.onCommentIntent &&
  prev.onTogglePin === next.onTogglePin
));
