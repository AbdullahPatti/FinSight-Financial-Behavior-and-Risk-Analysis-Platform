import { useState } from "react";
import {
  Bell,
  Download,
  Upload,
  Trash2,
  Database,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Shield,
  AlertCircle,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { Switch } from "../components/switch";
import { Label } from "../components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { toast } from "sonner";
import { motion } from "motion/react";
import "../styles/settings.css";
// ─── CHANGE 1: import shared auth fetch helper ────────────────────────────
import { apiFetch } from "../utils/api";
// ─────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications]   = useState(true);
  const [marketingEmails, setMarketingEmails]       = useState(false);
  const [weeklyReports, setWeeklyReports]           = useState(true);
  const [twoFactorAuth, setTwoFactorAuth]           = useState(false);
  const [dataAnalytics, setDataAnalytics]           = useState(true);
  const [anonData, setAnonData]                     = useState(true);
  const [thirdParty, setThirdParty]                 = useState(false);

  const handleExportData = () =>
    toast.success("Export initiated! You'll receive an email shortly.");

  const handleImportData = () =>
    toast.success("Import started. This may take a few minutes.");

  const handleDeleteAccount = () =>
    toast.error("Account deletion requires email confirmation. Check your inbox.");

  // ─── CHANGE 2: logout clears the JWT token from localStorage ─────────────
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  // ─────────────────────────────────────────────────────────────────────────

  const SESSIONS = [
    { device: "Chrome on MacBook Pro", location: "San Francisco, CA", current: true  },
    { device: "Safari on iPhone 15",   location: "San Francisco, CA", current: false },
    { device: "Chrome on Windows",     location: "New York, NY",      current: false },
  ];

  const LOGIN_HISTORY = [
    { date: "Apr 17, 2026  10:30 AM", location: "San Francisco, CA",  status: "success" },
    { date: "Apr 16, 2026   8:15 AM", location: "San Francisco, CA",  status: "success" },
    { date: "Apr 15, 2026   9:45 PM", location: "New York, NY",       status: "success" },
    { date: "Apr 14, 2026   2:20 PM", location: "Unknown Location",   status: "failed"  },
  ];

  return (
    <div className="space-y-8 max-w-5xl page-typography font-body">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="settings-header"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 p-3.5 rounded-xl">
            <Settings className="size-7 text-teal-700" />
          </div>
          <div>
            <h1 className="text-4xl text-slate-900">Settings</h1>
            <p className="text-slate-500 text-lg">
              Manage your account preferences and application settings
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="settings-tabs-list h-auto bg-white border-2 border-slate-200 rounded-xl p-1.5">
          {[
            { value: "notifications", label: "Notifications" },
            { value: "account",       label: "Account"       },
            { value: "data",          label: "Data & Privacy" },
            { value: "security",      label: "Security"      },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="settings-tab data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg px-5 py-2.5 rounded-lg transition-all text-slate-600"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Notifications ─────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div className="settings-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="settings-section-icon">
                <Bell className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl text-slate-900">Notification Preferences</h2>
                <p className="text-slate-500 text-sm">Choose how and when you want to be notified</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: "email-notif", icon: Mail,       label: "Email Notifications",  desc: "Receive alerts and reports via email",              val: emailNotifications, set: setEmailNotifications },
                { id: "push-notif",  icon: Smartphone,  label: "Push Notifications",   desc: "Real-time alerts on all your devices",              val: pushNotifications,  set: setPushNotifications  },
                { id: "marketing",   icon: Mail,       label: "Marketing Emails",      desc: "Updates about new features, offers and news",       val: marketingEmails,    set: setMarketingEmails    },
                { id: "reports",     icon: Database,    label: "Weekly Reports",        desc: "A summary of your financial activity each Sunday",  val: weeklyReports,      set: setWeeklyReports      },
              ].map(({ id, icon: Icon, label, desc, val, set }) => (
                <div key={id} className="settings-toggle-row">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 border border-teal-100 p-2 rounded-lg">
                      <Icon className="size-4 text-teal-700" />
                    </div>
                    <div>
                      <Label htmlFor={id} className="text-slate-800 cursor-pointer">{label}</Label>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Switch id={id} checked={val} onCheckedChange={set} />
                </div>
              ))}
            </div>
          </div>

          {/* Notification Frequency */}
          <div className="settings-card">
            <h2 className="text-2xl text-slate-900 mb-6">Alert Frequency</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Transaction Alerts</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger className="settings-select-trigger h-11 border-2 border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Anomaly Alerts</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger className="settings-select-trigger h-11 border-2 border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Account ───────────────────────────────────────── */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <div className="settings-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="settings-section-icon">
                <Globe className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl text-slate-900">Account Preferences</h2>
                <p className="text-slate-500 text-sm">Localization and display settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: "Language",
                  options: [
                    { value: "en", label: "English (US)" },
                    { value: "es", label: "Español"      },
                    { value: "fr", label: "Français"     },
                    { value: "de", label: "Deutsch"      },
                    { value: "ja", label: "日本語"         },
                  ],
                  defaultVal: "en",
                },
                {
                  label: "Timezone",
                  options: [
                    { value: "pst", label: "Pacific Time (PST)"   },
                    { value: "mst", label: "Mountain Time (MST)"  },
                    { value: "cst", label: "Central Time (CST)"   },
                    { value: "est", label: "Eastern Time (EST)"   },
                    { value: "utc", label: "UTC"                  },
                  ],
                  defaultVal: "pst",
                },
                {
                  label: "Currency",
                  options: [
                    { value: "usd", label: "USD — US Dollar"       },
                    { value: "eur", label: "EUR — Euro"            },
                    { value: "gbp", label: "GBP — British Pound"   },
                    { value: "jpy", label: "JPY — Japanese Yen"    },
                  ],
                  defaultVal: "usd",
                },
                {
                  label: "Date Format",
                  options: [
                    { value: "mdy", label: "MM/DD/YYYY" },
                    { value: "dmy", label: "DD/MM/YYYY" },
                    { value: "ymd", label: "YYYY-MM-DD" },
                  ],
                  defaultVal: "mdy",
                },
              ].map(({ label, options, defaultVal }) => (
                <div key={label} className="space-y-2">
                  <Label className="text-slate-700">{label}</Label>
                  <Select defaultValue={defaultVal}>
                    <SelectTrigger className="settings-select-trigger h-11 border-2 border-slate-200 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Data & Privacy ────────────────────────────────── */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <div className="settings-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="settings-section-icon">
                <Database className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl text-slate-900">Data Management</h2>
                <p className="text-slate-500 text-sm">Export, import, or delete your financial data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="settings-data-item">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                    <Download className="size-5 text-teal-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-slate-900 mb-1">Export Your Data</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Download a full copy of your financial data including transactions, analytics reports, and
                      settings. Delivered to your email as a ZIP archive within 24 hours.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="settings-action-btn-outline"
                    >
                      <Download className="size-4" />
                      Request Data Export
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-data-item">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <Upload className="size-5 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-slate-900 mb-1">Import Data</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Import your financial data from another platform or existing spreadsheets.
                      Supported formats: CSV, JSON, Excel (.xlsx). Max file size: 50MB.
                    </p>
                    <button
                      onClick={handleImportData}
                      className="settings-action-btn-outline"
                    >
                      <Upload className="size-4" />
                      Import Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="settings-card">
            <h2 className="text-2xl text-slate-900 mb-6">Privacy Controls</h2>
            <div className="space-y-3">
              {[
                { id: "analytics",   val: dataAnalytics, set: setDataAnalytics, label: "Usage Analytics",       desc: "Allow us to analyze how you use FinSight to improve the product"  },
                { id: "anon",        val: anonData,       set: setAnonData,      label: "Anonymous Data Sharing", desc: "Share anonymized usage patterns to help improve financial models"   },
                { id: "third-party", val: thirdParty,     set: setThirdParty,    label: "Third-Party Integrations", desc: "Allow connections to external services and data providers"      },
              ].map(({ id, val, set, label, desc }) => (
                <div key={id} className="settings-toggle-row">
                  <div>
                    <Label htmlFor={id} className="text-slate-800 cursor-pointer">{label}</Label>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <Switch id={id} checked={val} onCheckedChange={set} />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-danger-zone">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="size-5" />
              <h2 className="text-2xl">Danger Zone</h2>
            </div>
            <div className="settings-danger-zone-inner">
              <h3 className="text-lg text-slate-900 mb-1">Delete Account</h3>
              <p className="text-sm text-slate-500 mb-4">
                Permanently delete your FinSight account and all associated data. This action{" "}
                <strong>cannot be undone</strong>. All your financial reports, analytics, and
                settings will be lost.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all hover:shadow-lg"
              >
                <Trash2 className="size-4" />
                Delete My Account
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ── Security ──────────────────────────────────────── */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="settings-card">
            <div className="flex items-center gap-4 mb-8">
              <div className="settings-section-icon">
                <Shield className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl text-slate-900">Security Settings</h2>
                <p className="text-slate-500 text-sm">Protect your account with additional security measures</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* 2FA */}
              <div className="settings-data-item">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                      <Lock className="size-5 text-teal-700" />
                    </div>
                    <div>
                      <Label htmlFor="2fa" className="text-slate-800 cursor-pointer">
                        Two-Factor Authentication
                      </Label>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Add an extra layer of security with authenticator app or SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
                {twoFactorAuth && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pl-14 flex items-center gap-2"
                  >
                    <CheckCircle2 className="two-fa-active size-5 text-teal-600" />
                    <span className="text-sm text-teal-700 font-medium">
                      2FA enabled — your account is protected
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Active Sessions */}
              <div className="settings-data-item">
                <div className="flex items-start gap-3">
                  <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-100 shrink-0">
                    <Smartphone className="size-5 text-teal-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-slate-900 mb-1">Active Sessions</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Devices currently logged into your FinSight account
                    </p>
                    <div className="space-y-2">
                      {SESSIONS.map((session, i) => (
                        <div key={i} className="session-row">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{session.device}</p>
                            <p className="text-xs text-slate-400">{session.location}</p>
                          </div>
                          {session.current ? (
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => toast.success("Session revoked successfully.")}
                              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="settings-card">
            <h2 className="text-2xl text-slate-900 mb-6">Recent Login History</h2>
            <div className="space-y-2">
              {LOGIN_HISTORY.map((login, i) => (
                <div key={i} className="login-history-row">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{login.date}</p>
                    <p className="text-xs text-slate-400">{login.location}</p>
                  </div>
                  {login.status === "success" ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                      Failed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
