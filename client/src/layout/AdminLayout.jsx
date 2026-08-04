import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Briefcase, Bell, Settings, LogOut, Scale, ChevronRight, Contact, CalendarDays, Archive, UserCircle } from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const menu = [
    { name: "Dashboard",      path: "/admin",               icon: LayoutDashboard },
    { name: "Users",          path: "/admin/users",         icon: Users           },
    { name: "Clients",        path: "/admin/clients",       icon: Contact         },
    { name: "Cases",          path: "/admin/cases",         icon: Briefcase       },
    { name: "Calendar",       path: "/admin/calendar",      icon: CalendarDays    },
    { name: "History",        path: "/admin/history",       icon: Archive         },
    { name: "Notifications",  path: "/admin/notifications", icon: Bell            },
    { name: "My Profile",     path: "/admin/profile",       icon: UserCircle      },
    { name: "Settings",       path: "/admin/settings",      icon: Settings        },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b1628", fontFamily: "'Inter',sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0, background: "#0f1e35",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Scale size={20} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>VakilSummons</p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <p style={{ margin: "20px 24px 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
          Administration
        </p>

        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {menu.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 10,
                  background: active ? "rgba(37,99,235,0.85)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "all 0.15s", cursor: "pointer",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 400 }}>{item.name}</span>
                  {active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={() => { localStorage.removeItem("userInfo"); navigate("/login"); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10, cursor: "pointer",
              background: "transparent", border: "1px solid rgba(239,68,68,0.25)",
              color: "rgba(248,113,113,0.8)", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.8)"; }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, overflow: "auto", padding: "36px 40px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
