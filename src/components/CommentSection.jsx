import React, { useState, useEffect } from "react";
import { Loader2, Send, MessageCircle, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";
import CommentItem from "@/components/CommentItem";

export default function CommentSection({ post, user, isAdmin, expanded, onToggle }) {
  const { t, lang } = useTranslation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [anon, setAnon] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CommunityComment.filter({ post_id: post.id }, "created_date", 100);
      setComments(data);
    } catch (err) {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded) loadComments();
  }, [expanded]);

  const handleSubmit = async () => {
    if (content.trim().length < 2) {
      setError(t("community.commentShort"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("createComment", {
        post_id: post.id,
        content: content.trim(),
        author_name: anon ? "anonymous" : authorName.trim() || "anonymous",
        language: lang,
      });
      const created = res.data;
      if (created?.error) {
        setError(created.error === "banned" ? t("community.banned") : created.error);
      } else {
        setComments([...comments, created]);
        setContent("");
      }
    } catch (err) {
      setError(t("community.commentError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await base44.entities.CommunityComment.delete(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(t("community.deleteCommentError"));
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {t("community.comments")} {comments.length > 0 && `(${comments.length})`}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="space-y-2 pt-1">
          {/* Add comment */}
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={t("community.authorPlaceholder")}
                  disabled={anon}
                  className="text-xs text-slate-200 p-2 rounded-lg bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-slate-600 placeholder:text-slate-500 disabled:opacity-40 w-32"
                />
                <label className="flex items-center gap-1 text-[10px] text-slate-500 cursor-pointer select-none">
                  <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="accent-rose-500" />
                  {t("community.anonToggle")}
                </label>
              </div>
              <div className="flex items-start gap-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t("community.addComment")}
                  rows={1}
                  className="flex-1 text-xs text-slate-200 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 resize-none focus:outline-none focus:border-slate-600 placeholder:text-slate-500"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || content.trim().length < 2}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </>
          ) : null}

          {error && <p className="text-[10px] text-red-400">{error}</p>}

          {/* Comments list */}
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[10px] text-slate-500 text-center py-1">{t("community.commentEmpty")}</p>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  isOwner={user?.id === c.created_by_id}
                  isAdmin={isAdmin}
                  canReport={!!user && user?.id !== c.created_by_id && !isAdmin}
                  postId={post.id}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
