import React, { useState } from "react";
import { Flag, X, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "@/lib/i18n";

export default function ReportButton({ targetType, targetId, reportedUserId, postId, targetContent }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [done, setDone] = useState(false);

  const reasons = ["profanity", "harassment", "spam", "inappropriate"];

  const handleReport = async (reasonKey) => {
    setReporting(true);
    try {
      await base44.entities.Report.create({
        target_type: targetType,
        target_id: targetId,
        post_id: postId,
        reason: t(`report.reason.${reasonKey}`),
        reported_user_id: reportedUserId || "",
        status: "pending",
        target_content: targetContent || "",
      });
      setDone(true);
      setTimeout(() => {
        setDone(false);
        setShow(false);
      }, 1800);
    } catch {
      setReporting(false);
    }
  };

  if (done) {
    return (
      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
        <Check className="w-3 h-3" />
        {t("report.done")}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-400 transition-colors"
        title={t("report.button")}
      >
        <Flag className="w-3 h-3" />
      </button>

      {show && (
        <div className="absolute right-0 top-5 z-20 bg-card border border-border rounded-xl p-2 shadow-lg min-w-[160px] space-y-1">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="text-[10px] font-medium text-foreground">{t("report.title")}</span>
            <button onClick={() => setShow(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => handleReport(r)}
              disabled={reporting}
              className="w-full text-left text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1.5 rounded-lg transition-colors disabled:opacity-40"
            >
              {t(`report.reason.${r}`)}
            </button>
          ))}
          {reporting && (
            <div className="flex justify-center py-1">
              <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
