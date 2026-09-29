import React, { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  SAFESPACE_POLICY_EN,
  SAFESPACE_POLICY_TH,
  SAFESPACE_POLICY_VERSION,
  SAFESPACE_POLICY_LAST_UPDATED_EN,
  SAFESPACE_POLICY_LAST_UPDATED_TH,
} from "@/lib/safespacePolicy";

export default function SafeSpacePolicyModal({ open, onAccept, onClose }) {
  const { lang } = useTranslation();
  const [atEnd, setAtEnd] = useState(false);
  const sections = lang === "en" ? SAFESPACE_POLICY_EN : SAFESPACE_POLICY_TH;
  const title = lang === "en" ? "SafeSpace Policy" : "นโยบาย SafeSpace";
  const intro = lang === "en"
    ? "Please read this product-wide policy before creating an account or signing in."
    : "กรุณาอ่านนโยบายภาพรวมของ SafeSpace ก่อนสร้างบัญชีหรือเข้าสู่ระบบ";

  useEffect(() => {
    if (open) setAtEnd(false);
  }, [open]);

  if (!open) return null;

  const handleAccept = () => {
    if (!atEnd) return;
    onAccept?.();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-[24px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="safespace-policy-title"
    >
      <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col">
        <div className="px-5 sm:px-7 py-5 border-b border-slate-800 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-sky-300" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 mb-1">SafeSpace</div>
            <h2 id="safespace-policy-title" className="text-xl font-bold text-slate-100">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-6">{intro}</p>
          </div>
        </div>

        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 16);
          }}
          className="overflow-y-auto px-5 sm:px-7 py-5 space-y-5 text-sm leading-7 text-slate-300 overscroll-contain"
        >
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h3 className="font-semibold text-slate-100 mb-1">{heading}</h3>
              <p>{body}</p>
            </section>
          ))}
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4 text-xs text-slate-400 leading-6">
            {lang === "en"
              ? `Policy version: ${SAFESPACE_POLICY_VERSION} • Last updated: ${SAFESPACE_POLICY_LAST_UPDATED_EN}`
              : `เวอร์ชันนโยบาย: ${SAFESPACE_POLICY_VERSION} • ปรับปรุงล่าสุด: ${SAFESPACE_POLICY_LAST_UPDATED_TH}`}
          </div>
        </div>

        <div className="px-5 sm:px-7 py-4 border-t border-slate-800 bg-slate-950/95">
          <div className="flex items-center justify-between gap-4 mb-3 text-xs">
            <span className={atEnd ? "text-emerald-300" : "text-slate-500"}>
              {atEnd
                ? (lang === "en" ? "✓ You reached the end of the policy" : "✓ คุณอ่านถึงท้ายเอกสารแล้ว")
                : (lang === "en" ? "Scroll to the bottom to continue" : "เลื่อนอ่านให้ถึงด้านล่างเพื่อดำเนินการต่อ")}
            </span>
            <span className="text-slate-600">
              {lang === "en" ? "Required before authentication" : "ต้องอ่านและยอมรับก่อนยืนยันตัวตน"}
            </span>
          </div>
          <div className="flex gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-slate-700 text-slate-300 text-sm font-semibold hover:bg-slate-900 transition-colors"
              >
                {lang === "en" ? "Cancel" : "ยกเลิก"}
              </button>
            )}
            <button
              type="button"
              disabled={!atEnd}
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-900 text-sm font-semibold py-3 rounded-2xl hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="w-4 h-4" />
              {lang === "en" ? "Agree & Continue" : "ยอมรับและดำเนินการต่อ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
