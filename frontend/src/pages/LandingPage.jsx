import { Link } from "react-router-dom";
import { Button } from "../components/button";
import {
  TrendingUp,
  ArrowRight,
  BarChart3,
  Shield,
  Sparkles,
  Eye,
  Check,
  Award,
  Lock,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import "../styles/landing.css";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Deep insights into spending patterns, revenue trends, and financial behavior with machine learning algorithms.",
    gradient: "from-teal-600 to-cyan-600",
    bg: "from-teal-50 to-cyan-50",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description:
      "Proactive anomaly detection and risk classification to protect your financial assets and investments.",
    gradient: "from-emerald-600 to-green-600",
    bg: "from-emerald-50 to-green-50",
  },
  {
    icon: TrendingUp,
    title: "Predictive Modeling",
    description:
      "Forecast future trends with AI-powered predictions and make data-driven strategic decisions.",
    gradient: "from-green-600 to-lime-600",
    bg: "from-green-50 to-lime-50",
  },
  {
    icon: Sparkles,
    title: "Behavioral Clustering",
    description:
      "Identify customer segments and spending patterns through advanced clustering algorithms.",
    gradient: "from-amber-500 to-yellow-500",
    bg: "from-amber-50 to-yellow-50",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption and security protocols to keep your financial data safe and compliant.",
    gradient: "from-slate-600 to-gray-600",
    bg: "from-slate-50 to-gray-50",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description:
      "Instant insights and live updates as your data changes, keeping you ahead of the curve.",
    gradient: "from-cyan-600 to-blue-600",
    bg: "from-cyan-50 to-blue-50",
  },
];

export default function LandingPage() {
  return (
    <div className="landing-hero-bg min-h-screen page-typography font-body">

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 p-2.5 rounded-xl shadow-lg shadow-teal-600/20">
                <TrendingUp className="size-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl font-semibold tracking-tight text-slate-900">
                  FinSight
                </span>
                <p className="text-xs text-slate-500">Financial Intelligence</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/dashboard?demo=true">
                <Button
                  variant="ghost"
                  className="nav-link hidden sm:flex items-center gap-2 text-slate-600 hover:text-teal-700"
                >
                  <Eye className="size-4" />
                  View Demo
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="nav-link text-slate-600 hover:text-teal-700">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 hover:from-teal-700 hover:via-emerald-700 hover:to-green-800 shadow-lg shadow-teal-600/25 text-white">
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pt-36 pb-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            {/* Gold badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 gold-badge border border-amber-200/70 rounded-full mb-10 shadow-sm">
              <Award className="size-4 text-amber-600 shrink-0" />
              <span className="text-amber-900 font-medium text-sm">
                Trusted by Financial Professionals Worldwide
              </span>
            </div>

            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl mb-8 tracking-tight text-slate-900 leading-[1.05]">
              Master Your
              <br />
              <span className="landing-gradient-text">Financial Future</span>
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Advanced risk analysis, behavioral insights, and predictive
              analytics to transform how you understand and manage financial data.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 hover:from-teal-700 hover:via-emerald-700 hover:to-green-800 shadow-2xl shadow-teal-600/35 text-white"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 size-5" strokeWidth={2.5} />
                </Button>
              </Link>
              <Link to="/dashboard?demo=true">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg border-2 border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  <Eye className="mr-2 size-5" />
                  Explore Demo
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
              {[
                "Enterprise-grade Security",
                "Real-time Analytics",
                "AI-Powered Insights",
              ].map((text) => (
                <div key={text} className="trust-badge flex items-center gap-2">
                  <Check className="size-5 text-emerald-600" strokeWidth={2.5} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-8 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl sm:text-5xl mb-4 text-slate-900">
              Financial Intelligence, Elevated
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive tools designed for modern financial analysis
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`feature-card bg-gradient-to-br ${feature.bg} backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-lg`}
              >
                <div
                  className={`feature-icon-wrap bg-gradient-to-br ${feature.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <feature.icon className="size-7 text-white" strokeWidth={2} />
                </div>
                <h3 className="font-heading text-2xl mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-700 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="cta-card bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 rounded-3xl p-14 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-heading text-5xl lg:text-6xl mb-6 tracking-tight">
                Ready to Transform Your
                <br />
                Financial Analysis?
              </h2>
              <p className="text-xl mb-12 text-teal-50 max-w-2xl mx-auto leading-relaxed">
                Join thousands of financial professionals who trust FinSight for
                their most critical decisions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-teal-700 hover:bg-teal-50 h-14 px-8 text-lg shadow-2xl"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 size-5" strokeWidth={2.5} />
                  </Button>
                </Link>
                <Link to="/dashboard?demo=true">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/40 text-white hover:bg-white/10 h-14 px-8 text-lg"
                  >
                    <Eye className="mr-2 size-5" />
                    View Live Demo
                  </Button>
                </Link>
              </div>
              <p className="mt-8 text-sm text-teal-100">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 p-2 rounded-xl shadow">
                <TrendingUp className="size-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-lg font-semibold text-slate-900">FinSight</span>
                <p className="text-xs text-slate-500">Financial Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <Link to="/dashboard?demo=true" className="footer-link flex items-center gap-1.5">
                <Eye className="size-4" />
                Demo
              </Link>
              <Link to="/login" className="footer-link">Sign In</Link>
              <Link to="/signup" className="footer-link">Get Started</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
            <p>© 2026 FinSight · Financial Behavior and Risk Analysis Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
