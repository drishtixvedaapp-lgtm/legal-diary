import { useEffect, useState } from "react";
import {
  getClients,
  createClient,
  deleteClient,
} from "../services/clientService";
 
// ── Avatar initials helper ──────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
 
// Deterministic hue from name string
const avatarHue = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
};
 
// ── Sub-components ──────────────────────────────────────────────────────────
const Avatar = ({ name, size = 44 }) => {
  const hue = avatarHue(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},55%,92%)`,
        color: `hsl(${hue},55%,35%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
        border: `2px solid hsl(${hue},55%,82%)`,
        letterSpacing: "-0.02em",
      }}
    >
      {getInitials(name)}
    </div>
  );
};
 
const InputField = ({ label, icon, type = "text", name, placeholder, value, onChange, required, colSpan, as }) => {
  const Tag = as ?? "input";
  return (
    <div style={{ gridColumn: colSpan === 2 ? "1 / -1" : undefined, display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
        {required && <span style={{ color: "#e11d48", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16, pointerEvents: "none", display: Tag === "textarea" ? "none" : "block" }}>
            {icon}
          </span>
        )}
        <Tag
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={Tag === "textarea" ? 3 : undefined}
          style={{
            width: "100%",
            boxSizing: "border-box",
            paddingTop: Tag === "textarea" ? 12 : 0,
            paddingBottom: Tag === "textarea" ? 12 : 0,
            paddingLeft: icon && Tag !== "textarea" ? 38 : 14,
            paddingRight: 14,
            height: Tag === "textarea" ? "auto" : 44,
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            fontSize: 14,
            color: "#1e293b",
            background: "#f8fafc",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
            resize: Tag === "textarea" ? "vertical" : undefined,
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#3b82f6";
            e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
            e.target.style.background = "#fff";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e2e8f0";
            e.target.style.boxShadow = "none";
            e.target.style.background = "#f8fafc";
          }}
        />
      </div>
    </div>
  );
};
 
const MetaItem = ({ icon, text }) =>
  text ? (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, color: "#64748b" }}>
      <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</span>
    </div>
  ) : null;
 
// ── Main Component ──────────────────────────────────────────────────────────
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
 
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    occupation: "",
    notes: "",
  });
 
  const fetchClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error(error);
    }
  };
 
  useEffect(() => {
    fetchClients();
  }, []);
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createClient(formData);
      setFormData({ name: "", phone: "", email: "", address: "", occupation: "", notes: "" });
      fetchClients();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };
 
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteClient(id);
      fetchClients();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };
 
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .client-card { animation: fadeUp 0.25s ease both; }
        .delete-btn:hover { background: #fef2f2 !important; border-color: #fca5a5 !important; color: #dc2626 !important; }
        .delete-btn:active { transform: scale(0.97); }
        .submit-btn:hover { background: #2563eb !important; }
        .submit-btn:active { transform: scale(0.98); }
      `}</style>
 
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 64px" }}>
 
        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg,#1e40af,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}>👥</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em" }}>
              Client Management
            </h1>
          </div>
          <p style={{ margin: "0 0 0 52px", fontSize: 14, color: "#64748b" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} on record
          </p>
        </div>
 
        {/* ── ADD CLIENT FORM ── */}
        <div style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          padding: "28px 28px 24px",
          marginBottom: 32,
          boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Add New Client</span>
            <div style={{ flex: 1, height: 1, background: "#f1f5f9", marginLeft: 8 }} />
          </div>
 
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }}>
              <InputField label="Full Name" icon="👤" name="name" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required />
              <InputField label="Phone" icon="📞" name="phone" placeholder="+1 555 000 0000" value={formData.phone} onChange={handleChange} required />
              <InputField label="Email" icon="✉️" type="email" name="email" placeholder="jane@example.com" value={formData.email} onChange={handleChange} />
              <InputField label="Occupation" icon="💼" name="occupation" placeholder="Engineer" value={formData.occupation} onChange={handleChange} />
              <InputField label="Address" icon="📍" name="address" placeholder="123 Main St, City" value={formData.address} onChange={handleChange} colSpan={2} />
              <InputField label="Notes" name="notes" as="textarea" placeholder="Any additional notes…" value={formData.notes} onChange={handleChange} colSpan={2} />
            </div>
 
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: submitting ? "#93c5fd" : "#3b82f6",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "11px 24px", fontSize: 14, fontWeight: 600,
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "background 0.15s, transform 0.1s",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ fontSize: 16 }}>＋</span>
                {submitting ? "Saving…" : "Add Client"}
              </button>
            </div>
          </form>
        </div>
 
        {/* ── CLIENT LIST ── */}
        {clients.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0",
            padding: "52px 24px", textAlign: "center",
            boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗂️</div>
            <p style={{ margin: 0, fontWeight: 600, color: "#475569", fontSize: 15 }}>No clients yet</p>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>Add your first client using the form above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {clients.map((client, idx) => (
              <div
                key={client._id}
                className="client-card"
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  padding: "20px 22px",
                  boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                  animationDelay: `${idx * 0.04}s`,
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.1)";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.05)";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
 
                  {/* Avatar */}
                  <Avatar name={client.name} />
 
                  {/* Main Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                      <div style={{ minWidth: 0 }}>
                        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {client.name}
                        </h2>
                        {client.occupation && (
                          <span style={{
                            display: "inline-block", marginTop: 3,
                            fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em",
                            textTransform: "uppercase", color: "#3b82f6",
                            background: "#eff6ff", padding: "2px 8px", borderRadius: 6,
                          }}>
                            {client.occupation}
                          </span>
                        )}
                      </div>
 
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="delete-btn"
                        disabled={deletingId === client._id}
                        title="Delete client"
                        style={{
                          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6,
                          background: "transparent", border: "1.5px solid #e2e8f0",
                          borderRadius: 8, padding: "6px 12px",
                          fontSize: 12.5, fontWeight: 600, color: "#94a3b8",
                          cursor: deletingId === client._id ? "not-allowed" : "pointer",
                          transition: "all 0.15s", fontFamily: "inherit",
                        }}
                      >
                        <span style={{ fontSize: 14 }}>🗑</span>
                        {deletingId === client._id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
 
                    {/* Meta row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "5px 16px", marginTop: 8 }}>
                      <MetaItem icon="📞" text={client.phone} />
                      <MetaItem icon="✉️" text={client.email} />
                      <MetaItem icon="📍" text={client.address} />
                    </div>
 
                    {/* Notes */}
                    {client.notes && (
                      <div style={{
                        marginTop: 12, padding: "10px 14px",
                        background: "#f8fafc", borderRadius: 8,
                        borderLeft: "3px solid #cbd5e1",
                        fontSize: 13, color: "#64748b", lineHeight: 1.55,
                      }}>
                        {client.notes}
                      </div>
                    )}
                  </div>
 
                </div>
              </div>
            ))}
          </div>
        )}
 
      </div>
    </div>
  );
};
 
export default Clients;