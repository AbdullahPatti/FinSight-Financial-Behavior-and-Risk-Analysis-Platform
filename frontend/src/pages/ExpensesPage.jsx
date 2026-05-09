import { useState, useRef, useEffect } from "react";
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
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "../styles/expenses.css";
import { apiFetch } from "../utils/api";

const uploadedFiles = [
  { id: 1, name: "expenses_january.csv",  status: "processed",  date: "Feb 15, 2026", rows: 234 },
  { id: 2, name: "expenses_february.csv", status: "processed",  date: "Feb 28, 2026", rows: 198 },
  { id: 3, name: "transactions_q1.csv",   status: "processing", date: "Feb 28, 2026", rows: 456 },
];

function FileStatusBadge({ status }) {
  if (status === "processed")
    return (
      <span className="file-status file-status-processed">
        <CheckCircle2 className="size-3.5" /> Processed
      </span>
    );
  if (status === "processing")
    return (
      <span className="file-status file-status-processing">
        <Loader2 className="size-3.5 processing-spinner" /> Processing…
      </span>
    );
  return (
    <span className="file-status" style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fca5a5" }}>
      <XCircle className="size-3.5" /> Failed
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Approved: "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200",
    approved: "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200",
    Pending:  "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200",
    pending:  "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200",
    Rejected: "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200",
    rejected: "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-800 border border-red-200",
  };
  return <span className={map[status] || map.pending}>{status}</span>;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="size-8 border-4 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );
}

