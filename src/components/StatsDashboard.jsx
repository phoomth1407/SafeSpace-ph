import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTranslation } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const incidenceData = [
  { year: "2565", rate: 189.25 },
  { year: "2566", rate: 183.21 },
  { year: "2567", rate: 174.69 },
];

const prevalenceData = [
  { year: "2565", rate: 2.39 },
  { year: "2566", rate: 2.41 },
  { year: "2567", rate: 2.54 },
];

const barColors = ["#f472b6", "#a78bfa", "#60a5fa"];

export default function StatsDashboard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const gridColor = isLight ? "#e2e8f0" : "#1e293b";
  const axisColor = isLight ? "#64748b" : "#94a3b8";
  const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${isLight ? "#e2e8f0" : "#1e293b"}`,
    background: isLight ? "#ffffff" : "#0f172a",
    fontSize: 12,
    color: isLight ? "#0f172a" : "#e2e8f0",
  };

  return (
    <div className="space-y-6">
      {/* Chart 1: New patient incidence rate */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">{t("stats.incidence")}</h3>
        <p className="text-xs text-slate-500 mb-1">{t("stats.source")}</p>
        <p className="text-xs text-emerald-400 mb-4">{t("stats.incidenceTrend")}</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incidenceData} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: axisColor }} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} tickFormatter={(v) => v} />
            <Tooltip
              formatter={(v) => v.toFixed(2)}
              contentStyle={tooltipStyle}
              labelStyle={{ color: axisColor }}
            />
            <Bar dataKey="rate" name={t("stats.incidence")} radius={[6, 6, 0, 0]}>
              {incidenceData.map((_, i) => (
                <Cell key={i} fill={barColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Prevalence rate */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100 mb-1">{t("stats.prevalence")}</h3>
        <p className="text-xs text-slate-500 mb-1">{t("stats.source")}</p>
        <p className="text-xs text-amber-400 mb-4">{t("stats.prevalenceTrend")}</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={prevalenceData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: axisColor }} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(v) => `${v.toFixed(2)}%`}
              contentStyle={tooltipStyle}
              labelStyle={{ color: axisColor }}
            />
            <Bar dataKey="rate" name={t("stats.prevalence")} radius={[6, 6, 0, 0]}>
              {prevalenceData.map((_, i) => (
                <Cell key={i} fill={barColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
