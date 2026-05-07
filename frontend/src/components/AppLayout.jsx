import { Outlet } from "react-router-dom";
import AppSidebar, { SidebarProvider } from "./AppSidebar";

/**
 * AppLayout wraps every authenticated page.
 * Usage in your router:
 *
 *   <Route element={<AppLayout />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *     <Route path="/expenses"  element={<ExpensesPage />}  />
 *     <Route path="/analytics" element={<AnalyticsPage />} />
 *     <Route path="/profile"   element={<ProfilePage />}   />
 *     <Route path="/settings"  element={<SettingsPage />}  />
 *   </Route>
 */
export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* All child routes render here, margin auto-adjusts to sidebar width */}
      <div className="sidebar-page-content">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
