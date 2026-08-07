import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, CalendarDays,
  Bell, Scale, Archive, LogOut, ChevronRight, UserCircle,
} from "lucide-react";
import { isAdmin, isLawyer } from "../utils/roleHelper";

const Sidebar = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const menuItems = [
    { name: "Dashboard",     path: "/dashboard",               icon: LayoutDashboard },
    ...(isLawyer() || isAdmin() ? [
      { name: "Clients",     path: "/dashboard/clients",       icon: Users           },
      { name: "Cases",       path: "/dashboard/cases",         icon: Briefcase       },
      { name: "Calendar",    path: "/dashboard/calendar",      icon: CalendarDays    },
      { name: "History",     path: "/dashboard/history",       icon: Archive         },
    ] : []),
    { name: "Notifications", path: "/dashboard/notifications", icon: Bell            },
    { name: "My Profile",    path: "/dashboard/profile",       icon: UserCircle      },
    ...(isAdmin() ? [
      { name: "Admin Panel", path: "/admin",                   icon: Scale           },
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
      <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Scale size={18} color="#c9a84c" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.2px", fontFamily: "Georgia, serif" }}>VakilSummons</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(201,168,76,0.7)", marginTop: 1, letterSpacing: "0.08em", textTransform: "uppercase" }}>Advocate Portal</p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <p style={{ margin: "18px 20px 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>Navigation</p>

      {/* Menu */}
      <nav style={{ flex: 1, padding: "0 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path ||
                         (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "10px 13px", borderRadius: 10,
                background: active ? "rgba(201,168,76,0.15)" : "transparent",
                color: active ? "#c9a84c" : "rgba(255,255,255,0.5)",
                borderLeft: active ? "2px solid #c9a84c" : "2px solid transparent",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}>{item.name}</span>
                {active && <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.6 }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10,
          background: "rgba(255,255,255,0.04)", marginBottom: 8,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg,#c9a84c,#92400e)",
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
        <button onClick={() => { localStorage.removeItem("userInfo"); navigate("/"); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 13px", borderRadius: 10, cursor: "pointer",
            background: "transparent", border: "1px solid rgba(239,68,68,0.2)",
            color: "rgba(248,113,113,0.8)", fontSize: 13, fontWeight: 500,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#f87171"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.8)"; }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;