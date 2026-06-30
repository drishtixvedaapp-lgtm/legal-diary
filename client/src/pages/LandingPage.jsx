import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Shield, Bell, BookOpen, Users, ArrowRight, CheckCircle } from "lucide-react";

const LandingPage = () => {
  const navigate  = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const features = [
    { icon: BookOpen, title: "Case Diary",        desc: "Maintain detailed notes, documents and hearing outcomes for every case in one place." },
    { icon: Bell,     title: "Smart Reminders",   desc: "Automatic email alerts to clients the evening before and morning of every hearing." },
    { icon: Users,    title: "Client Management", desc: "Organised client profiles linked directly to their cases and documents." },
    { icon: Shield,   title: "Secure & Private",  desc: "JWT authentication with OTP verification. Each lawyer sees only their own data." },
  ];

  const stats = [
    { value: "2FA",    label: "OTP Security"       },
    { value: "Auto",   label: "Email Reminders"    },
    { value: "100%",   label: "Data Isolation"     },
    { value: "Live",   label: "Case Tracking"      },
  ];

  return (
    <div style={{
      minHeight: "100vh", fontFamily: "'Inter', sans-serif",
      background: "linear-gradient(160deg,#0a1628 0%,#0f2744 45%,#0a1c38 100%)",
      color: "#fff", overflowX: "hidden",
    }}>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,22,40,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 40px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
          }}>
            <Scale size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px" }}>Legal Diary</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/login")} style={{
            padding: "8px 20px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.15)",
            background: "transparent", color: "rgba(255,255,255,0.75)", fontSize: 14,
            fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >Sign In</button>
          <button onClick={() => navigate("/register")} style={{
            padding: "8px 20px", borderRadius: 9, border: "none",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.35)", fontFamily: "inherit",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)"; }}
          >Get Started</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "96px 40px 80px", textAlign: "center", maxWidth: 860, margin: "0 auto",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.3)",
          borderRadius: 99, padding: "6px 16px", marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd" }}>
            Advocate Case Management System
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          margin: "0 0 20px", fontSize: "clamp(36px,5vw,58px)",
          fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1px",
        }}>
          Manage Every Case
          <br />
          <span style={{
            background: "linear-gradient(135deg,#3b82f6,#60a5fa,#93c5fd)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            With Confidence
          </span>
        </h1>

        <p style={{
          margin: "0 auto 40px", fontSize: 18, lineHeight: 1.7,
          color: "rgba(255,255,255,0.55)", maxWidth: 600,
        }}>
          Legal Diary keeps your hearings, clients, documents and reminders in one secure place —
          so you can focus on winning cases, not chasing paperwork.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate("/register")} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
            fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 6px 24px rgba(37,99,235,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(37,99,235,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,99,235,0.4)"; }}
          >
            Start Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate("/login")} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 32px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.05)", color: "#fff",
            fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            Sign In to Dashboard
          </button>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 40px 72px" }}>
        <div style={{
          maxWidth: 780, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1,
          background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.15s",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: "28px 20px", textAlign: "center",
              background: "rgba(255,255,255,0.02)",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#60a5fa", letterSpacing: "-0.5px" }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section style={{
        padding: "0 40px 80px", maxWidth: 1100, margin: "0 auto",
        opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease 0.25s",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3b82f6" }}>
            Everything You Need
          </p>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.4px" }}>
            Built for Indian Advocates
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "28px 24px",
                transition: "border-color 0.15s, background 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)"; e.currentTarget.style.background = "rgba(37,99,235,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 18,
                  background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={20} color="#60a5fa" strokeWidth={1.8} />
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#fff" }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 40px 80px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3b82f6" }}>Simple Process</p>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: "-0.4px" }}>How It Works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24 }}>
          {[
            { step: "01", title: "Register & Verify", desc: "Create your lawyer account with email OTP verification." },
            { step: "02", title: "Add Clients & Cases", desc: "Add your clients and file new cases with all hearing details." },
            { step: "03", title: "Diary Every Hearing", desc: "Record outcomes, upload documents and write notes after each hearing." },
            { step: "04", title: "Auto Reminders Sent", desc: "Clients receive professional email reminders automatically." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", marginBottom: 16,
                background: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(37,99,235,0.05))",
                border: "1px solid rgba(37,99,235,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#60a5fa",
              }}>{item.step}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#fff" }}>{item.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section style={{ padding: "0 40px 80px" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(29,78,216,0.08))",
          border: "1px solid rgba(37,99,235,0.25)", borderRadius: 20, padding: "48px 40px",
        }}>
          <CheckCircle size={36} color="#60a5fa" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <h2 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.3px" }}>
            Ready to organise your practice?
          </h2>
          <p style={{ margin: "0 0 28px", fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
            Join Legal Diary today and never miss a hearing date again.
          </p>
          <button onClick={() => navigate("/register")} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 36px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 6px 24px rgba(37,99,235,0.4)",
            transition: "transform 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            Create Free Account <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 40px", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Scale size={16} color="#3b82f6" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>Legal Diary</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
          © {new Date().getFullYear()} Legal Diary — Advocate Case Management System
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
