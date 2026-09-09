import React, { useState } from "react";
import { Loader2, Trash2, Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import ReportButton from "@/components/ReportButton";

export default function CommentItem({ comment, isOwner, isAdmin, canReport, postId, onDelete }) {
  const { t } = useTranslation();
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

  const canDelete = isOwner || isAdmin;

  return (
    <div className="flex items-start gap-2 py-2">
      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Heart className="w-3 h-3 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">{comment.author_name || t("community.anon")}</span>
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
        <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{comment.content}</p>
      </div>
    </div>
  );
}
