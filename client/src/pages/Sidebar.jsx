import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, CalendarDays,
  Bell, Scale, Archive, LogOut, ChevronRight,
} from "lucide-react";
import { isAdmin, isLawyer } from "../utils/roleHelper";

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const menuItems = [
    { name: "Dashboard",      path: "/",              icon: LayoutDashboard },
    ...(isLawyer() || isAdmin() ? [
      { name: "Clients",      path: "/clients",       icon: Users      },
      { name: "Cases",        path: "/cases",         icon: Briefcase  },
      { name: "Calendar",     path: "/calendar",      icon: CalendarDays },
      { name: "History",      path: "/history",       icon: Archive    },
    ] : []),
    { name: "Notifications",  path: "/notifications", icon: Bell       },
    ...(isAdmin() ? [
      { name: "Admin Panel",  path: "/admin",         icon: Scale      },
    ] : []),
  ];

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  return (
    <aside style={{
      width: 260, minHeight: "100vh", position: "fixed", left: 0, top: 0,
      background: "#0f2744",
      display: "flex", flexDirection: "column",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      zIndex: 100,
    }}>

      {/* Logo */}
      <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Scale size={20} color="#fff" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>Legal Diary</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Advocate Management</p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <p style={{ margin: "20px 24px 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
        Navigation
      </p>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: active ? "rgba(37,99,235,0.9)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                transition: "all 0.15s ease",
                cursor: "pointer",
                position: "relative",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400, letterSpacing: "-0.1px" }}>
                  {item.name}
                </span>
                {active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.7 }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {/* User card */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10,
          background: "rgba(255,255,255,0.05)", marginBottom: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#b45309,#92400e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff",
          }}>
            {(userInfo?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userInfo?.name || "User"}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>
              {userInfo?.role || "lawyer"}
            </p>
          </div>
        </div>
        {/* Logout */}
        <button onClick={() => { localStorage.removeItem("userInfo"); navigate("/login"); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10, cursor: "pointer",
            background: "transparent", border: "1px solid rgba(239,68,68,0.25)",
            color: "rgba(248,113,113,0.85)", fontSize: 13, fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.85)"; }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
