import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Checkbox } from "../components/checkbox";
import {
  TrendingUp,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Star,
  Users,
  BarChart3,
} from "lucide-react";
import { motion } from "motion/react";
import "../styles/signup.css";

const FEATURES = [
  { icon: BarChart3,    text: "Advanced behavioral analytics engine"   },
  { icon: CheckCircle2, text: "Real-time anomaly detection"             },
  { icon: Star,         text: "AI-powered spending predictions"         },
  { icon: Users,        text: "Customer clustering & segmentation"      },
];

const TESTIMONIALS = [
  {
    quote: "FinSight transformed how we evaluate financial risk.",
    author: "Sarah K., CFO",
  },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms]     = useState(false);
  const [showPwd, setShowPwd]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!acceptedTerms) {
      alert("Please accept the terms and conditions.");
      return;
    }
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 800);
  };

  return (
    <div className="signup-page flex min-h-screen">

      {/* ── Left Form Side ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-3 rounded-xl shadow-lg">
              <TrendingUp className="size-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">FinSight</h1>
              <p className="text-xs text-slate-500">Financial Intelligence</p>
            </div>
          </div>

          <div className="signup-card bg-white rounded-3xl border-2 border-slate-200 p-8 lg:p-10">
            <div className="mb-8">
              <h2 className="text-3xl text-slate-900 mb-2">Create your account</h2>
              <p className="text-slate-500">
                Start analyzing your financial data in minutes
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                <div className="signup-input-wrap rounded-xl border-2 border-slate-200 overflow-hidden">
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jane Smith"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-12 border-0 bg-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0 px-4"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <div className="signup-input-wrap rounded-xl border-2 border-slate-200 overflow-hidden">
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
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="signup-input-wrap relative rounded-xl border-2 border-slate-200 overflow-hidden">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Minimum 8 characters"
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

              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  Confirm Password
                </Label>
                <div className="signup-input-wrap relative rounded-xl border-2 border-slate-200 overflow-hidden">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 border-0 bg-slate-50 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 px-4"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked)}
                  className="mt-0.5 border-slate-300"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link to="#" className="text-teal-700 hover:underline font-medium">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="text-teal-700 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="signup-btn-primary w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="size-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
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
              Try Demo First (No sign-up)
            </Link>

            {/* Sign in */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-700 hover:text-teal-800 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 FinSight · All rights reserved
          </p>
        </motion.div>
      </div>

      {/* ── Brand Panel (right, desktop) ─────────────────────── */}
      <div className="signup-brand-panel hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] p-12 xl:p-16 relative order-1 lg:order-2">
        {/* Floating orbs */}
        <div className="signup-brand-orb absolute top-20 left-10 w-48 h-48 opacity-50" />
        <div className="signup-brand-orb signup-brand-orb-2 absolute bottom-20 right-8 w-64 h-64 opacity-35" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <div className="auth-logo-glow bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl">
              <TrendingUp className="size-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl text-white tracking-tight">FinSight</h1>
              <p className="text-emerald-100 text-sm">Financial Intelligence</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl xl:text-5xl text-white mb-5 leading-tight">
              Everything You Need
              <br />
              to Master Finance
            </h2>
            <p className="text-emerald-100 text-lg leading-relaxed">
              Join over 1,200 financial firms using FinSight to gain a
              competitive edge with AI-powered insights.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="signup-feature-item">
                <div className="bg-white/15 p-2 rounded-lg shrink-0">
                  <Icon className="size-4 text-white" />
                </div>
                <span className="text-white text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          {TESTIMONIALS.map(({ quote, author }) => (
            <div
              key={author}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-4 text-amber-300 fill-amber-300" />
                ))}
              </div>
              <p className="text-white text-sm italic leading-relaxed mb-3">
                &ldquo;{quote}&rdquo;
              </p>
              <p className="text-emerald-200 text-xs font-medium">{author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
