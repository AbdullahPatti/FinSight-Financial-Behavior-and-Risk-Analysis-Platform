import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/input";
import { Label } from "../components/label";
import {
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  BarChart3,
  Zap,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import "../styles/login.css";

const BRAND_STATS = [
  { label: "Assets Analyzed",     value: "$2.4B+" },
  { label: "Financial Firms",     value: "1,200+"  },
  { label: "Prediction Accuracy", value: "92.4%"   },
];

const BRAND_FEATURES = [
  { icon: BarChart3, text: "Advanced behavioral analytics"   },
  { icon: Shield,    text: "Enterprise-grade security"        },
  { icon: Zap,       text: "Real-time anomaly detection"      },
  { icon: Lock,      text: "Bank-level encryption"            },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed. Please try again.");
        return;
      }

      localStorage.setItem("user_name", data.user);
      localStorage.setItem("user_plan", data.plan);
      localStorage.setItem("user_email", data.email || email);
      navigate("/dashboard");
    } catch {
      setError("Cannot reach the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page flex min-h-screen font-body">

      {/* ── Brand Panel (left, desktop) ──────────────────────── */}
      <div className="login-brand-panel hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] p-12 xl:p-16 relative">
        <div className="login-brand-orb absolute top-16 right-10 w-40 h-40 opacity-60" />
        <div className="login-brand-orb login-brand-orb-2 absolute bottom-24 left-8 w-60 h-60 opacity-40" />
        <div className="login-brand-orb absolute top-1/2 right-1/4 w-24 h-24 opacity-30 animation-delay-2000" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="auth-logo-glow bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl">
              <TrendingUp className="size-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-heading text-2xl text-white tracking-tight">FinSight</h1>
              <p className="text-teal-100 text-sm">Financial Intelligence</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="font-heading text-4xl xl:text-5xl text-white mb-5 leading-tight">
              Your Financial
              <br />
              Intelligence Hub
            </h2>
            <p className="text-teal-100 text-lg leading-relaxed">
              Advanced behavioral analytics and risk analysis for modern
              financial professionals.
            </p>
          </div>

          <div className="space-y-3">
            {BRAND_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="brand-stat-card flex items-center gap-3 px-4 py-3">
                <div className="bg-white/15 p-2 rounded-lg">
                  <Icon className="size-4 text-white" />
                </div>
                <span className="text-white text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {BRAND_STATS.map(({ label, value }) => (
            <div key={label} className="brand-stat-card p-4 text-center">
              <p className="text-2xl text-white font-semibold">{value}</p>
              <p className="text-teal-100 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Login Form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-3 rounded-xl shadow-lg">
              <TrendingUp className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-heading text-xl font-semibold text-slate-900">FinSight</h1>
              <p className="text-xs text-slate-500">Financial Intelligence</p>
            </div>
          </div>

          <div className="login-card bg-white rounded-3xl border-2 border-slate-200 p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="font-heading text-3xl text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-500">Sign in to your FinSight account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error banner */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email address
                </Label>
                <div className="auth-input-wrap rounded-xl border-2 border-slate-200 overflow-hidden">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-0 bg-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Link
                    to="#"
                    className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-input-wrap relative rounded-xl border-2 border-slate-200 overflow-hidden">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-0 bg-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 px-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPwd ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="auth-btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="size-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="size-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-400">or</span>
              </div>
            </div>

            {/* Demo link */}
            <Link
              to="/dashboard?demo=true"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all text-sm font-medium"
            >
              <Eye className="size-4" />
              Explore Demo (No sign-up needed)
            </Link>

            {/* Sign up */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-teal-700 hover:text-teal-800 font-semibold hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 FinSight · All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
}