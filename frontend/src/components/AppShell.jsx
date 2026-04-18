import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/expenses", label: "Expenses", icon: CreditCard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

function getTitle(pathname) {
  const item = NAV_ITEMS.find((entry) => pathname.startsWith(entry.to));
  return item?.label || "FinSight";
}

export default function AppShell() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar className="bg-white border-r border-slate-200">
        <SidebarHeader className="border-b border-slate-200 p-4">
          <Link to="/dashboard" className="block text-xl text-teal-700 font-semibold">
            FinSight
          </Link>
          <p className="text-xs text-slate-500 mt-1">Financial Behavior & Risk</p>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 uppercase tracking-wider text-[11px]">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                  const isActive = location.pathname === to;
                  return (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-teal-50 text-teal-700"
                            : "text-slate-600 hover:text-teal-700"
                        }
                      >
                        <Link to={to}>
                          <Icon className="size-4" />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200 p-3">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-slate-50 min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
          <SidebarTrigger className="text-slate-600 hover:text-teal-700" />
          <h1 className="text-lg text-slate-900 font-semibold">{getTitle(location.pathname)}</h1>
        </header>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
