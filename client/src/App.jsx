import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage        from "./pages/LandingPage";
import AdminPage          from "./pages/AdminPage";
import VerifyOtpPage      from "./pages/VerifyOtpPage";
import AdminCases         from "./pages/AdminCases";
import AdminNotifications from "./pages/AdminNotifications";
import AdminSettings      from "./pages/AdminSettings";
import HearingOutcomePage from "./pages/HearingOutcomePage";
import HistoryPage        from "./pages/HistoryPage";
import { isAdmin }        from "./utils/roleHelper";
import Sidebar            from "./layout/Sidebar";
import Dashboard          from "./pages/Dashboard";
import ClientsPage        from "./pages/ClientsPage";
import CasesPage          from "./pages/CasesPage";
import CalendarPage       from "./pages/CalendarPage";
import NotificationsPage  from "./pages/NotificationsPage";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ProtectedRoute     from "./components/ProtectedRoute";
import AdminDashboard     from "./pages/AdminDashboard";
import VerifyLoginOtpPage from "./pages/VerifyLoginOtpPage";
import UserManagement     from "./pages/UserManagement";
import AdminLayout        from "./layout/AdminLayout";
import DiaryPage          from "./pages/DiaryPage";
import ProfilePage        from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Landing page — public marketing site at the root domain ── */}
        <Route path="/"                 element={<LandingPage />} />

        {/* ── Auth pages ── */}
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/verify-otp"       element={<VerifyOtpPage />} />
        <Route path="/verify-login-otp" element={<VerifyLoginOtpPage />} />

        {/* ── Admin panel ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                element={<AdminDashboard />} />
          <Route path="users"         element={<UserManagement />} />
          <Route path="cases"         element={<AdminCases />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings"      element={<AdminSettings />} />
        </Route>

        {/* ── Lawyer dashboard — all under /dashboard ── */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <div style={{ display: "flex", background: "#f1f5f9", minHeight: "100vh" }}>
              <Sidebar />
              <div style={{ marginLeft: 260, flex: 1, minHeight: "100vh" }}>
                <Routes>
                  <Route path="/"                   element={<Dashboard />} />
                  <Route path="/clients"            element={<ClientsPage />} />
                  <Route path="/cases"              element={<CasesPage />} />
                  <Route path="/cases/:id/diary"    element={<DiaryPage />} />
                  <Route path="/cases/:id/outcome"  element={<HearingOutcomePage />} />
                  <Route path="/calendar"           element={<CalendarPage />} />
                  <Route path="/notifications"      element={<NotificationsPage />} />
                  <Route path="/history"            element={<HistoryPage />} />
                  <Route path="/profile"            element={<ProfilePage />} />
                  {isAdmin() && <Route path="/admin-page" element={<AdminPage />} />}
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Catch all — redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
