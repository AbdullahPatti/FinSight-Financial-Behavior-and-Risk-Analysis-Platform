import { useState } from "react";
import {
  AlertTriangle,
  Brain,
  Activity,
  Target,
  Cpu,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import {
  ScatterChart,
  Scatter,
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
import { motion } from "motion/react";
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

const clusteringData = [
  { x: 25, y: 45, z: 200, cluster: "High Spenders"    },
  { x: 30, y: 50, z: 250, cluster: "High Spenders"    },
  { x: 28, y: 48, z: 220, cluster: "High Spenders"    },
  { x: 32, y: 52, z: 260, cluster: "High Spenders"    },
  { x: 55, y: 30, z: 150, cluster: "Medium Spenders"  },
  { x: 60, y: 32, z: 160, cluster: "Medium Spenders"  },
  { x: 58, y: 28, z: 145, cluster: "Medium Spenders"  },
  { x: 62, y: 35, z: 170, cluster: "Medium Spenders"  },
  { x: 80, y: 15, z: 80,  cluster: "Low Spenders"     },
  { x: 85, y: 12, z: 75,  cluster: "Low Spenders"     },
  { x: 82, y: 18, z: 90,  cluster: "Low Spenders"     },
  { x: 88, y: 10, z: 65,  cluster: "Low Spenders"     },
  { x: 15, y: 85, z: 300, cluster: "Premium Users"    },
  { x: 18, y: 88, z: 320, cluster: "Premium Users"    },
  { x: 12, y: 82, z: 290, cluster: "Premium Users"    },
  { x: 20, y: 92, z: 340, cluster: "Premium Users"    },
];

const clusterColors = {
  "High Spenders":   COLORS.info,
  "Medium Spenders": COLORS.secondary,
  "Low Spenders":    COLORS.warning,
  "Premium Users":   COLORS.purple,
};

const clusterSummary = [
  { name: "Premium Users",   count: 180,  color: COLORS.purple,    ltv: "$12,500", pct: 5   },
  { name: "High Spenders",   count: 450,  color: COLORS.info,      ltv: "$8,200",  pct: 12  },
  { name: "Medium Spenders", count: 1240, color: COLORS.secondary, ltv: "$4,500",  pct: 34  },
  { name: "Low Spenders",    count: 2100, color: COLORS.warning,   ltv: "$1,800",  pct: 49  },
];

const predictiveSpending = [
  { month: "Mar", actual: 4500, predicted: 4600 },
  { month: "Apr", actual: 4800, predicted: 4900 },
  { month: "May", actual: 5200, predicted: 5100 },
  { month: "Jun", predicted: 5400 },
  { month: "Jul", predicted: 5800 },
  { month: "Aug", predicted: 6100 },
  { month: "Sep", predicted: 6500 },
];

const anomalyData = [
  { date: "Feb 15", amount: 450,  threshold: 500, anomaly: false },
  { date: "Feb 16", amount: 480,  threshold: 500, anomaly: false },
  { date: "Feb 17", amount: 520,  threshold: 500, anomaly: true  },
  { date: "Feb 18", amount: 1200, threshold: 500, anomaly: true  },
  { date: "Feb 19", amount: 460,  threshold: 500, anomaly: false },
  { date: "Feb 20", amount: 490,  threshold: 500, anomaly: false },
  { date: "Feb 21", amount: 470,  threshold: 500, anomaly: false },
  { date: "Feb 22", amount: 850,  threshold: 500, anomaly: true  },
  { date: "Feb 23", amount: 445,  threshold: 500, anomaly: false },
  { date: "Feb 24", amount: 430,  threshold: 500, anomaly: false },
];

const behaviorPatterns = [
  { behavior: "Impulsive",     value: 65 },
  { behavior: "Planned",       value: 85 },
  { behavior: "Seasonal",      value: 45 },
  { behavior: "Recurring",     value: 90 },
  { behavior: "Discretionary", value: 55 },
  { behavior: "Essential",     value: 95 },
];

const riskSegments = [
  { segment: "Low Risk",    count: 1250, percentage: 62, color: COLORS.secondary },
  { segment: "Medium Risk", count: 580,  percentage: 29, color: COLORS.warning   },
  { segment: "High Risk",   count: 180,  percentage: 9,  color: COLORS.danger    },
];

const modelMetrics = [
  { metric: "Accuracy",  value: 92.4, target: 90 },
  { metric: "Precision", value: 88.7, target: 85 },
  { metric: "Recall",    value: 90.1, target: 88 },
  { metric: "F1 Score",  value: 89.4, target: 87 },
];

const detectedAnomalies = [
  { id: "ANO-001", type: "Unusual spending spike",   date: "Feb 18, 2026", amount: "$1,200", severity: "high",   description: "250% above average daily spending" },
  { id: "ANO-002", type: "New merchant category",    date: "Feb 22, 2026", amount: "$850",   severity: "medium", description: "First transaction in luxury goods"  },
  { id: "ANO-003", type: "Multiple rapid transactions", date: "Feb 20, 2026", amount: "$450", severity: "low",  description: "15 transactions in 2 hours"         },
];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-xl p-3">
      <p className="font-semibold text-slate-900 mb-1 text-sm">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-sm mt-0.5" style={{ color: e.color || COLORS.primary }}>
          {e.name}: <span className="font-semibold">${e.value?.toLocaleString()}</span>
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

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState("clustering");

  const getSeverityClass = (severity) => {
    const map = { high: "severity-high", medium: "severity-medium", low: "severity-low" };
    return `severity-badge ${map[severity]}`;
  };

  return (
    <div className="space-y-8">

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
        <MetricCard title="Prediction Accuracy" value="92.4%"  change="+3.2%"       changeType="positive" icon={Target}        description="last 30 days"      />
        <MetricCard title="Active Clusters"      value="4"      change="stable"       changeType="neutral"  icon={Brain}         description="behavioral groups"  />
        <MetricCard title="Anomalies Detected"   value="12"     change="+4 this week" changeType="negative" icon={AlertTriangle}  description="requires review"   />
        <MetricCard title="User Engagement"      value="87.6%"  change="+5.1%"        changeType="positive" icon={Activity}       description="vs last month"     />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="analytics-tabs-list h-auto p-1.5 bg-white border-2 border-slate-200 rounded-xl">
          <TabsTrigger
            value="clustering"
            className="analytics-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-5 py-2.5 rounded-lg transition-all"
          >
            Behavioral Clustering
          </TabsTrigger>
          <TabsTrigger
            value="predictive"
            className="analytics-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-5 py-2.5 rounded-lg transition-all"
          >
            Predictive Analysis
          </TabsTrigger>
          <TabsTrigger
            value="anomaly"
            className="analytics-tab-trigger data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-5 py-2.5 rounded-lg transition-all"
          >
            Anomaly Detection
          </TabsTrigger>
        </TabsList>

        {/* ── Clustering Tab ─────────────────────────────────── */}
        <TabsContent value="clustering" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Scatter Chart */}
            <div className="cluster-card lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Customer Behavior Clusters</h2>
                <p className="text-slate-500">
                  ML-based segmentation of customer spending patterns (K-Means)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={380}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="x" name="Frequency" stroke="#94a3b8" axisLine={false} tickLine={false}
                    label={{ value: "Transaction Frequency", position: "insideBottom", offset: -12, fill: "#94a3b8", fontSize: 12 }}
                    style={{ fontSize: "12px", fontFamily: "Crimson Pro, serif" }} />
                  <YAxis type="number" dataKey="y" name="Recency"   stroke="#94a3b8" axisLine={false} tickLine={false}
                    label={{ value: "Days Since Purchase", angle: -90, position: "insideLeft", offset: 16, fill: "#94a3b8", fontSize: 12 }}
                    style={{ fontSize: "12px", fontFamily: "Crimson Pro, serif" }} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border-2 border-slate-200 rounded-xl shadow-xl p-3">
                        <p className="font-semibold text-slate-900 text-sm">{d.cluster}</p>
                        <p className="text-xs text-slate-500 mt-1">Frequency: {d.x} · Recency: {d.y}</p>
                      </div>
                    );
                  }} />
                  <Legend content={renderLegend} />
                  {Object.entries(clusterColors).map(([cluster, color]) => (
                    <Scatter
                      key={cluster}
                      name={cluster}
                      data={clusteringData.filter((d) => d.cluster === cluster)}
                      fill={color}
                      fillOpacity={0.8}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Cluster Summary */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <h2 className="text-2xl mb-6 text-slate-900">Cluster Summary</h2>
              <div className="space-y-4">
                {clusterSummary.map((cluster) => (
                  <div key={cluster.name} className="cluster-item">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                        <span className="text-sm font-medium text-slate-800">{cluster.name}</span>
                      </div>
                      <span className="text-sm text-slate-500">{cluster.count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">Avg. LTV</p>
                      <p className="cluster-ltv" style={{ color: cluster.color }}>{cluster.ltv}</p>
                    </div>
                    <div className="mt-2 risk-bar-track">
                      <div
                        className="risk-bar-fill"
                        style={{ width: `${cluster.pct}%`, backgroundColor: cluster.color }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-right">{cluster.pct}% of base</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Behavior Radar */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Spending Behavior Patterns</h2>
              <p className="text-slate-500">
                Multi-dimensional behavioral scoring across key financial behavior axes
              </p>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={behaviorPatterns}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="behavior" stroke="#64748b"
                  style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8"
                  style={{ fontSize: "11px" }} />
                <Radar
                  name="Behavior Score"
                  dataKey="value"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.25}
                  strokeWidth={2.5}
                />
                <Tooltip
                  formatter={(val) => [`${val}%`, "Score"]}
                  contentStyle={{ borderRadius: "0.75rem", border: "2px solid #e2e8f0" }}
                />
                <Legend content={renderLegend} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* ── Predictive Tab ─────────────────────────────────── */}
        <TabsContent value="predictive" className="space-y-6 mt-6">

          {/* Prediction Chart */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Future Spending Predictions</h2>
              <p className="text-slate-500">
                AI-powered forecasting based on historical patterns — dashed line shows predictions
              </p>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={predictiveSpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
                <ReferenceLine x="Jun" stroke="#94a3b8" strokeDasharray="4 4"
                  label={{ value: "Forecast →", position: "top", fill: "#94a3b8", fontSize: 12 }} />
                <Line type="monotone" dataKey="actual"    stroke={COLORS.primary}   strokeWidth={3}
                  dot={{ fill: COLORS.primary, r: 5, stroke: "white", strokeWidth: 2 }} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke={COLORS.secondary} strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ fill: COLORS.secondary, r: 4, stroke: "white", strokeWidth: 2 }} name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Risk + Model */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Risk Assessment */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Risk Assessment</h2>
                <p className="text-slate-500">Customer distribution by financial risk profile</p>
              </div>
              <div className="space-y-5">
                {riskSegments.map((seg) => (
                  <div key={seg.segment}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="text-sm font-medium text-slate-800">{seg.segment}</span>
                      </div>
                      <span className="text-sm text-slate-500">{seg.count.toLocaleString()} users</span>
                    </div>
                    <div className="risk-bar-track">
                      <motion.div
                        className="risk-bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${seg.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        style={{ backgroundColor: seg.color }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{seg.percentage}% of total users</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Performance */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
              <div className="mb-6">
                <h2 className="text-2xl mb-1 text-slate-900">Model Performance</h2>
                <p className="text-slate-500">ML model evaluation metrics vs targets</p>
              </div>
              <div className="space-y-5">
                {modelMetrics.map((item) => (
                  <div key={item.metric}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-800">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Target: {item.target}%</span>
                        <span className="text-sm font-semibold text-teal-700">{item.value}%</span>
                      </div>
                    </div>
                    <div className="perf-bar-track">
                      <motion.div
                        className="perf-bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Anomaly Tab ────────────────────────────────────── */}
        <TabsContent value="anomaly" className="space-y-6 mt-6">

          {/* Anomaly Chart */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Anomaly Detection Timeline</h2>
              <p className="text-slate-500">
                Real-time monitoring — red bars indicate transactions exceeding normal thresholds
              </p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "12px", fontFamily: "Crimson Pro, serif" }} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                  style={{ fontSize: "12px", fontFamily: "Crimson Pro, serif" }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend content={renderLegend} />
                <Bar dataKey="threshold" fill="#e2e8f0" name="Normal Threshold" radius={[4, 4, 0, 0]} />
                <Bar dataKey="amount" name="Daily Spend" radius={[4, 4, 0, 0]}>
                  {anomalyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.anomaly ? COLORS.danger : COLORS.secondary}
                      fillOpacity={entry.anomaly ? 0.9 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Anomaly summary cards */}
          <div className="grid grid-cols-3 gap-5">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-red-700">3</p>
              <p className="text-sm text-red-600 mt-1">High Severity</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-amber-700">5</p>
              <p className="text-sm text-amber-600 mt-1">Medium Severity</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
              <p className="text-3xl font-semibold text-emerald-700">4</p>
              <p className="text-sm text-emerald-600 mt-1">Low Severity</p>
            </div>
          </div>

          {/* Anomaly Table */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl mb-1 text-slate-900">Recent Anomalies</h2>
              <p className="text-slate-500">Flagged transactions requiring investigation</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Severity</th>
                    <th className="pb-4">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {detectedAnomalies.map((anomaly) => (
                    <tr key={anomaly.id} className="anomaly-row">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className={`size-4 ${
                              anomaly.severity === "high"
                                ? "text-red-500"
                                : anomaly.severity === "medium"
                                ? "text-amber-500"
                                : "text-emerald-500"
                            }`}
                          />
                          <span className="text-sm font-medium text-slate-800">
                            {anomaly.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-slate-500 whitespace-nowrap">
                        {anomaly.date}
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-900">
                        {anomaly.amount}
                      </td>
                      <td className="py-4">
                        <span className={getSeverityClass(anomaly.severity)}>
                          {anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-slate-500">
                        {anomaly.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
