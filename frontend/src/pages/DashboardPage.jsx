import { useState, useEffect } from "react";
import MetricCard from "../components/MetricCard";
// ─── CHANGE 1: import shared auth fetch helper ────────────────────────────
import { apiFetch } from "../utils/api";
// ─────────────────────────────────────────────────────────────────────────
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Activity,
  Building2,
  Tag,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/dashboard.css";

const COLORS = {
  primary:   "#0d9488",
  secondary: "#10b981",
  accent:    "#059669",
  tertiary:  "#14b8a6",
  gold:      "#d97706",
  danger:    "#ef4444",
  info:      "#06b6d4",
  purple:    "#8b5cf6",
  warning:   "#f59e0b",
};

// Up to 12 distinct colours for dynamic pie slices
const PIE_PALETTE = [
  COLORS.primary, COLORS.gold, COLORS.info, COLORS.secondary,
  COLORS.purple,  COLORS.danger, COLORS.warning, COLORS.accent,
  "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry, i) => (
        <p
          key={i}
          className="text-sm flex items-center justify-between gap-4 mt-1"
          style={{ color: entry.color }}
        >
          <span>{entry.name}:</span>
          <span className="font-semibold">
            {typeof entry.value === "number"
              ? `PKR ${entry.value.toLocaleString()}`
              : entry.value}
          </span>
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
          <div className="legend-dot" style={{ backgroundColor: entry.color }} />
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

export default function DashboardPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

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

  const { overview, financial_ratios, risk_assessment,
          spending_by_category, spending_by_department,
          approval_breakdown, risk_timeline,
          recent_transactions } = data;

  // -- Derived chart data --

  // Risk timeline for area chart
  const timelineChartData = risk_timeline.map((q) => ({
    label:    `FY${q.fiscal_year} Q${q.quarter}`,
    expRatio: parseFloat((q.expense_to_revenue * 100).toFixed(1)),
    anomalyRate: parseFloat((q.anomaly_rate * 100).toFixed(1)),
    currentRatio: parseFloat(q.current_ratio.toFixed(2)),
  }));

  // Spending by category for pie
  const categoryPie = spending_by_category.slice(0, 8).map((item, i) => ({
    name:  item.category,
    value: Math.round(item.amount),
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }));

  // Department bar chart
  const deptBar = spending_by_department.slice(0, 8).map((item) => ({
    department: item.department.length > 14
      ? item.department.slice(0, 13) + "…"
      : item.department,
    amount: Math.round(item.amount),
  }));

  // Approval breakdown bar
  const approvalBar = approval_breakdown.map((a) => ({
    status: a.status,
    count:  a.count,
    amount: Math.round(a.amount),
  }));

  const fmtPKR = (n) =>
    n >= 1_000_000
      ? `PKR ${(n / 1_000_000).toFixed(1)}M`
      : `PKR ${(n / 1_000).toFixed(0)}K`;

  return (
    <div className="space-y-8 page-typography font-body">

      {/* Header */}
      <div className="dashboard-header rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2 text-slate-900">Financial Overview</h1>
            <p className="text-slate-600 text-lg">
              Real-time insights from live transaction data
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-white rounded-xl px-5 py-3 border-2 border-teal-200 shadow-sm">
            <div className="live-indicator size-2.5 rounded-full bg-teal-500" />
            <Activity className="size-5 text-teal-700" />
            <span className="font-semibold text-teal-800 text-sm">Live Data</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Expense"
          value={fmtPKR(overview.total_expense)}
          change={`${overview.total_transactions} txns`}
          changeType="neutral"
          icon={DollarSign}
          description="all transactions"
        />
        <MetricCard
          title="Avg Transaction"
          value={fmtPKR(overview.average_expense)}
          change="per transaction"
          changeType="neutral"
          icon={TrendingDown}
          description="overall average"
        />
        <MetricCard
          title="Anomalies Detected"
          value={overview.anomaly_count.toLocaleString()}
          change={`${overview.anomaly_rate}% rate`}
          changeType={overview.anomaly_rate > 5 ? "negative" : "positive"}
          icon={AlertTriangle}
          description="flagged transactions"
        />
        <MetricCard
          title="Current Risk Band"
          value={risk_assessment.risk_band}
          change={`${(risk_assessment.confidence * 100).toFixed(0)}% confidence`}
          changeType={
            risk_assessment.risk_band === "Low" ? "positive" :
            risk_assessment.risk_band === "High" || risk_assessment.risk_band === "Critical" ? "negative" :
            "neutral"
          }
          icon={CheckCircle}
          description={`Predicted: ${risk_assessment.predicted_band}`}
        />
      </div>

      {/* Financial Ratios Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Current Ratio",       value: financial_ratios.current_ratio.toFixed(2),        desc: "Liquidity measure (>1 is healthy)" },
          { label: "Debt-to-Asset",        value: (financial_ratios.debt_to_asset * 100).toFixed(1) + "%", desc: "Lower is better" },
          { label: "Expense-to-Revenue",  value: (financial_ratios.expense_to_revenue * 100).toFixed(1) + "%", desc: "Latest quarter" },
        ].map((r) => (
          <div key={r.label} className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <p className="text-slate-500 text-sm mb-1">{r.label}</p>
            <p className="text-3xl font-semibold text-slate-900">{r.value}</p>
            <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Risk Timeline Area Chart */}
        <div className="chart-card lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl mb-1 text-slate-900">Risk Timeline</h2>
            <p className="text-slate-500">Expense ratio, anomaly rate &amp; liquidity by quarter</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timelineChartData}>
              <defs>
                <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradAnom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.danger} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10}
                style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} dx={-10}
                style={{ fontSize: "12px" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
              <Area type="monotone" dataKey="expRatio"    stroke={COLORS.primary} fill="url(#gradExp)"  strokeWidth={3} name="Expense Ratio %" />
              <Area type="monotone" dataKey="anomalyRate" stroke={COLORS.danger}  fill="url(#gradAnom)" strokeWidth={2} name="Anomaly Rate %" />
              <Area type="monotone" dataKey="currentRatio" stroke={COLORS.gold}  fill="none" strokeWidth={2} strokeDasharray="5 3" name="Current Ratio" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category Pie */}
        <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl mb-1 text-slate-900">Spending Mix</h2>
            <p className="text-slate-500">Expense by category</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryPie}
                cx="50%" cy="50%"
                outerRadius={85}
                dataKey="value"
                stroke="white"
                strokeWidth={3}
                label={({ name, percent }) =>
                  percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {categoryPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`PKR ${v.toLocaleString()}`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-5 space-y-2 pt-4 border-t-2 border-slate-100 max-h-44 overflow-y-auto">
            {categoryPie.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="legend-dot flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 text-sm truncate max-w-[110px]">{item.name}</span>
                </div>
                <span className="text-slate-900 font-semibold text-sm whitespace-nowrap">
                  PKR {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Spending + Approval Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Department Bar */}
        <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Building2 className="size-5 text-teal-600" />
            <div>
              <h2 className="text-2xl mb-0.5 text-slate-900">Spending by Department</h2>
              <p className="text-slate-500 text-sm">Top departments by total expense (PKR)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptBar} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "11px" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="department" stroke="#94a3b8" axisLine={false}
                tickLine={false} width={110} style={{ fontSize: "11px" }} />
              <Tooltip formatter={(v) => [`PKR ${v.toLocaleString()}`, "Amount"]} />
              <Bar dataKey="amount" name="Amount (PKR)" radius={[0, 6, 6, 0]}>
                {deptBar.map((_, i) => (
                  <Cell
                    key={i}
                    fill={[
                      "#0d9488", "#8b5cf6", "#d97706", "#06b6d4",
                      "#10b981", "#ef4444", "#f59e0b", "#6366f1",
                    ][i % 8]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Approval Breakdown */}
        <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Tag className="size-5 text-teal-600" />
            <div>
              <h2 className="text-2xl mb-0.5 text-slate-900">Approval Breakdown</h2>
              <p className="text-slate-500 text-sm">Transaction counts by approval status</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={approvalBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="status" stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "12px" }} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "12px" }} />
              <Tooltip />
              <Legend content={renderLegend} />
              <Bar dataKey="count"  name="# Transactions" fill={COLORS.secondary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="amount" name="Total (PKR)" fill={COLORS.gold}      radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
