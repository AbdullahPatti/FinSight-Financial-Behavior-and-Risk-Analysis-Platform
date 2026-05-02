import { useState, useEffect } from "react";
// ─── CHANGE 1: import shared auth fetch helper ────────────────────────────
import { apiFetch } from "../utils/api";
// ─────────────────────────────────────────────────────────────────────────
import {
  AlertTriangle,
  Brain,
  Activity,
  Target,
  Cpu,
  TrendingUp,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  ReferenceLine,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import "../styles/analytics.css";

const COLORS = {
  primary:   "#0d9488",
  secondary: "#10b981",
  accent:    "#059669",
  gold:      "#d97706",
  purple:    "#8b5cf6",
  info:      "#06b6d4",
  danger:    "#ef4444",
  warning:   "#f59e0b",
};

const RISK_BAND_COLOR = {
  Low:      COLORS.secondary,
  Medium:   COLORS.warning,
  High:     COLORS.danger,
  Critical: "#7f1d1d",
  Unknown:  "#94a3b8",
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-xl p-3">
      <p className="font-semibold text-slate-900 mb-1 text-sm">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-sm mt-0.5" style={{ color: e.color || COLORS.primary }}>
          {e.name}: <span className="font-semibold">{e.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function renderLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="size-10 border-4 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );
}

// Classify anomaly count per category into severity buckets
function classifySeverity(count, maxCount) {
  const ratio = count / maxCount;
  if (ratio > 0.5) return "high";
  if (ratio > 0.2) return "medium";
  return "low";
}

export default function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selectedTab, setSelectedTab] = useState("risk");

  useEffect(() => {
    // ─── CHANGE 2: use apiFetch — token injected automatically ─────────────
    apiFetch("/dashboard/")
    // ───────────────────────────────────────────────────────────────────────
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(
            `Server returned non-JSON (status ${r.status}).\n` +
            `First 300 chars: ${text.slice(0, 300)}`
          );
        }
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <pre className="text-red-500 p-8 whitespace-pre-wrap text-sm">{error}</pre>;

  const {
    overview,
    risk_assessment,
    risk_timeline,
    spending_by_category,
    anomaly_by_category,
    recent_transactions,
  } = data;

  // ── Derived data ──────────────────────────────────────────────

  // Risk timeline line chart
  const riskLineData = risk_timeline.map((q) => ({
    label:          `FY${q.fiscal_year} Q${q.quarter}`,
    expRatio:       parseFloat((q.expense_to_revenue * 100).toFixed(1)),
    anomalyRate:    parseFloat((q.anomaly_rate * 100).toFixed(2)),
    currentRatio:   parseFloat(q.current_ratio.toFixed(2)),
    debtToAsset:    parseFloat((q.debt_to_asset * 100).toFixed(1)),
    riskBand:       q.risk_band,
  }));

  // Radar: financial health profile from latest quarter
  const latestQ = risk_timeline[risk_timeline.length - 1] || {};
  const radarData = [
    { metric: "Liquidity",        value: Math.min(latestQ.current_ratio * 50, 100) },
    { metric: "Debt Control",     value: Math.max(100 - latestQ.debt_to_asset * 100, 0) },
    { metric: "Exp Efficiency",   value: Math.max(100 - latestQ.expense_to_revenue * 100, 0) },
    { metric: "Anomaly Safety",   value: Math.max(100 - latestQ.anomaly_rate * 100, 0) },
    { metric: "Confidence",       value: parseFloat(((latestQ.confidence || 0) * 100).toFixed(0)) },
  ];

  // Anomaly by category bar
  const maxAnomalyCount = Math.max(...anomaly_by_category.map((a) => a.count), 1);
  const anomalyBarData = anomaly_by_category.slice(0, 10).map((a) => ({
    category: a.category.length > 16 ? a.category.slice(0, 15) + "…" : a.category,
    count:    a.count,
    severity: classifySeverity(a.count, maxAnomalyCount),
  }));

  // Anomaly timeline from recent_transactions (last 10, grouped by date)
  const dateMap = {};
  recent_transactions.forEach((t) => {
    const d = t.date || "Unknown";
    if (!dateMap[d]) dateMap[d] = { date: d, total: 0, anomalies: 0, amount: 0 };
    dateMap[d].total++;
    dateMap[d].amount += t.amount;
    if (t.is_anomaly) dateMap[d].anomalies++;
  });
  const txnTimeline = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

  // Spending categories for behavior radar (top 6)
  const topCategories = spending_by_category.slice(0, 6);
  const maxSpend = Math.max(...topCategories.map((c) => c.amount), 1);
  const behaviorRadar = topCategories.map((c) => ({
    category: c.category.length > 14 ? c.category.slice(0, 13) + "…" : c.category,
    spend:    Math.round((c.amount / maxSpend) * 100),
    count:    c.count,
  }));

  // Severity counts
  const highCount   = anomaly_by_category.filter((a) => classifySeverity(a.count, maxAnomalyCount) === "high").length;
  const mediumCount = anomaly_by_category.filter((a) => classifySeverity(a.count, maxAnomalyCount) === "medium").length;
  const lowCount    = anomaly_by_category.filter((a) => classifySeverity(a.count, maxAnomalyCount) === "low").length;

  const getSeverityClass = (severity) => {
    const map = { high: "severity-high", medium: "severity-medium", low: "severity-low" };
    return `severity-badge ${map[severity]}`;
  };

  // Average threshold for anomaly chart
  const avgAmount = recent_transactions.length
    ? recent_transactions.reduce((s, t) => s + t.amount, 0) / recent_transactions.length
    : 0;

  return (
    <div className="space-y-8 page-typography font-body">

      {/* Header */}
      <div className="analytics-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2 text-slate-900">Analytics</h1>
            <p className="text-slate-600 text-lg">
              Advanced behavioral insights and predictive financial analysis
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white px-5 py-3 rounded-xl border-2 border-teal-200 shadow-sm">
            <Cpu className="size-5 text-teal-700" />
            <span className="text-sm font-semibold text-teal-800">AI Engine Active</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="HMM State"
          value={risk_assessment.hmm_state || "—"}
          change={`Risk: ${risk_assessment.risk_band}`}
          changeType={
            risk_assessment.risk_band === "Low" ? "positive" :
            risk_assessment.risk_band === "High" || risk_assessment.risk_band === "Critical" ? "negative" : "neutral"
          }
          icon={Brain}
          description="Latest HMM behavior state"
        />
        <MetricCard
          title="Anomaly Rate"
          value={`${overview.anomaly_rate}%`}
          change={`${overview.anomaly_count} flagged`}
          changeType={overview.anomaly_rate > 5 ? "negative" : "positive"}
          icon={AlertTriangle}
          description="of all transactions"
        />
        <MetricCard
          title="Prediction Confidence"
          value={`${(risk_assessment.confidence * 100).toFixed(0)}%`}
          change={`→ ${risk_assessment.predicted_band}`}
          changeType="positive"
          icon={Target}
          description="model confidence score"
        />
        <MetricCard
          title="Quarters Tracked"
          value={risk_timeline.length}
          change="risk timeline"
          changeType="neutral"
          icon={Activity}
          description="historical quarters"
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="risk">Risk &amp; Ratios</TabsTrigger>
          <TabsTrigger value="behavior">Spending Behavior</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
        </TabsList>

        {/* ── Risk Tab ─────────────────────────────────────────── */}
        <TabsContent value="risk" className="space-y-6 mt-6">

          {/* Risk Band Timeline */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Risk Ratio Timeline</h2>
              <p className="text-slate-500">Expense-to-revenue, anomaly rate, and current ratio across quarters</p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={riskLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "12px" }} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "12px" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
                <Line type="monotone" dataKey="expRatio"    stroke={COLORS.primary}   strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.primary, stroke: "white", strokeWidth: 2 }} name="Expense Ratio %" />
                <Line type="monotone" dataKey="anomalyRate" stroke={COLORS.danger}    strokeWidth={2.5}
                  dot={{ r: 4, fill: COLORS.danger,  stroke: "white", strokeWidth: 2 }} name="Anomaly Rate %" />
                <Line type="monotone" dataKey="currentRatio" stroke={COLORS.gold}    strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 3, fill: COLORS.gold, stroke: "white", strokeWidth: 2 }} name="Current Ratio" />
                <Line type="monotone" dataKey="debtToAsset" stroke={COLORS.purple}   strokeWidth={2}
                  strokeDasharray="3 4"
                  dot={{ r: 3, fill: COLORS.purple, stroke: "white", strokeWidth: 2 }} name="Debt-to-Asset %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Health Radar + Risk Band History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Financial Health Profile</h2>
                <p className="text-slate-500">Latest quarter — normalised scores (0–100)</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8"
                    style={{ fontSize: "12px" }} />
                  <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                  <Radar name="Score" dataKey="value" stroke={COLORS.primary}
                    fill={COLORS.primary} fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Band History */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Risk Band History</h2>
                <p className="text-slate-500">Actual vs predicted risk classification per quarter</p>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {[...risk_timeline].reverse().map((q) => (
                  <div key={`${q.fiscal_year}-${q.quarter}`}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm font-medium text-slate-700">
                      FY{q.fiscal_year} Q{q.quarter}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold text-white"
                        style={{ backgroundColor: RISK_BAND_COLOR[q.risk_band] || "#94a3b8" }}
                      >
                        {q.risk_band}
                      </span>
                      {q.predicted_band !== q.risk_band && (
                        <span className="text-xs text-slate-400">
                          → predicted <strong>{q.predicted_band}</strong>
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {(q.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Behavior Tab ─────────────────────────────────────── */}
        <TabsContent value="behavior" className="space-y-6 mt-6">

          {/* Spending Category Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Category Spend Profile</h2>
                <p className="text-slate-500">Top 6 categories — relative spend intensity</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={behaviorRadar}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" stroke="#94a3b8"
                    style={{ fontSize: "11px" }} />
                  <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                  <Radar name="Spend %" dataKey="spend" stroke={COLORS.secondary}
                    fill={COLORS.secondary} fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Category spend bar — transaction count */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Transaction Frequency</h2>
                <p className="text-slate-500">Number of transactions per expense category</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={spending_by_category.slice(0, 8).map((c) => ({
                    category: c.category.length > 14 ? c.category.slice(0, 13) + "…" : c.category,
                    count: c.count,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false}
                    style={{ fontSize: "11px" }} />
                  <YAxis type="category" dataKey="category" stroke="#94a3b8" axisLine={false}
                    tickLine={false} width={115} style={{ fontSize: "11px" }} />
                  <Tooltip />
                  <Bar dataKey="count" name="# Transactions" fill={COLORS.purple} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* HMM State timeline from risk_timeline */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">HMM Behavioral State History</h2>
              <p className="text-slate-500">Hidden Markov Model state per quarter — tracks spending regime shifts</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {risk_timeline.map((q) => {
                const stateColors = {
                  0: COLORS.secondary, 1: COLORS.primary, 2: COLORS.warning,
                  3: COLORS.danger,    4: COLORS.purple,
                };
                const stateLabels = {
                  0: "Financially Stable",
                  1: "Moderate Spending",
                  2: "Elevated Spending",
                  3: "High Risk",
                  4: "Critical",
                };
                const state = q.hmm_state ?? "—";
                const color = stateColors[state] || "#94a3b8";
                return (
                  <div key={`${q.fiscal_year}-${q.quarter}`}
                    className="flex flex-col items-center bg-slate-50 border-2 border-slate-200
                               rounded-xl px-4 py-3 min-w-[90px] hover:shadow-md transition-shadow">
                    <span className="text-xs text-slate-400 mb-1">FY{q.fiscal_year} Q{q.quarter}</span>
                    <div className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-1"
                      style={{ backgroundColor: color }}>
                      {state}
                    </div>
                    <span className="text-[10px] text-center text-slate-500 leading-tight">
                      {stateLabels[state] || "Unknown"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Anomaly Tab ──────────────────────────────────────── */}
        <TabsContent value="anomaly" className="space-y-6 mt-6">

          {/* Anomaly Timeline from recent transactions */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Transaction Amount Timeline</h2>
              <p className="text-slate-500">
                Recent transactions — red bars exceed the average threshold
              </p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={recent_transactions.map((t) => ({
                  id:      t.transaction_id,
                  amount:  Math.round(t.amount),
                  anomaly: t.is_anomaly,
                  date:    t.date,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "10px" }} angle={-30} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "11px" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(v) => [`PKR ${v.toLocaleString()}`, "Amount"]}
                  labelFormatter={(l) => `Date: ${l}`}
                />
                <ReferenceLine y={avgAmount} stroke={COLORS.warning} strokeDasharray="6 3"
                  label={{ value: "Avg", position: "insideTopRight", fontSize: 11, fill: COLORS.warning }} />
                <Bar dataKey="amount" name="Transaction Amount" radius={[4, 4, 0, 0]}>
                  {recent_transactions.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.is_anomaly ? COLORS.danger : COLORS.secondary}
                      fillOpacity={entry.is_anomaly ? 0.9 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Severity Summary */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-red-700">{highCount}</p>
              <p className="text-sm text-red-600 mt-1">High Severity Categories</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-amber-700">{mediumCount}</p>
              <p className="text-sm text-amber-600 mt-1">Medium Severity Categories</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-emerald-700">{lowCount}</p>
              <p className="text-sm text-emerald-600 mt-1">Low Severity Categories</p>
            </div>
          </div>

          {/* Anomaly by Category Bar */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Anomalies by Category</h2>
              <p className="text-slate-500">Flagged transaction counts per expense category</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={anomalyBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "11px" }} />
                <YAxis type="category" dataKey="category" stroke="#94a3b8" axisLine={false}
                  tickLine={false} width={120} style={{ fontSize: "11px" }} />
                <Tooltip />
                <Bar dataKey="count" name="Anomaly Count" radius={[0, 6, 6, 0]}>
                  {anomalyBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.severity === "high"   ? COLORS.danger :
                        entry.severity === "medium" ? COLORS.warning :
                        COLORS.secondary
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Anomaly Transactions Table */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Flagged Transactions</h2>
              <p className="text-slate-500">
                Anomalous transactions from the latest batch ({" "}
                {recent_transactions.filter((t) => t.is_anomaly).length} flagged)
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-4">Transaction</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4 text-right">Amount (PKR)</th>
                    <th className="pb-4 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_transactions
                    .filter((t) => t.is_anomaly)
                    .map((t) => {
                      const catAnomaly = anomaly_by_category.find(
                        (a) => a.category === t.category
                      );
                      const sev = catAnomaly
                        ? classifySeverity(catAnomaly.count, maxAnomalyCount)
                        : "low";
                      return (
                        <tr key={t.transaction_id} className="anomaly-row border-b border-slate-100 last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <AlertTriangle
                                className={`size-4 flex-shrink-0 ${
                                  sev === "high"   ? "text-red-500" :
                                  sev === "medium" ? "text-amber-500" : "text-emerald-500"
                                }`}
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                                  {t.description || t.transaction_id}
                                </p>
                                <p className="text-xs text-slate-400">{t.transaction_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-slate-500 whitespace-nowrap">{t.date}</td>
                          <td className="py-4 text-sm text-slate-600">{t.category || "—"}</td>
                          <td className="py-4 text-sm font-semibold text-slate-900 text-right">
                            {t.amount.toLocaleString()}
                          </td>
                          <td className="py-4 text-right">
                            <span className={getSeverityClass(sev)}>
                              {sev.charAt(0).toUpperCase() + sev.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  {recent_transactions.filter((t) => t.is_anomaly).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                        No anomalies in the latest batch.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
