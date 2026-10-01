import React from "react";

export default function PolicyReaderModal({ open, title, sections = [], lang = "en", onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[310] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-[24px]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col">
        <div className="px-5 sm:px-7 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-slate-200 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-900">{lang === "en" ? "Close" : "ปิด"}</button>
        </div>
        <div className="overflow-y-auto px-5 sm:px-7 py-5 space-y-5 text-sm leading-7 text-slate-300">
          {sections.map(([heading, body]) => <section key={heading}><h3 className="font-semibold text-slate-100 mb-1">{heading}</h3><p>{body}</p></section>)}
        </div>
      </div>
    </div>
  );
}
