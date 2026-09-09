import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bug, Zap, HelpCircle, MessageSquare, Mail, Send, Loader2, Check, ArrowLeft, LogIn } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/lib/i18n";

const typeIcons = { bug: Bug, glitch: Zap, question: HelpCircle, feedback: MessageSquare, other: Mail };

export default function ContactAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t, lang } = useTranslation();
  const [type, setType] = useState("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setError(t("contact.errorShort"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await base44.entities.ContactRequest.create({
        type,
        subject: subject.trim(),
        message: message.trim(),
        language: lang,
        status: "pending",
      });
      setSuccess(true);
    } catch (err) {
      setError(t("contact.error"));
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 text-center space-y-5 w-full"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto"
          >
            <Check className="w-8 h-8 text-emerald-300" />
          </motion.div>
          <p className="text-sm text-slate-300 leading-relaxed">{t("contact.success")}</p>
          <button
            onClick={() => navigate("/community")}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white transition-colors mx-auto"
          >
            {t("contact.back")}
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 text-center space-y-5 w-full"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <LogIn className="w-7 h-7 text-amber-300" />
          </div>
          <p className="text-sm text-slate-300">{t("contact.loginPrompt")}</p>
          <button
            onClick={() => navigate("/login?returnTo=/contact-admin")}
            className="flex items-center gap-1.5 bg-slate-100 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white transition-colors mx-auto"
          >
            <LogIn className="w-4 h-4" />
            {t("nav.login")}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/community")}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t("contact.back")}
      </button>

      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold text-slate-100">{t("contact.title")}</h1>
        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{t("contact.subtitle")}</p>
      </div>

      {/* Type selection */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {Object.entries(typeIcons).map(([key, Icon]) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              type === key
                ? "border-rose-400/60 bg-rose-500/10 text-slate-100"
                : "border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] text-center leading-tight">{t(`contact.type.${key}`)}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-200">{t("contact.subject")}</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t("contact.subjectPlaceholder")}
            className="w-full text-sm text-slate-200 p-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:outline-none focus:border-slate-600 placeholder:text-slate-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-200">{t("contact.message")}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t("contact.messagePlaceholder")}
            rows={6}
            className="w-full text-sm text-slate-200 p-3 rounded-xl bg-slate-800/60 border border-slate-700 resize-none focus:outline-none focus:border-slate-600 placeholder:text-slate-500"
          />
        </div>
        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-xl text-center border border-red-500/20">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("contact.submitting")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {t("contact.submit")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
