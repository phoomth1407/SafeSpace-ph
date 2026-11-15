import React, { useState } from "react";
import { Loader2, Trash2, Heart, Pin } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import ReportButton from "@/components/ReportButton";
import CommunityTranslation from "@/components/CommunityTranslation";

export default function CommentItem({ comment, isOwner, isAdmin, canModerateComments, isPostOwner, canReport, postId, onDelete, onTogglePin }) {
  const { t, lang } = useTranslation();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  const canDelete = isOwner || isAdmin || canModerateComments;
  const authorRole = comment.author_role || "user";
  const authorColor = authorRole === "admin" ? "text-amber-400" : authorRole === "tester" ? "text-violet-400" : "text-slate-500";

  return (
    <div className="flex items-start gap-2 py-2">
      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Heart className="w-3 h-3 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${authorColor}`}>{comment.author_name || t("community.anon")}</span>
          {authorRole === "tester" && <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">{lang === "en" ? "Tester" : "ผู้ทดสอบ"}</span>}
          {authorRole === "admin" && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">{lang === "en" ? "Admin" : "ผู้ดูแล"}</span>}
          {comment.is_pinned && <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-medium text-sky-300"><Pin className="h-2.5 w-2.5" />{lang === "en" ? "Pinned" : "ปักหมุด"}</span>}
          <span className="text-[10px] text-slate-600">
            {new Date(comment.created_date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
          </span>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`ml-auto w-5 h-5 rounded flex items-center justify-center transition-colors disabled:opacity-40 ${
                confirming ? "text-red-400" : "text-slate-600 hover:text-red-400"
              }`}
              title={confirming ? t("community.confirmDelete") : t("community.delete")}
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            </button>
          )}
          {(isPostOwner || isAdmin) && (
            <button
              type="button"
              onClick={() => onTogglePin(comment.id, !comment.is_pinned)}
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${comment.is_pinned ? "text-sky-300" : "text-slate-600 hover:text-sky-300"}`}
              title={comment.is_pinned ? (lang === "en" ? "Unpin comment" : "เลิกปักหมุดความคิดเห็น") : (lang === "en" ? "Pin comment" : "ปักหมุดความคิดเห็น")}
              aria-pressed={!!comment.is_pinned}
            >
              <Pin className="w-3 h-3" />
            </button>
          )}
          {canReport && (
            <ReportButton
              targetType="comment"
              targetId={comment.id}
              reportedUserId={comment.created_by_id}
              postId={postId}
              targetContent={comment.content}
            />
          )}
        </div>
        <p data-translation-source className="text-xs text-slate-300 leading-relaxed mt-0.5">{comment.content}</p>
        <CommunityTranslation text={comment.content || ""} lang={lang} />
      </div>
    </div>
  );
}
