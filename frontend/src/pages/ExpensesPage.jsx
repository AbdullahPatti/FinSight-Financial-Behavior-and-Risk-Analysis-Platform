import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Plus,
  TrendingDown,
  DollarSign,
  Calendar,
  Tag,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import "../styles/expenses.css";

const BASE_URL = "http://localhost:8000";

const COLORS = {
  primary:   "#0d9488",
  secondary: "#10b981",
  accent:    "#059669",
  gold:      "#d97706",
  danger:    "#ef4444",
  info:      "#06b6d4",
};

const uploadedFiles = [
  { id: 1, name: "expenses_january.csv",  status: "processed",  date: "Feb 15, 2026", rows: 234 },
  { id: 2, name: "expenses_february.csv", status: "processed",  date: "Feb 28, 2026", rows: 198 },
  { id: 3, name: "transactions_q1.csv",   status: "processing", date: "Feb 28, 2026", rows: 456 },
];

const transactions = [
  { id: "EXP-001", date: "2026-02-28", description: "Office Supplies",     category: "Office",    amount: 245.50,  status: "completed" },
  { id: "EXP-002", date: "2026-02-27", description: "Software Subscription", category: "Software", amount: 99.00,   status: "completed" },
  { id: "EXP-003", date: "2026-02-27", description: "Client Dinner",        category: "Meals",     amount: 156.80,  status: "completed" },
  { id: "EXP-004", date: "2026-02-26", description: "Marketing Campaign",   category: "Marketing", amount: 1250.00, status: "completed" },
  { id: "EXP-005", date: "2026-02-26", description: "Travel Expenses",      category: "Travel",    amount: 450.00,  status: "pending"   },
  { id: "EXP-006", date: "2026-02-25", description: "Office Rent",          category: "Rent",      amount: 2500.00, status: "completed" },
  { id: "EXP-007", date: "2026-02-24", description: "Utilities",            category: "Utilities", amount: 180.30,  status: "completed" },
  { id: "EXP-008", date: "2026-02-23", description: "Freelancer Payment",   category: "Services",  amount: 800.00,  status: "completed" },
];

const monthlyExpenses = [
  { month: "Sep", amount: 4200 },
  { month: "Oct", amount: 5100 },
  { month: "Nov", amount: 4800 },
  { month: "Dec", amount: 6200 },
  { month: "Jan", amount: 5500 },
  { month: "Feb", amount: 4900 },
];

const weeklyExpenses = [
  { week: "Week 1", amount: 1200 },
  { week: "Week 2", amount: 980  },
  { week: "Week 3", amount: 1450 },
  { week: "Week 4", amount: 1270 },
];

const categoryData = [
  { category: "Rent & Utilities", amount: 2800, color: COLORS.primary   },
  { category: "Marketing",        amount: 1450, color: COLORS.gold       },
  { category: "Office & Supplies", amount: 1200, color: COLORS.secondary },
  { category: "Services",         amount: 900,  color: COLORS.info       },
  { category: "Software & Tools", amount: 890,  color: COLORS.accent     },
  { category: "Travel",           amount: 650,  color: COLORS.danger     },
];

