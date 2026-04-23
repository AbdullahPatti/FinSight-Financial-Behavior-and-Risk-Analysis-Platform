import MetricCard from "../components/MetricCard";
import {
  DollarSign,
  Users,
  UserCheck,
  TrendingDown,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import {
  Line,
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
const colors = {
  primary:   "#0d9488",
  secondary: "#10b981",
  accent:    "#059669",
  tertiary:  "#14b8a6",
  gold:      "#d97706",
  danger:    "#ef4444",
  info:      "#06b6d4",
};

const revenueData = [
  { month: "Jan", revenue: 45000, renewals: 38000, churn: 5000 },
  { month: "Feb", revenue: 52000, renewals: 42000, churn: 4500 },
  { month: "Mar", revenue: 48000, renewals: 40000, churn: 6000 },
  { month: "Apr", revenue: 61000, renewals: 48000, churn: 4000 },
  { month: "May", revenue: 55000, renewals: 45000, churn: 5500 },
  { month: "Jun", revenue: 67000, renewals: 52000, churn: 3800 },
];

const salesBreakdown = [
  { name: "Basic",      value: 2400, color: colors.info      },
  { name: "Pro",        value: 4567, color: colors.primary    },
  { name: "Advanced",   value: 3098, color: colors.accent     },
  { name: "Enterprise", value: 5234, color: colors.gold       },
];

const recentTransactions = [
  { id: "TXN-001", customer: "Acme Corp",        plan: "Enterprise", amount: "$2,499", date: "Feb 28, 2026", status: "completed" },
  { id: "TXN-002", customer: "TechStart Inc",     plan: "Pro",        amount: "$499",   date: "Feb 27, 2026", status: "completed" },
  { id: "TXN-003", customer: "Digital Solutions", plan: "Advanced",   amount: "$999",   date: "Feb 27, 2026", status: "pending"   },
  { id: "TXN-004", customer: "Global Systems",    plan: "Enterprise", amount: "$2,499", date: "Feb 26, 2026", status: "completed" },
  { id: "TXN-005", customer: "StartupXYZ",        plan: "Basic",      amount: "$99",    date: "Feb 26, 2026", status: "failed"    },
];

const supportTickets = [
  { id: "TICK-101", subject: "Payment integration issue",     customer: "Acme Corp",        priority: "high",   status: "open"        },
  { id: "TICK-102", subject: "Account upgrade request",       customer: "TechStart Inc",    priority: "medium", status: "in-progress" },
  { id: "TICK-103", subject: "Feature request — API access",  customer: "Digital Solutions", priority: "low",   status: "resolved"    },
  { id: "TICK-104", subject: "Billing question",              customer: "Global Systems",   priority: "medium", status: "open"        },
];

const customerDemographics = [
  { region: "North America", active: 1250, inactive: 230 },
  { region: "Europe",        active: 890,  inactive: 180 },
  { region: "Asia Pacific",  active: 670,  inactive: 120 },
  { region: "Latin America", active: 340,  inactive: 80  },
  { region: "Middle East",   active: 210,  inactive: 45  },
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
          <span className="font-semibold">${entry.value?.toLocaleString()}</span>
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

function StatusBadge({ status }) {
  const map = {
    completed:   "status-badge status-badge-completed",
    pending:     "status-badge status-badge-pending",
    failed:      "status-badge status-badge-failed",
    open:        "status-badge status-badge-open",
    "in-progress": "status-badge status-badge-progress",
    resolved:    "status-badge status-badge-resolved",
  };
  const labels = {
    completed: "Completed", pending: "Pending", failed: "Failed",
    open: "Open", "in-progress": "In Progress", resolved: "Resolved",
  };
  return (
    <span className={map[status] || map.completed}>{labels[status]}</span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    high:   "status-badge status-badge-open",
    medium: "status-badge status-badge-pending",
    low:    "status-badge status-badge-resolved",
  };
  return (
    <span className={map[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8 page-typography font-body">

      {/* Header */}
      <div className="dashboard-header rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2 text-slate-900">Financial Overview</h1>
            <p className="text-slate-600 text-lg">
              Real-time insights and performance metrics
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
        <MetricCard title="Monthly Recurring Revenue" value="$67,000" change="+12.5%"  changeType="positive" icon={DollarSign}  description="vs last month"  />
        <MetricCard title="Total Customers"            value="3,247"   change="+8.2%"   changeType="positive" icon={Users}       description="vs last month"  />
        <MetricCard title="Active Rate"                value="94.3%"   change="+2.1%"   changeType="positive" icon={UserCheck}   description="engagement rate" />
        <MetricCard title="Churn Rate"                 value="3.8%"    change="-0.5%"   changeType="positive" icon={TrendingDown} description="vs last month" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        <div className="chart-card lg:col-span-2 bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl mb-1 text-slate-900">Revenue Analytics</h2>
            <p className="text-slate-500">Monthly revenue trends, renewals, and churn</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={colors.primary}   stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.primary}   stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradRenewals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={colors.secondary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.secondary} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10}
                style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} dx={-10}
                style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
              <Area type="monotone" dataKey="revenue"  stroke={colors.primary}   fill="url(#gradRevenue)"   strokeWidth={3} name="Revenue"   />
              <Area type="monotone" dataKey="renewals" stroke={colors.secondary} fill="url(#gradRenewals)"  strokeWidth={3} name="Renewals"  />
              <Line type="monotone" dataKey="churn"    stroke={colors.danger}    strokeWidth={2.5} name="Churn"
                dot={{ r: 4, fill: colors.danger }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Pie Chart */}
        <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl mb-1 text-slate-900">Sales Mix</h2>
            <p className="text-slate-500">Revenue by plan tier</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={salesBreakdown}
                cx="50%" cy="50%"
                outerRadius={85}
                dataKey="value"
                stroke="white"
                strokeWidth={3}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {salesBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-5 space-y-2.5 pt-5 border-t-2 border-slate-100">
            {salesBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="legend-dot" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 text-sm">{item.name}</span>
                </div>
                <span className="text-slate-900 font-semibold text-sm">
                  ${item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Transactions */}
        <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl mb-1 text-slate-900">Recent Transactions</h2>
              <p className="text-slate-500">Latest customer payments</p>
            </div>
            <button className="view-all-btn">
              View All <ArrowUpRight className="size-4" />
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-4">Customer</th>
                <th className="pb-4">Plan</th>
                <th className="pb-4 text-right">Amount</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <tr
                  key={t.id}
                  className={`data-table-row ${i < recentTransactions.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <td className="py-4">
                    <p className="font-semibold text-slate-900 text-sm">{t.customer}</p>
                    <p className="text-xs text-slate-400">{t.id}</p>
                  </td>
                  <td className="py-4 text-slate-600 text-sm">{t.plan}</td>
                  <td className="py-4 text-right font-semibold text-slate-900 text-sm">{t.amount}</td>
                  <td className="py-4 text-right"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Support Tickets */}
        <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl mb-1 text-slate-900">Support Tickets</h2>
              <p className="text-slate-500">Recent customer inquiries</p>
            </div>
            <button className="view-all-btn">
              View All <ArrowUpRight className="size-4" />
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-4">Subject</th>
                <th className="pb-4 text-right">Priority</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {supportTickets.map((t, i) => (
                <tr
                  key={t.id}
                  className={`data-table-row ${i < supportTickets.length - 1 ? "border-b border-slate-100" : ""}`}
                >
                  <td className="py-4">
                    <p className="font-semibold text-slate-900 text-sm">{t.subject}</p>
                    <p className="text-xs text-slate-400">{t.customer}</p>
                  </td>
                  <td className="py-4 text-right"><PriorityBadge priority={t.priority} /></td>
                  <td className="py-4 text-right"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Demographics */}
      <div className="chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
        <div className="mb-8">
          <h2 className="text-2xl mb-1 text-slate-900">Customer Demographics</h2>
          <p className="text-slate-500">Active vs inactive users by geographic region</p>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={customerDemographics}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="region" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10}
              style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
            <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} dx={-10}
              style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
            <Bar dataKey="active"   fill={colors.secondary} name="Active Users"   radius={[8, 8, 0, 0]} />
            <Bar dataKey="inactive" fill={colors.danger}    name="Inactive Users" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
