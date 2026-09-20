import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

function TrendBadge({ value, positive, label }) {
  return (
    <div className={`stats-trend-badge ${positive ? "is-positive" : "is-negative"}`}>
      <span className="stats-trend-arrow" aria-hidden="true">{positive ? "↗" : "↘"}</span>
      <span>{value}</span>
      <span className="stats-trend-label">{label}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label, isLight, suffix = "" }) {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0].value);
  return (
    <div className={`stats-chart-tooltip ${isLight ? "is-light" : ""}`}>
      <div className="stats-tooltip-year">{label}</div>
      <div className="stats-tooltip-value">
        {value.toFixed(2)}{suffix}
      </div>
    </div>
  );
}

function TrendChart({
  data,
  gradientId,
  stroke,
  fillStart,
  fillEnd,
  yDomain,
  suffix,
  isLight,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 14, right: 10, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillStart} stopOpacity={0.42} />
            <stop offset="70%" stopColor={fillEnd} stopOpacity={0.10} />
            <stop offset="100%" stopColor={fillEnd} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          vertical={false}
          stroke={isLight ? "#cbd5e1" : "#334155"}
          strokeDasharray="4 7"
          strokeOpacity={0.45}
        />

        <XAxis
          dataKey="year"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: isLight ? "#64748b" : "#94a3b8" }}
          dy={8}
        />

        <YAxis
          domain={yDomain}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: isLight ? "#64748b" : "#94a3b8" }}
          tickFormatter={(value) => `${value}${suffix}`}
          width={42}
          tickCount={5}
        />

        <Tooltip
          cursor={{
            stroke: stroke,
            strokeOpacity: 0.18,
            strokeWidth: 1,
            strokeDasharray: "4 5",
          }}
          content={<ChartTooltip isLight={isLight} suffix={suffix} />}
        />

        <Area
          type="monotone"
          dataKey="rate"
          stroke={stroke}
          strokeWidth={3}
          fill={`url(#${gradientId})`}
          fillOpacity={1}
          activeDot={{
            r: 7,
            stroke: isLight ? "#ffffff" : "#0f172a",
            strokeWidth: 3,
            fill: stroke,
          }}
          dot={{
            r: 4,
            stroke: isLight ? "#ffffff" : "#0f172a",
            strokeWidth: 2,
            fill: stroke,
          }}
          isAnimationActive
          animationBegin={160}
          animationDuration={1450}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatsCard({
  title,
  source,
  trend,
  latest,
  unit,
  change,
  changeLabel,
  positive,
  children,
  accentClass,
}) {
  return (
    <article className={`stats-chart-card ${accentClass}`}>
      <div className="stats-card-glow" aria-hidden="true" />

      <div className="stats-card-header">
        <div>
          <p className="stats-card-kicker">{source}</p>
          <h3>{title}</h3>
        </div>
        <div className="stats-card-latest">
          <span className="stats-card-latest-label">ล่าสุด</span>
          <strong>{latest}<small>{unit}</small></strong>
        </div>
      </div>

      <div className="stats-card-meta">
        <TrendBadge value={change} positive={positive} label={changeLabel} />
        <span className="stats-trend-text">{trend}</span>
      </div>

      <div className="stats-chart-wrap">
        {children}
      </div>
    </article>
  );
}

export default function StatsDashboard() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="stats-dashboard">
      <StatsCard
        title={t("stats.incidence")}
        source={t("stats.source")}
        trend={t("stats.incidenceTrend")}
        latest="174.69"
        unit=""
        change="-7.69%"
        changeLabel="จากปี 2565"
        positive={true}
        accentClass="stats-card-incidence"
      >
        <TrendChart
          data={incidenceData}
          gradientId="stats-incidence-gradient"
          stroke="#ec4899"
          fillStart="#f472b6"
          fillEnd="#8b5cf6"
          yDomain={[165, 195]}
          suffix=""
          isLight={isLight}
        />
      </StatsCard>

      <StatsCard
        title={t("stats.prevalence")}
        source={t("stats.source")}
        trend={t("stats.prevalenceTrend")}
        latest="2.54"
        unit="%"
        change="+0.15 pp"
        changeLabel="จากปี 2565"
        positive={false}
        accentClass="stats-card-prevalence"
      >
        <TrendChart
          data={prevalenceData}
          gradientId="stats-prevalence-gradient"
          stroke="#8b5cf6"
          fillStart="#a78bfa"
          fillEnd="#60a5fa"
          yDomain={[2.3, 2.6]}
          suffix="%"
          isLight={isLight}
        />
      </StatsCard>
    </div>
  );
}
