import { useState, useEffect } from "react";
import {
  User,
  Mail,
  CreditCard,
  Shield,
  Moon,
  Sun,
  Save,
  Camera,
  CheckCircle2,
  Star,
  TrendingUp,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Switch } from "../components/switch";
import { toast } from "sonner";
import { motion } from "motion/react";
import "../styles/profile.css";

const BASE_URL = "http://localhost:8000";

const PROFILE_STATS = [
  { label: "Transactions",  value: "2,847" },
  { label: "Reports Run",   value: "156"   },
  { label: "Anomalies",     value: "12"    },
  { label: "Saved Filters", value: "24"    },
];

/** Derive up-to-2-letter initials from a full name */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage() {
  // ── Profile fields ──────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email,    setEmail]    = useState("");
  const [plan,     setPlan]     = useState("Free");   // "Free" | "Pro" | "Enterprise"

  // Fields not in DB – kept local only
  const [company, setCompany] = useState("Acme Corporation");
  const [role,    setRole]    = useState("Chief Financial Officer");

  // ── Password fields ─────────────────────────────────────────
  const [currentPwd,  setCurrentPwd]  = useState("");
  const [newPwd,      setNewPwd]      = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [showNewPwd,  setShowNewPwd]  = useState(false);

  // ── Preferences ─────────────────────────────────────────────
  const [darkMode,          setDarkMode]    = useState(false);
  const [emailNotifs,       setEmailNotifs] = useState(true);
  const [analyticsTracking, setAnalytics]  = useState(true);

  // ── Loading / saving states ──────────────────────────────────
  const [loadingProfile,  setLoadingProfile]  = useState(true);
  const [savingProfile,   setSavingProfile]   = useState(false);
  const [savingPassword,  setSavingPassword]  = useState(false);

  // ── Fetch profile on mount ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const userEmail = localStorage.getItem("user_email");
        if (!userEmail) throw new Error("Missing logged-in user email");

        const res = await fetch(
          `${BASE_URL}/auth/profile?email=${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setFullName(data.full_name ?? "");
        setEmail(data.email ?? "");
        setPlan(data.plan ?? "Free");
      } catch (err) {
        toast.error("Could not load profile. Please refresh.");
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // ── Update profile ───────────────────────────────────────────
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      toast.error("No logged-in user found. Please sign in again.");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch(
        `${BASE_URL}/auth/profile?email=${encodeURIComponent(userEmail)}`,
        {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
        }
      );
      if (!res.ok) throw new Error("Update failed");
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Update password ──────────────────────────────────────────
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      toast.error("No logged-in user found. Please sign in again.");
      return;
    }

    if (!currentPwd) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords don't match!");
      return;
    }
    if (newPwd.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(
        `${BASE_URL}/auth/security/password?email=${encodeURIComponent(userEmail)}&new_password=${encodeURIComponent(newPwd)}`,
        { method: "PUT" }
      );
      if (!res.ok) throw new Error("Password update failed");
      toast.success("Password updated successfully!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Derived subscription info ────────────────────────────────
  const isPro        = plan === "Pro";
  const isEnterprise = plan === "Enterprise";
  const isFree       = !isPro && !isEnterprise;

  const planLabel  = isFree ? "Free Plan" : isPro ? "Pro Plan" : "Enterprise Plan";
  const planAmount = isFree ? "$0 / month" : isPro ? "$49.99 / month" : "$199.99 / month";
  const planStatus = isFree ? "No active subscription" : "Active";

  // ── Avatar initials ──────────────────────────────────────────
  const initials = getInitials(fullName);

  // ── Skeleton loader ──────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="size-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl page-typography font-body">

      {/* ── Profile Hero ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="profile-hero p-8 lg:p-10"
      >
        <div className="profile-hero-orb top-[-20px] right-[-20px] w-48 h-48 pointer-events-none" />
        <div className="profile-hero-orb profile-hero-orb-2 bottom-[-30px] left-[10%] w-64 h-64 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="profile-avatar size-24 rounded-full flex items-center justify-center">
              <span className="profile-avatar-initials text-3xl">{initials}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg border-2 border-teal-200 hover:bg-teal-50 transition-colors">
              <Camera className="size-3.5 text-teal-700" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-3xl text-white">{fullName || "—"}</h2>

              {/* Plan badge */}
              {isFree ? (
                <span className="plan-badge" style={{ background: "rgba(148,163,184,0.25)", color: "#e2e8f0", border: "1px solid rgba(148,163,184,0.4)" }}>
                  Free Plan
                </span>
              ) : isPro ? (
                <span className="plan-badge plan-badge-pro">
                  <Star className="size-3 fill-current" />
                  Pro Plan
                </span>
              ) : (
                <span className="plan-badge plan-badge-pro" style={{ background: "rgba(168,85,247,0.25)", border: "1px solid rgba(168,85,247,0.5)" }}>
                  <Star className="size-3 fill-current" />
                  Enterprise
                </span>
              )}

              <span className="plan-badge plan-badge-verified">
                <Shield className="size-3" />
                Verified
              </span>
            </div>
            <p className="text-teal-100 text-lg mb-1">{role}</p>
            <p className="text-teal-200 text-sm">{email}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto">
            {PROFILE_STATS.map(({ label, value }) => (
              <div key={label} className="profile-hero-stat text-center">
                <p className="text-xl text-white font-semibold">{value}</p>
                <p className="text-teal-200 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Profile Information ──────────────────────────────────── */}
      <div className="profile-section-card">
        <div className="flex items-center gap-4 mb-8">
          <div className="profile-section-icon profile-section-icon-teal">
            <User className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl text-slate-900">Profile Information</h2>
            <p className="text-slate-500 text-sm">Update your personal and professional details</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Full Name — synced with DB */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="profile-input pl-11 h-12 border-2 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Email — read-only (not editable via current API) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                Email Address
                <span className="ml-2 text-xs text-slate-400 font-normal">(read-only)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="profile-input pl-11 h-12 border-2 border-slate-200 rounded-xl bg-slate-50 cursor-not-allowed text-slate-500"
                />
              </div>
            </div>

            {/* Company — local only */}
            <div className="space-y-2">
              <Label htmlFor="company" className="text-slate-700">
                Company
                <span className="ml-2 text-xs text-slate-400 font-normal">(local)</span>
              </Label>
              <div className="relative">
                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="profile-input pl-11 h-12 border-2 border-slate-200 rounded-xl"
                />
              </div>
            </div>

            {/* Job Title — local only */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700">
                Job Title
                <span className="ml-2 text-xs text-slate-400 font-normal">(local)</span>
              </Label>
              <div className="relative">
                <Star className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="profile-input pl-11 h-12 border-2 border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="profile-save-btn px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingProfile
                ? <Loader2 className="size-4 animate-spin" />
                : <Save className="size-4" />}
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Subscription ─────────────────────────────────────────── */}
      <div className="profile-section-card">
        <div className="flex items-center gap-4 mb-8">
          <div className="profile-section-icon profile-section-icon-amber">
            <Star className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl text-slate-900">Subscription Details</h2>
            <p className="text-slate-500 text-sm">Manage your plan and billing information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            {/* Current Plan */}
            <div className="billing-info-row">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Current Plan</p>
                <p className="text-lg text-slate-900 mt-0.5 font-medium">{planLabel}</p>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                  isFree
                    ? "bg-slate-50 text-slate-600 border-slate-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isFree ? "Free" : "Active"}
              </span>
            </div>

            {/* Billing Cycle */}
            <div className="billing-info-row">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Billing Cycle</p>
                <p className="text-lg text-slate-900 mt-0.5">
                  {isFree ? "N/A" : "Monthly"}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="billing-info-row">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Amount</p>
                <p className="text-lg text-slate-900 mt-0.5 font-semibold">{planAmount}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Next Billing Date */}
            <div className="billing-info-row">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Next Billing Date</p>
                <p className="text-lg text-slate-900 mt-0.5">
                  {isFree ? "—" : "May 17, 2026"}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="billing-info-row">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Payment Method</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {isFree ? (
                    <p className="text-lg text-slate-400 italic">No payment method</p>
                  ) : (
                    <>
                      <CreditCard className="size-5 text-slate-400" />
                      <p className="text-lg text-slate-900">•••• 4242</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CTA button */}
            {isFree ? (
              <button
                onClick={() => toast.info("Upgrade flow coming soon!")}
                className="w-full py-3 rounded-xl border-2 border-teal-300 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-400 transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Star className="size-4" />
                Upgrade to Pro — $49.99/mo
              </button>
            ) : isPro ? (
              <button
                onClick={() => toast.info("Upgrade flow coming soon!")}
                className="w-full py-3 rounded-xl border-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Star className="size-4" />
                Upgrade to Enterprise
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl border-2 border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="size-4" />
                You're on the highest plan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Security ─────────────────────────────────────────────── */}
      <div className="profile-section-card">
        <div className="flex items-center gap-4 mb-8">
          <div className="profile-section-icon" style={{ background: "linear-gradient(135deg, #fef2f2, #fee2e2)", color: "#dc2626" }}>
            <Lock className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl text-slate-900">Security Settings</h2>
            <p className="text-slate-500 text-sm">Update your password and secure your account</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPwd" className="text-slate-700">Current Password</Label>
            <Input
              id="currentPwd"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="Enter your current password"
              className="profile-input h-12 border-2 border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="newPwd" className="text-slate-700">New Password</Label>
              <div className="relative">
                <Input
                  id="newPwd"
                  type={showNewPwd ? "text" : "password"}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="profile-input h-12 border-2 border-slate-200 rounded-xl pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPwd" className="text-slate-700">Confirm Password</Label>
              <Input
                id="confirmPwd"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Repeat new password"
                className="profile-input h-12 border-2 border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 transition-all text-sm font-medium flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingPassword
                ? <Loader2 className="size-4 animate-spin" />
                : <Shield className="size-4" />}
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Preferences ──────────────────────────────────────────── */}
      <div className="profile-section-card">
        <div className="flex items-center gap-4 mb-8">
          <div className="profile-section-icon profile-section-icon-teal">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl text-slate-900">Preferences</h2>
            <p className="text-slate-500 text-sm">Customize your FinSight experience</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="pref-row">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="size-5 text-slate-600" />
              ) : (
                <Sun className="size-5 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-800">Dark Mode</p>
                <p className="text-xs text-slate-400">Toggle dark theme across all pages</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          <div className="pref-row">
            <div className="flex items-center gap-3">
              <Mail className="size-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Email Notifications</p>
                <p className="text-xs text-slate-400">Receive alerts and reports via email</p>
              </div>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>

          <div className="pref-row">
            <div className="flex items-center gap-3">
              <TrendingUp className="size-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Analytics Tracking</p>
                <p className="text-xs text-slate-400">Help improve FinSight with usage data</p>
              </div>
            </div>
            <Switch checked={analyticsTracking} onCheckedChange={setAnalytics} />
          </div>
        </div>
      </div>
    </div>
  );
}