export default function ExpensesPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles]       = useState(uploadedFiles);
  const fileInputRef            = useRef(null);

  // Transaction state
  const [transactions, setTransactions] = useState([]);
  const [txnLoading, setTxnLoading]     = useState(true);
  const [txnError, setTxnError]         = useState(null);

  // Filters
  const [anomalyFilter, setAnomalyFilter] = useState("all");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [search, setSearch]               = useState("");

  // Add Expense Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    expense_category: "",        // collected from form now
    vendor_name: "",
    transaction_description: "",
    amount_pkr: "",
    payment_method: "Cash",
    approval_status: "Pending",
    fiscal_year: new Date().getFullYear(),
    quarter: Math.floor((new Date().getMonth() + 3) / 3)
  });
  const [analysisResult, setAnalysisResult] = useState(null);

  // Dashboard overview for summary cards
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    apiFetch("/dashboard/")
      .then(async (r) => {
        const text = await r.text();
        return JSON.parse(text);
      })
      .then((d) => setOverview(d.overview))
      .catch(() => {});

    apiFetch("/transactions/?limit=50")
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        try { return JSON.parse(text); }
        catch { throw new Error("Non-JSON response: " + text.slice(0, 200)); }
      })
      .then((d) => {
        const clean = (d.transactions || []).map((t) => {
          const { _sa_instance_state, ...rest } = t;
          return rest;
        });
        setTransactions(clean);
        setTxnLoading(false);
      })
      .catch((e) => { setTxnError(e.message); setTxnLoading(false); });
  }, []);

  // ── Upload handlers ────────────────────────────────────────────

  const uploadCsvFile = async (file) => {
    let rowCount = 0;
    try {
      const text = await file.text();
      rowCount = Math.max(text.split(/\r?\n/).filter((l) => l.trim()).length - 1, 0);
    } catch { rowCount = 0; }

    const fileId = Date.now() + Math.random();
    setFiles((prev) => [{
      id: fileId, name: file.name, status: "processing",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      rows: rowCount,
    }, ...prev]);

    try {
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);
      const res  = await apiFetch("/upload/", { method: "POST", body: uploadPayload });
      const data = await res.json().catch(() => ({}));
      const ok   = res.ok && data?.status === "success";
      setFiles((prev) =>
        prev.map((item) => item.id === fileId ? { ...item, status: ok ? "processed" : "failed" } : item)
      );
      if (ok) {
        apiFetch("/transactions/?limit=50")
          .then((r) => r.json())
          .then((d) => {
            const clean = (d.transactions || []).map(({ _sa_instance_state, ...rest }) => rest);
            setTransactions(clean);
          })
          .catch(() => {});
      }
    } catch {
      setFiles((prev) =>
        prev.map((item) => item.id === fileId ? { ...item, status: "failed" } : item)
      );
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragOver(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragOver(false);
    Array.from(e.dataTransfer.files)
      .filter((f) => f.name.toLowerCase().endsWith(".csv"))
      .forEach(uploadCsvFile);
  };

  // ── Filtering ──────────────────────────────────────────────────

  const filtered = transactions.filter((t) => {
    if (anomalyFilter === "yes" && !t.is_anomaly) return false;
    if (anomalyFilter === "no"  &&  t.is_anomaly) return false;
    if (statusFilter !== "all"  && (t.approval_status || "").toLowerCase() !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hit = (t.transaction_description || "").toLowerCase().includes(q)
        || (t.expense_category || "").toLowerCase().includes(q)
        || (t.department || "").toLowerCase().includes(q)
        || (t.transaction_id || "").toLowerCase().includes(q);
      if (!hit) return false;
    }
    return true;
  });

  const exportCSV = async () => {
    try {
      const res = await apiFetch("/transactions/export-anomalies");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `anomalies_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // CHANGE 3: block vague descriptions before hitting the API
    if (formData.transaction_description.trim().split(/\s+/).filter(Boolean).length < 3) {
      alert("Please enter a more descriptive transaction description (at least 3 words).");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const payload = {
        ...formData,
        amount_pkr: parseFloat(formData.amount_pkr),
        fiscal_year: parseInt(formData.fiscal_year),
        quarter: parseInt(formData.quarter)
      };

      const res = await apiFetch("/upload/single", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && !result.error) {
        setAnalysisResult(result);
        const newTxn = {
          transaction_id: `TMP-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          ...payload,
          expense_category: result.predicted_category || payload.expense_category,
          is_anomaly: result.is_anomaly,
          hmm_state: result.hmm_state,
          review_tier: result.review_tier || "Normal" 
        };
        setTransactions(prev => [newTxn, ...prev]);
      } else {
        alert("Analysis failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Summary cards ─────────────────────────────────────────────

  const anomalyCount = transactions.filter((t) => t.is_anomaly).length;
  const totalPKR     = transactions.reduce((s, t) => s + (t.amount_pkr || 0), 0);
  const avgPKR       = transactions.length ? totalPKR / transactions.length : 0;

  const SUMMARY_STATS = [
    {
      label: "Total Expenses",
      value: overview
        ? `PKR ${(overview.total_expense / 1_000_000).toFixed(1)}M`
        : `PKR ${(totalPKR / 1_000_000).toFixed(1)}M`,
      icon: DollarSign, color: "text-teal-700", bg: "from-teal-50 to-emerald-50",
    },
    {
      label: "Transactions Loaded",
      value: (overview?.total_transactions ?? transactions.length).toLocaleString(),
      icon: Calendar, color: "text-emerald-700", bg: "from-emerald-50 to-green-50",
    },
    {
      label: "Avg Transaction",
      value: `PKR ${Math.round(overview?.average_expense ?? avgPKR).toLocaleString()}`,
      icon: Tag, color: "text-amber-700", bg: "from-amber-50 to-yellow-50",
    },
    {
      label: "Anomaly Rate",
      value: overview ? `${overview.anomaly_rate}%` : `${((anomalyCount / (transactions.length || 1)) * 100).toFixed(1)}%`,
      icon: TrendingDown, color: "text-red-700", bg: "from-red-50 to-rose-50",
    },
  ];

  return (
    <div className="space-y-8 page-typography font-body">

      {/* Header */}
      <div className="expenses-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2 text-slate-900">Expenses</h1>
            <p className="text-slate-600 text-lg">
              Manage, upload, and analyze your business transactions
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-expense-btn px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg"
          >
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
              Array.from(e.target.files || [])
                .filter((f) => f.name.toLowerCase().endsWith(".csv"))
                .forEach(uploadCsvFile);
              e.target.value = "";
            }}
          />
          <div className={`upload-icon-animate inline-flex p-5 rounded-2xl mb-5 ${
            dragOver ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-400"
          }`}>
            <Upload className="size-10" />
          </div>
          <h3 className="text-xl text-slate-800 mb-2">
            {dragOver ? "Drop your CSV file here!" : "Drag & drop your CSV files"}
          </h3>
          <p className="text-slate-500 text-sm mb-5">or click to browse your files</p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors text-sm font-medium cursor-pointer">
            <Upload className="size-4" />
            Browse Files
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Supported: CSV (max 10MB) · Transactions, expenses, invoices
          </p>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-teal-50 to-white">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Add New Expense</h2>
                  <p className="text-slate-500 text-sm">Enter transaction details for AI analysis</p>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); setAnalysisResult(null); }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <XCircle className="size-6 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Department</label>
                    <input
                      required
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g. Marketing"
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-300 outline-none transition-all"
                    />
                  </div>

                  {/* Vendor Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Vendor Name</label>
                    <input
                      required
                      type="text"
                      value={formData.vendor_name}
                      onChange={(e) => setFormData({...formData, vendor_name: e.target.value})}
                      placeholder="e.g. AWS"
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-300 outline-none transition-all"
                    />
                  </div>

                  {/* CHANGE 1: Expense Category — was missing from the form entirely */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Expense Category</label>
                    <input
                      type="text"
                      value={formData.expense_category}
                      onChange={(e) => setFormData({...formData, expense_category: e.target.value})}
                      placeholder="e.g. Utilities"
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-300 outline-none transition-all"
                    />
                  </div>

                  {/* CHANGE 2: Payment Method — added Bank Transfer option */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-300 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Online Portal">Online Portal</option>
                      <option value="Corporate Card">Corporate Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Transaction Description — full width, with word count hint */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Transaction Description</label>
                    <input
                      required
                      type="text"
                      value={formData.transaction_description}
                      onChange={(e) => setFormData({...formData, transaction_description: e.target.value})}
                      placeholder="e.g. Monthly cloud hosting invoice for Q2"
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-300 outline-none transition-all"
                    />
                    {/* CHANGE 3: inline hint if description is too vague */}
                    {formData.transaction_description.length > 0 &&
                      formData.transaction_description.trim().split(/\s+/).filter(Boolean).length < 3 && (
                      <p className="text-xs text-amber-600 mt-1">
                        Please be more descriptive for accurate AI categorization (at least 3 words).
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Amount (PKR)</label>
                    <input
                      required
                      type="number"
                      value={formData.amount_pkr}
                      onChange={(e) => setFormData({...formData, amount_pkr: e.target.value})}
                      placeholder="0.00"
                      className="w-full h-11 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-300 outline-none transition-all"
                    />
                  </div>

                </div>

                {/* Analysis Result */}
                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border-2 ${analysisResult.is_anomaly ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'} space-y-3`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {analysisResult.is_anomaly ? (
                          <AlertTriangle className="size-5 text-red-600" />
                        ) : (
                          <CheckCircle2 className="size-5 text-teal-600" />
                        )}
                        <span className={`font-semibold ${analysisResult.is_anomaly ? 'text-red-700' : 'text-teal-700'}`}>
                          {analysisResult.is_anomaly ? 'Outlier Detected' : 'Normal Transaction'}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-white/50 text-slate-600 uppercase tracking-wider">
                        Categorized as: {analysisResult.predicted_category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Score: <span className="font-mono font-bold">{analysisResult.anomaly_score.toFixed(4)}</span> |
                      State: <span className="font-semibold">{analysisResult.hmm_state}</span> |
                      Risk: <span className={`font-bold ${analysisResult.risk_band === 'High' ? 'text-red-600' : 'text-teal-600'}`}>{analysisResult.risk_band}</span>
                    </p>
                    {analysisResult.review_tier && (
                        <p className="text-sm">
                          Review Tier:{" "}
                          <span className={`font-semibold ${
                            analysisResult.review_tier === "High — review now"
                              ? "text-red-600"
                              : analysisResult.review_tier === "Medium — weekly batch"
                              ? "text-amber-600"
                              : "text-teal-600"
                          }`}>
                            {analysisResult.review_tier}
                          </span>
                        </p>
                      )}
                    {analysisResult.response && analysisResult.response !== "Transaction is not an anomaly." && (
                      <div className={`mt-1 p-4 rounded-xl border ${analysisResult.is_anomaly ? 'bg-white/60 border-red-200' : 'bg-white/60 border-teal-200'}`}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                          <span>🤖</span> AI Analysis
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {analysisResult.response}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setAnalysisResult(null); }}
                    className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="flex-1 h-12 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200 disabled:opacity-70"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze & Add'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl mb-1 text-slate-900">Recent Transactions</h2>
            <p className="text-slate-500">
              Showing {filtered.length} of {transactions.length} transactions
              {anomalyFilter === "yes" && " · anomalies only"}
              {anomalyFilter === "no"  && " · normal only"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-44 rounded-xl border-2 border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-300"
            />

            {/* Anomaly filter */}
            <div className="relative">
              <AlertTriangle className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <select
                value={anomalyFilter}
                onChange={(e) => setAnomalyFilter(e.target.value)}
                className="h-10 w-44 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-teal-300 appearance-none"
              >
                <option value="all">All Transactions</option>
                <option value="yes">Anomalies Only</option>
                <option value="no">Normal Only</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-40 rounded-xl border-2 border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-teal-300 appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Export */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-slate-200 rounded-xl text-slate-600 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
        </div>

        {txnLoading ? (
          <Spinner />
        ) : txnError ? (
          <pre className="text-red-500 text-sm whitespace-pre-wrap p-4 bg-red-50 rounded-xl">{txnError}</pre>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertTriangle className="size-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="pb-4">Transaction</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Department</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4 text-right">Amount (PKR)</th>
                  <th className="pb-4 text-right">Status</th>
                  <th className="pb-4 text-right">Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr
                    key={t.transaction_id || i}
                    className={`txn-row ${t.is_anomaly ? "bg-red-50/30" : ""} ${
                      i < filtered.length - 1 ? "border-b border-slate-100" : ""
                    }`}
                  >
                    <td className="py-4">
                      <p className="font-medium text-slate-900 text-sm truncate max-w-[200px]">
                        {t.transaction_description || "—"}
                      </p>
                      <p className="text-xs text-slate-400">{t.transaction_id}</p>
                    </td>
                    <td className="py-4 text-slate-500 text-sm whitespace-nowrap">
                      {t.date ? String(t.date).slice(0, 10) : "—"}
                    </td>
                    <td className="py-4 text-slate-600 text-sm">{t.department || "—"}</td>
                    <td className="py-4">
                      {t.expense_category
                        ? <span className="category-pill">{t.expense_category}</span>
                        : <span className="text-slate-400 text-sm">—</span>
                      }
                    </td>
                    <td className="py-4 text-right font-semibold text-slate-900 text-sm whitespace-nowrap">
                      {(t.amount_pkr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-4 text-right">
                      <StatusBadge status={t.approval_status} />
                    </td>
                    <td className="py-4 text-right">
                      {t.is_anomaly ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          <AlertTriangle className="size-3" /> Yes
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}