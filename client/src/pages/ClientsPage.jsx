import { useEffect, useState } from "react";
import { getClients, updateClient, deleteClient } from "../services/clientService";
import { getCases } from "../services/caseService";
import useIsMobile from "../hooks/useIsMobile";

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

const avatarHue = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
};

const Avatar = ({ name, size = 40 }) => {
  const hue = avatarHue(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},55%,92%)`, color: `hsl(${hue},55%,32%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.35, border: `2px solid hsl(${hue},55%,80%)`,
    }}>
      {getInitials(name)}
    </div>
  );
};

// ── Edit Client Modal ────────────────────────────────────────────────────────
const EditClientModal = ({ client, onClose, onSaved }) => {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name:       client.name       || "",
    phone:      client.phone      || "",
    phone2:     client.phone2     || "",
    email:      client.email      || "",
    occupation: client.occupation || "",
    address:    client.address    || "",
    notes:      client.notes      || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim())  return setError("Name is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    setError("");
    setSaving(true);
    try {
      const updated = await updateClient(client._id, form);
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update client.");
    } finally {
      setSaving(false);
    }
  };

  const fi = (name, placeholder, type = "text", required = false, as) => {
    const Tag = as ?? "input";
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"#64748b" }}>
          {placeholder}{required && <span style={{ color:"#ef4444" }}> *</span>}
        </label>
        <Tag
          name={name} type={Tag === "input" ? type : undefined} placeholder={placeholder}
          value={form[name]} onChange={handle} required={required}
          rows={Tag === "textarea" ? 3 : undefined}
          style={{ padding:"9px 12px", borderRadius:9, border:"1.5px solid #e2e8f0", fontSize:14, background:"#f8fafc", color:"#0f172a", outline:"none", fontFamily:"inherit", resize: Tag === "textarea" ? "vertical" : undefined }}
          onFocus={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.background="#fff"; }}
          onBlur={e  => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#f8fafc"; }}
        />
      </div>
    );
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding: isMobile ? 20 : 28, width:"100%", maxWidth:460, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:"#0f172a" }}>✏️ Edit Client</h3>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 }}>
            {fi("name",       "Full Name",   "text",  true)}
            {fi("phone",      "Phone",       "text",  true)}
            {fi("email",      "Email",       "email", false)}
            {fi("phone2",     "Second Phone (optional)", "text", false)}
            {fi("occupation", "Occupation",  "text",  false)}
          </div>
          {fi("address", "Address", "text", false)}
          {fi("notes", "Notes", "text", false, "textarea")}
          {error && <p style={{ margin:0, fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{error}</p>}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background: saving ? "#93c5fd" : "#2563eb", color:"#fff", fontSize:14, fontWeight:700, cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ClientsPage = () => {
  const isMobile = useIsMobile();
  const [clients,      setClients]      = useState([]);
  const [cases,        setCases]        = useState([]);
  const [search,       setSearch]       = useState("");
  const [deletingId,   setDeletingId]   = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [toast,        setToast]        = useState(null); // { type: "success" | "error", message }

  const fetchAll = async () => {
    try { setClients(await getClients()); } catch(e){ console.error(e); }
    try { setCases(await getCases());     } catch(e){ console.error(e); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Auto-dismiss the toast after a few seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client and ALL their cases? This cannot be undone.")) return;
    setDeletingId(id);
    try { await deleteClient(id); await fetchAll(); }
    catch(e) { alert("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const handleClientSaved = async (updated) => {
    await fetchAll();
    setToast({ type: "success", message: `${updated?.name || "Client"} updated successfully.` });
  };

  // Count how many cases each client has
  const caseCountFor = (clientId) =>
    cases.filter(c => c.client?._id === clientId || c.client === clientId).length;

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", padding: isMobile ? "16px 14px" : "28px 32px", fontFamily:"'Inter',sans-serif" }}>

      {/* Edit Client Modal */}
      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSaved={handleClientSaved}
        />
      )}

      {/* Success / error toast */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:1100,
          background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${toast.type === "success" ? "#a7f3d0" : "#fecaca"}`,
          color: toast.type === "success" ? "#047857" : "#b91c1c",
          borderRadius:10, padding:"12px 18px", fontSize:13.5, fontWeight:600,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)", display:"flex", alignItems:"center", gap:8,
          maxWidth: 360,
        }}>
          <span style={{ fontSize:16 }}>{toast.type === "success" ? "✅" : "⚠️"}</span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"flex-end", justifyContent:"space-between", gap:12, marginBottom:24 }}>
        <div>
          <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#64748b", marginBottom:4 }}>Reference List</p>
          <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:"-0.4px" }}>Clients</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"#64748b" }}>
            {clients.length} client{clients.length !== 1 ? "s" : ""} — to add a client, go to <strong>Cases → Add Case</strong>
          </p>
        </div>
        <div style={{ background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
          <p style={{ margin:0, fontSize:22, fontWeight:800, color:"#1d4ed8" }}>{clients.length}</p>
          <p style={{ margin:0, fontSize:11, color:"#3b82f6", fontWeight:600 }}>Total Clients</p>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:12, padding:"12px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12, fontSize:13, color:"#92400e" }}>
        <span style={{ fontSize:18 }}>💡</span>
        <span>Clients are added automatically when you create a new case. You can also add clients quickly from the <strong>Cases page</strong> using the quick-add button.</span>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div style={{ position:"relative", maxWidth:420, marginBottom:20 }}>
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", fontSize:16, pointerEvents:"none" }}>🔍</span>
          <input
            placeholder="Search by name, phone or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", boxSizing:"border-box", paddingLeft:38, paddingRight:14, height:42, border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#fff", color:"#0f172a", outline:"none", fontFamily:"inherit" }}
            onFocus={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)"; }}
            onBlur={e  => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.boxShadow="none"; }}
          />
        </div>
      )}

      {/* Empty state */}
      {clients.length === 0 && (
        <div style={{ background:"#fff", borderRadius:16, border:"1px dashed #e2e8f0", padding:"60px 24px", textAlign:"center" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
          <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#475569" }}>No clients yet</p>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"#94a3b8" }}>Go to <strong>Cases</strong> and add a new case — you can add a client there directly.</p>
        </div>
      )}

      {/* Client list — stacked cards on mobile, avoids the 5-column table overflowing */}
      {filtered.length > 0 && isMobile && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map(client => {
            const count = caseCountFor(client._id);
            return (
              <div key={client._id} style={{ background:"#fff", borderRadius:14, border:"1px solid #e2e8f0", padding:16, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <Avatar name={client.name} />
                  <div style={{ minWidth:0, flex:1 }}>
                    <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#0f172a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{client.name}</p>
                    {client.occupation && <p style={{ margin:"2px 0 0", fontSize:11.5, color:"#3b82f6", fontWeight:600 }}>{client.occupation}</p>}
                  </div>
                  <span style={{
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    width:28, height:28, borderRadius:8, flexShrink:0,
                    background: count > 0 ? "#eff6ff" : "#f1f5f9",
                    color: count > 0 ? "#1d4ed8" : "#94a3b8",
                    fontSize:13, fontWeight:700,
                  }}>
                    {count}
                  </span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:14, fontSize:13.5, color:"#475569" }}>
                  <span>📞 {client.phone || "—"}{client.phone2 ? `, ${client.phone2}` : ""}</span>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>✉️ {client.email || "—"}</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setEditingClient(client)} style={{
                    flex:1, minHeight:44, background:"transparent", border:"1px solid #bfdbfe", borderRadius:8,
                    color:"#1d4ed8", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                  }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(client._id)} disabled={deletingId === client._id} style={{
                    flex:1, minHeight:44, background:"transparent", border:"1px solid #fecaca", borderRadius:8,
                    color:"#ef4444", fontSize:13, fontWeight:600,
                    cursor: deletingId===client._id ? "not-allowed" : "pointer",
                    opacity: deletingId===client._id ? 0.5 : 1, fontFamily:"inherit",
                  }}>
                    {deletingId===client._id ? "…" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client table — desktop only */}
      {filtered.length > 0 && !isMobile && (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          {/* Table header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1.5fr 1.5fr 1fr 168px", gap:0, padding:"10px 20px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0" }}>
            {["Client","Phone","Email","Cases",""].map(h => (
              <span key={h} style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748b" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((client, i) => {
            const count = caseCountFor(client._id);
            return (
              <div key={client._id} style={{
                display:"grid", gridTemplateColumns:"2fr 1.5fr 1.5fr 1fr 168px",
                alignItems:"center", padding:"14px 20px",
                background: i % 2 === 0 ? "#fff" : "#f8fafc",
                borderBottom:"1px solid #f1f5f9",
                transition:"background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background="#f0f9ff"}
                onMouseLeave={e => e.currentTarget.style.background= i%2===0?"#fff":"#f8fafc"}
              >
                {/* Name + avatar */}
                <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                  <Avatar name={client.name} />
                  <div style={{ minWidth:0 }}>
                    <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#0f172a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{client.name}</p>
                    {client.occupation && <p style={{ margin:"2px 0 0", fontSize:11.5, color:"#3b82f6", fontWeight:600 }}>{client.occupation}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <span style={{ fontSize:13.5, color:"#475569", display:"block" }}>{client.phone || "—"}</span>
                  {client.phone2 && (
                    <span style={{ fontSize:12, color:"#94a3b8", display:"block" }}>{client.phone2}</span>
                  )}
                </div>

                {/* Email */}
                <span style={{ fontSize:13, color:"#475569", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{client.email || "—"}</span>

                {/* Case count */}
                <span style={{
                  display:"inline-flex", alignItems:"center", justifyContent:"center",
                  width:28, height:28, borderRadius:8,
                  background: count > 0 ? "#eff6ff" : "#f1f5f9",
                  color: count > 0 ? "#1d4ed8" : "#94a3b8",
                  fontSize:13, fontWeight:700,
                }}>
                  {count}
                </span>

                {/* Edit + Delete */}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setEditingClient(client)} style={{
                    background:"transparent", border:"1px solid #bfdbfe", borderRadius:8,
                    color:"#1d4ed8", fontSize:12, fontWeight:600, padding:"5px 10px",
                    cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background="#eff6ff"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleDelete(client._id)} disabled={deletingId === client._id} style={{
                    background:"transparent", border:"1px solid #fecaca", borderRadius:8,
                    color:"#ef4444", fontSize:12, fontWeight:600, padding:"5px 10px",
                    cursor: deletingId===client._id ? "not-allowed" : "pointer",
                    opacity: deletingId===client._id ? 0.5 : 1, fontFamily:"inherit",
                    transition:"all 0.15s",
                  }}
                    onMouseEnter={e => { if(deletingId!==client._id) e.currentTarget.style.background="#fef2f2"; }}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    {deletingId===client._id ? "…" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No search results */}
      {clients.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:40, color:"#94a3b8", fontSize:14 }}>
          No clients match "<strong>{search}</strong>"
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
