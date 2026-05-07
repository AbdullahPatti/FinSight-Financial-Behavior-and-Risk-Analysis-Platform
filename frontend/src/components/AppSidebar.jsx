import { useState, useEffect, createContext, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  DollarSign,
  BarChart2,
  User,
  Settings,
  TrendingUp,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import "./sidebar.css";

// ── Sidebar context so the layout can read open/collapsed state ────────────
const SidebarContext = createContext({ open: true, setOpen: () => {} });
export function useSidebar() { return useContext(SidebarContext); }

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(true);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className={`finsight-layout ${open ? "sidebar-open" : "sidebar-collapsed"}`}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ── Nav items ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Expenses",  icon: DollarSign,      to: "/expenses"  },
  { label: "Analytics", icon: BarChart2,        to: "/analytics" },
  { label: "Profile",   icon: User,             to: "/profile"   },
  { label: "Settings",  icon: Settings,         to: "/settings"  },
];

// ── Sidebar component ──────────────────────────────────────────────────────
export default function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const navigate          = useNavigate();

  const userName  = localStorage.getItem("user_name")  || "John Doe";
  const userPlan  = localStorage.getItem("user_plan")  || "Free Account";
  const userEmail = localStorage.getItem("user_email") || "";

  // Initials from name
  const initials = userName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch { /* ignore */ }
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className={`finsight-sidebar ${open ? "is-open" : "is-collapsed"}`}>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="sidebar-logo-row">
        <div className="sidebar-logo-icon">
          <TrendingUp size={20} strokeWidth={2.5} />
        </div>
        {open && (
          <div className="sidebar-logo-text">
            <span className="sidebar-brand-name">FinSight</span>
            <span className="sidebar-brand-sub">Financial Intelligence</span>
          </div>
        )}
      </div>

      {/* ── Nav label ────────────────────────────────────────── */}
      {open && <p className="sidebar-nav-label">NAVIGATION</p>}

      {/* ── Nav items ────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "is-active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="sidebar-nav-icon">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                {open && <span className="sidebar-nav-label-text">{label}</span>}
                {open && isActive && <span className="sidebar-active-pill" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Spacer ───────────────────────────────────────────── */}
      <div className="sidebar-spacer" />

      {/* ── User card ────────────────────────────────────────── */}
      <div
        className={`sidebar-user-card ${open ? "" : "collapsed"}`}
        onClick={() => navigate("/profile")}
        title={open ? "" : userName}
      >
        <div className="sidebar-user-avatar">{initials}</div>
        {open && (
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{userName}</span>
            <span className="sidebar-user-plan">
              {userPlan === "Free" ? "Free Account" : `${userPlan} Account`}
            </span>
          </div>
        )}
        {open && <ChevronRight size={14} className="sidebar-user-chevron" />}
      </div>

      {/* ── Logout ───────────────────────────────────────────── */}
      <button
        className={`sidebar-logout-btn ${open ? "" : "collapsed"}`}
        onClick={handleLogout}
      >
        <LogOut size={16} strokeWidth={1.8} />
        {open && <span>Logout</span>}
      </button>

      {/* ── Collapse toggle ──────────────────────────────────── */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setOpen(!open)}
        title={open ? "Collapse sidebar" : "Expand sidebar"}
      >
        {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </aside>
  );
}
