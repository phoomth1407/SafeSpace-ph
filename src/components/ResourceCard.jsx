import React from "react";
import { Phone, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function ResourceCard({ resource }) {
  const { t } = useTranslation();

  const categoryColors = {
    mental: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    child: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    general: "bg-slate-700/40 text-slate-300 border-slate-700",
    emergency: "bg-red-500/10 text-red-300 border-red-500/20"
  };

  const categoryLabels = {
    mental: t("rescat.mental"),
    child: t("rescat.child"),
    general: t("rescat.general"),
    emergency: t("rescat.emergency")
  };

  const colorClass = categoryColors[resource.category] || categoryColors.general;

  return (
    <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorClass} flex-shrink-0`}>
        <Phone className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-100">{resource.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colorClass}`}>{categoryLabels[resource.category]}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{resource.description}</p>
        {resource.available_hours && (
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {resource.available_hours}
          </div>
        )}
      </div>
      <a
        href={`tel:${resource.phone}`}
        className="flex-shrink-0 bg-slate-100 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white transition-colors flex items-center gap-1.5"
      >
        <Phone className="w-3.5 h-3.5" />
        {resource.phone}
      </a>
    </div>
  );
}