const SUMMARY_STATS = [
  { label: "Total Expenses",   value: "$7,681",  icon: DollarSign,   color: "text-teal-700",  bg: "from-teal-50 to-emerald-50" },
  { label: "This Month",       value: "$4,900",  icon: Calendar,     color: "text-emerald-700", bg: "from-emerald-50 to-green-50" },
  { label: "Largest Category", value: "$2,800",  icon: Tag,          color: "text-amber-700",  bg: "from-amber-50 to-yellow-50"  },
  { label: "Trend",            value: "−7.3%",   icon: TrendingDown, color: "text-green-700",  bg: "from-green-50 to-lime-50"   },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-slate-200 rounded-xl shadow-xl p-3 font-serif">
      <p className="font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="text-sm" style={{ color: e.color }}>
          {e.name}: <span className="font-semibold">${e.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function FileStatusBadge({ status }) {
  if (status === "processed") {
    return (
      <span className="file-status file-status-processed">
        <CheckCircle2 className="size-3.5" />
        Processed
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="file-status file-status-processing">
        <Loader2 className="size-3.5 processing-spinner" />
        Processing…
      </span>
    );
  }
  return (
    <span className="file-status" style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}>
      <XCircle className="size-3.5" />
      Failed
    </span>
  );
}

function TxnStatusBadge({ status }) {
  if (status === "completed") return (
    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Completed</span>
  );
  return (
    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Pending</span>
  );
}

export default function ExpensesPage() {
  const [dragOver, setDragOver]           = useState(false);
  const [selectedCategory, setCategory]   = useState("all");
  const [files, setFiles]                 = useState(uploadedFiles);
  const fileInputRef                      = useRef(null);

  const uploadCsvFile = async (file) => {
    let rowCount = 0;
    try {
      const text = await file.text();
      rowCount = Math.max(
        text.split(/\r?\n/).filter((line) => line.trim()).length - 1,
        0
      );
    } catch {
      rowCount = 0;
    }

    const fileId = Date.now() + Math.random();
    const newFile = {
      id: fileId,
      name: file.name,
      status: "processing",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      rows: rowCount,
    };

    setFiles((prev) => [newFile, ...prev]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}/upload/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      const uploadSucceeded = res.ok && data?.status === "success";

      setFiles((prev) =>
        prev.map((item) =>
          item.id === fileId
            ? { ...item, status: uploadSucceeded ? "processed" : "failed" }
            : item
        )
      );
    } catch {
      setFiles((prev) =>
        prev.map((item) =>
          item.id === fileId ? { ...item, status: "failed" } : item
        )
      );
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith(".csv")
    );
    if (dropped.length) {
      dropped.forEach((file) => {
        uploadCsvFile(file);
      });
    }
  };

  const filteredTxns =
    selectedCategory === "all"
      ? transactions
      : transactions.filter(
          (t) => t.category.toLowerCase() === selectedCategory
        );

  return (
    <div className="space-y-8 page-typography font-body">

      {/* Header */}
      <div className="expenses-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2 text-slate-900">Expenses</h1>
            <p className="text-slate-600 text-lg">
              Manage, upload, and analyze your business expenses
            </p>
          </div>
          <button className="add-expense-btn px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg">
            <Plus className="size-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {SUMMARY_STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="expense-stat">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${bg} mb-3`}>
              <Icon className={`size-6 ${color}`} strokeWidth={2} />
            </div>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* CSV Upload */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl mb-1 text-slate-900">Upload CSV Files</h2>
          <p className="text-slate-500">Import transaction data directly from your spreadsheets</p>
        </div>

        {/* Drop zone */}
        <div
          className={`drop-zone ${dragOver ? "drag-over" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const selectedFiles = Array.from(e.target.files || []).filter((f) =>
                f.name.toLowerCase().endsWith(".csv")
              );
              selectedFiles.forEach((file) => {
                uploadCsvFile(file);
              });
              e.target.value = "";
            }}
          />
          <div
            className={`upload-icon-animate inline-flex p-5 rounded-2xl mb-5 ${
              dragOver
                ? "bg-teal-100 text-teal-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            <Upload className="size-10" />
          </div>
          <h3 className="text-xl text-slate-800 mb-2">
            {dragOver ? "Drop your CSV file here!" : "Drag & drop your CSV files"}
          </h3>
          <p className="text-slate-500 text-sm mb-5">
            or click to browse your files
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors text-sm font-medium cursor-pointer">
            <Upload className="size-4" />
            Browse Files
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Supported: CSV (max 10MB) · Transactions, expenses, invoices
          </p>
        </div>

        {/* Uploaded files */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-slate-900">Uploaded Files</h3>
            <span className="text-sm text-slate-400">{files.length} files</span>
          </div>
          <AnimatePresence>
            <div className="space-y-3">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="file-item"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="file-icon-wrap">
                      <FileText className="size-5 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {file.rows > 0 ? `${file.rows} rows · ` : ""}
                        Uploaded {file.date}
                      </p>
                    </div>
                  </div>
                  <FileStatusBadge status={file.status} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly trend */}
        <div className="expenses-chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl mb-1 text-slate-900">Monthly Expenses</h2>
            <p className="text-slate-500">6-month spending trend</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 5, strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 7 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly breakdown */}
        <div className="expenses-chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl mb-1 text-slate-900">Weekly Breakdown</h2>
            <p className="text-slate-500">February spending by week</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false}
                style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]} name="Amount">
                {weeklyExpenses.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === 2 ? COLORS.gold : COLORS.secondary}
                    fillOpacity={i === 2 ? 1 : 0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="expenses-chart-card bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl mb-1 text-slate-900">Expenses by Category</h2>
          <p className="text-slate-500">Spending distribution across all business categories</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" axisLine={false} tickLine={false}
              style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
            <YAxis dataKey="category" type="category" stroke="#94a3b8" width={140} axisLine={false} tickLine={false}
              style={{ fontSize: "13px", fontFamily: "Crimson Pro, serif" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[0, 8, 8, 0]} name="Amount">
              {categoryData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl mb-1 text-slate-900">Recent Transactions</h2>
            <p className="text-slate-500">
              {filteredTxns.length} transactions{" "}
              {selectedCategory !== "all" ? `in ${selectedCategory}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setCategory(e.target.value)}
                className="w-44 h-10 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-teal-300"
              >
                <option value="all">All Categories</option>
                <option value="office">Office</option>
                <option value="software">Software</option>
                <option value="marketing">Marketing</option>
                <option value="travel">Travel</option>
                <option value="rent">Rent</option>
              </select>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 transition-all text-sm font-medium">
              <Download className="size-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <th className="pb-4">Date</th>
                <th className="pb-4">Description</th>
                <th className="pb-4">Category</th>
                <th className="pb-4 text-right">Amount</th>
                <th className="pb-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.map((t) => (
                <tr key={t.id} className="txn-row">
                  <td className="py-4 text-slate-500 text-sm whitespace-nowrap">{t.date}</td>
                  <td className="py-4">
                    <p className="font-medium text-slate-900 text-sm">{t.description}</p>
                    <p className="text-xs text-slate-400">{t.id}</p>
                  </td>
                  <td className="py-4">
                    <span className="category-pill">{t.category}</span>
                  </td>
                  <td className="py-4 text-right">
                    <span className="txn-amount-negative text-sm">
                      −${t.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <TxnStatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
