import { useState, useEffect } from "react";

const AdminSettings = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const [copied, setCopied] = useState(false);

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const C = {
    surface: "rgba(255,255,255,0.06)",
    border:  "rgba(255,255,255,0.08)",
    text:    "#fff",
    muted:   "rgba(255,255,255,0.5)",
  };

  const Card = ({ title, children }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
      <p style={{ margin: "0 0 18px", fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: C.muted }}>{title}</p>
      {children}
    </div>
  );

  const Row = ({ label, value, badge }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13.5, color: C.muted }}>{label}</span>
      {badge
        ? <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 600,
                          padding: "3px 10px", borderRadius: 99, border: "1px solid #bbf7d0" }}>{value}</span>
        : <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>{value}</span>
      }
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
          Administration
        </p>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.4px" }}>
          System Settings
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
          Platform configuration and status overview.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>

        {/* System Info */}
        <Card title="System Information">
          <Row label="Application"     value="Legal Diary" />
          <Row label="Version"         value="1.0.0" />
          <Row label="Environment"     value="Production" badge />
          <Row label="Node.js Runtime" value="Express.js + MongoDB" />
          <Row label="Auth Method"     value="JWT + OTP (2FA)" />
        </Card>

        {/* Email / Notifications */}
        <Card title="Email & Notifications">
          <Row label="Email Service"      value="Gmail SMTP" />
          <Row label="Evening Reminder"   value="8:00 PM (day before)" />
          <Row label="Morning Reminder"   value="7:00 AM (day of hearing)" />
          <Row label="Duplicate Guard"    value="Active" badge />
          <Row label="HTML Templates"     value="Enabled" badge />
        </Card>

        {/* Logged-in Admin */}
        <Card title="Admin Account">
          <Row label="Name"   value={userInfo.name  || "—"} />
          <Row label="Email"  value={userInfo.email || "—"} />
          <Row label="Role"   value="Admin" badge />
          <Row label="Status" value="Active" badge />
        </Card>

        {/* Security */}
        <Card title="Security Configuration">
          <Row label="Password Hashing" value="bcrypt (12 rounds)" />
          <Row label="Token Expiry"     value="30 days" />
          <Row label="OTP Expiry"       value="10 minutes" />
          <Row label="CORS"             value="Origin-restricted" badge />
          <Row label="File Upload Limit" value="10 MB / PDF·DOC·IMG only" />
        </Card>

      </div>

      {/* Deployment reminder */}
      <div style={{ marginTop: 24, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.25)",
                    borderRadius: 14, padding: "18px 22px" }}>
        <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#93c5fd" }}>
          📋 Before deploying to production
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 2 }}>
          <li>Update <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>CLIENT_URL</code> in server <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>.env</code> to your live frontend URL</li>
          <li>Update <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>VITE_API_URL</code> in client <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>.env.production</code> to your live backend URL</li>
          <li>Ensure the <code style={{ background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>uploads/</code> folder exists on your server and is writable</li>
          <li>Change the Gmail App Password if you rotate it</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;
