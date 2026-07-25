import { useEffect, useState } from "react";
import { getCases, createCase, updateCase, deleteCase } from "../services/caseService";
import { createReminder } from "../services/notificationService";
import { useNavigate, useLocation } from "react-router-dom";
import { getClients, createClient } from "../services/clientService";

// Case prefix options
const casePrefixes = ["A","FA","RP","CC","AEA","WP","OS","CS","CRP","EP","AS","MA","SA","IA","Other"];

// Forum options
const forums = [
  "District Consumer Forum",
  "State Consumer Commission",
  "National Consumer Commission (NCDRC)",
  "High Court",
  "Supreme Court",
  "District Court",
  "Sessions Court",
  "Family Court",
  "Labour Court",
  "Tribunal",
  "Other",
];

const caseTypes = ["Civil","Criminal","Constitutional / Writ","Family","Consumer","Labour / Employment","Taxation","Revenue / Land","Commercial"];
const caseTypeIcons = { "Civil":"⚖️","Criminal":"🚔","Constitutional / Writ":"📜","Family":"👨‍👩‍👧","Consumer":"🛒","Labour / Employment":"👷","Taxation":"💰","Revenue / Land":"🏠","Commercial":"🏢" };

const statusConfig = {
  "Active":  { bg:"#dcfce7", color:"#15803d", dot:"#16a34a" },
  "Pending": { bg:"#fef9c3", color:"#854d0e", dot:"#ca8a04" },
  "Closed":  { bg:"#f1f5f9", color:"#475569", dot:"#94a3b8" },
};

// ── Default form ──────────────────────────────────────────────────────────────
const defaultForm = {
  casePrefix:        "A",
  caseNumber:        "",
  caseType:          "Civil",
  forum:             "District Court",
  courtName:         "",
  lawyerRepresents:  "Appellant / Petitioner / Complainant",
  client:            "",
  ourParties:        [],
  oppositeParties:   [{ name: "", address: "" }],
  oppositeCounsel:   "",
  caseTitle:         "",
  nextHearing:       "",
  hearingTime:       "",
  stage:             "",
  whatsappGroupId:   "",
  status:            "Active",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputStyle = (extra = {}) => ({
  width:"100%", padding:"10px 12px", borderRadius:9, fontSize:14,
  border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#0f172a",
  outline:"none", fontFamily:"inherit", boxSizing:"border-box", ...extra,
});

const focusHandlers = {
  onFocus: e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.background="#fff"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)"; },
  onBlur:  e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.boxShadow="none"; },
};

const FieldLabel = ({ children }) => (
  <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748b" }}>{children}</p>
);

const FormField = ({ label, children, colSpan }) => (
  <div style={{ gridColumn: colSpan === 2 ? "1 / -1" : undefined }}>
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? statusConfig["Active"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, border:`1px solid ${cfg.dot}33` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }} />{status}
    </span>
  );
};

const CaseTypeBadge = ({ caseType }) => (
  <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"#f1f5f9", color:"#475569", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, border:"1px solid #e2e8f0" }}>
    {caseTypeIcons[caseType]} {caseType}
  </span>
);

const RepresentsBadge = ({ side }) => {
  const isAppellant = side?.includes("Appellant");
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, background: isAppellant ? "#eff6ff" : "#fdf4ff", color: isAppellant ? "#1d4ed8" : "#7c3aed", fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, border:`1px solid ${isAppellant ? "#bfdbfe" : "#e9d5ff"}` }}>
      {isAppellant ? "⬆ Appellant" : "⬇ Respondent"}
    </span>
  );
};

// ── Party editor ──────────────────────────────────────────────────────────────
const PartyEditor = ({ label, parties, onChange }) => {
  const add    = () => onChange([...parties, { name:"", address:"" }]);
  const remove = (i) => onChange(parties.filter((_,idx) => idx !== i));
  const update = (i, field, val) => {
    const next = [...parties];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
        <FieldLabel>{label}</FieldLabel>
        <button type="button" onClick={add} style={{ fontSize:12, fontWeight:600, color:"#2563eb", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:7, padding:"3px 10px", cursor:"pointer" }}>
          + Add
        </button>
      </div>
      {parties.length === 0 && (
        <p style={{ fontSize:12.5, color:"#94a3b8", margin:0, fontStyle:"italic" }}>No additional parties added.</p>
      )}
      {parties.map((p, i) => (
        <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:8, marginBottom:8, alignItems:"start" }}>
          <input placeholder={`Party ${i+1} name`} value={p.name}
            onChange={e => update(i,"name",e.target.value)}
            style={inputStyle({ fontSize:13 })} {...focusHandlers} />
          <input placeholder="Address (optional)" value={p.address}
            onChange={e => update(i,"address",e.target.value)}
            style={inputStyle({ fontSize:13 })} {...focusHandlers} />
          <button type="button" onClick={() => remove(i)} style={{ background:"#fff1f2", border:"1px solid #fecdd3", borderRadius:7, color:"#be123c", width:34, height:38, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};


// ── Quick Add Client Modal ────────────────────────────────────────────────────
const QuickAddClientModal = ({ onClose, onAdded }) => {
  const [form, setForm]       = useState({ name:"", phone:"", phone2:"", email:"", occupation:"", address:"" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const handle = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.phone.trim()) return setError("Phone is required.");
    setSaving(true);
    try {
      const created = await createClient(form);
      onAdded(created);
      onClose();
    } catch(err) {
      setError(err.response?.data?.message || "Failed to add client.");
    } finally { setSaving(false); }
  };

  const fi = (name, placeholder, type="text", required=false) => (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"#64748b" }}>
        {placeholder}{required && <span style={{ color:"#ef4444" }}> *</span>}
      </label>
      <input name={name} type={type} placeholder={placeholder} value={form[name]} onChange={handle}
        required={required}
        style={{ padding:"9px 12px", borderRadius:9, border:"1.5px solid #e2e8f0", fontSize:14, background:"#f8fafc", color:"#0f172a", outline:"none", fontFamily:"inherit" }}
        onFocus={e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.background="#fff"; }}
        onBlur={e  => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#f8fafc"; }}
      />
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:460, boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ margin:0, fontSize:18, fontWeight:700, color:"#0f172a" }}>➕ Quick Add Client</h3>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:18, color:"#64748b", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {fi("name",       "Full Name",   "text",  true)}
            {fi("phone",      "Phone",       "text",  true)}
            {fi("email",      "Email",       "email", false)}
            {fi("phone2",     "Second Phone (optional)", "text", false)}
            {fi("occupation", "Occupation",  "text",  false)}
          </div>
          {fi("address", "Address", "text", false)}
          {error && <p style={{ margin:0, fontSize:13, color:"#ef4444", background:"#fef2f2", padding:"8px 12px", borderRadius:8 }}>{error}</p>}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex:2, padding:"10px", borderRadius:10, border:"none", background: saving?"#93c5fd":"#2563eb", color:"#fff", fontSize:14, fontWeight:700, cursor: saving?"not-allowed":"pointer", fontFamily:"inherit" }}>
              {saving ? "Saving…" : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Cases = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  const [editingCase,     setEditingCase]     = useState(null);
  const [search,          setSearch]          = useState("");
  const [statusFilter,    setStatusFilter]    = useState("All");
  const [caseTypeFilter,  setCaseTypeFilter]  = useState("All");
  const [cases,           setCases]           = useState([]);
  const [clients,         setClients]         = useState([]);
  const [deletingId,      setDeletingId]      = useState(null);
  const [submitting,      setSubmitting]      = useState(false);
  const [formData,        setFormData]        = useState(defaultForm);
  const [showClientModal, setShowClientModal] = useState(false);

  // Pre-fill date from calendar
  useEffect(() => {
    if (location.state?.selectedDate) {
      const date = new Date(location.state.selectedDate).toISOString().split("T")[0];
      setFormData(prev => ({ ...prev, nextHearing: date }));
    }
  }, [location]);

  const fetchAll = async () => {
    try { setCases(await getCases()); }   catch(e){ console.error(e); }
    try { setClients(await getClients()); } catch(e){ console.error(e); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleClientAdded = (newClient) => {
    setClients(prev => [newClient, ...prev]);
    setFormData(prev => ({ ...prev, client: newClient._id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "caseType") {
      setFormData(prev => ({ ...prev, caseType: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => setFormData(defaultForm);

  const handleEdit = (c) => {
    setEditingCase(c);
    setFormData({
      casePrefix:       c.casePrefix       || "A",
      caseNumber:       c.caseNumber       || "",
      caseType:         c.caseType         || "Civil",
      forum:            c.forum            || "District Court",
      courtName:        c.courtName        || "",
      lawyerRepresents: c.lawyerRepresents || "Appellant / Petitioner / Complainant",
      client:           c.client?._id      || "",
      ourParties:       c.ourParties       || [],
      oppositeParties:  c.oppositeParties?.length ? c.oppositeParties : [{ name:"", address:"" }],
      oppositeCounsel:  c.oppositeCounsel  || "",
      caseTitle:        c.caseTitle        || "",
      nextHearing:      c.nextHearing ? new Date(c.nextHearing).toISOString().split("T")[0] : "",
      hearingTime:      c.hearingTime      || "",
      stage:            c.stage            || "",
      whatsappGroupId:  c.whatsappGroupId  || "",
      status:           c.status           || "Active",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this case and all its data?")) return;
    setDeletingId(id);
    try { await deleteCase(id); await fetchAll(); } catch(e){ alert("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate: must have either a client OR a group ID
    if (!formData.client && !formData.whatsappGroupId.trim()) {
      alert("Please select a client OR enter a WhatsApp Group ID.");
      return;
    }

    setSubmitting(true);
    // Clean up empty opposite parties
    const cleaned = {
      ...formData,
      client:          formData.client || null,
      oppositeParties: formData.oppositeParties.filter(p => p.name.trim()),
      ourParties:      formData.ourParties.filter(p => p.name.trim()),
    };
    try {
      if (editingCase) {
        await updateCase(editingCase._id, cleaned);
        setEditingCase(null);
      } else {
        await createCase(cleaned);
      }
      resetForm();
      await fetchAll();
    } catch(e) {
      alert(e.response?.data?.message || "Failed to save case");
    } finally { setSubmitting(false); }
  };

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.caseTitle?.toLowerCase().includes(q) || c.caseNumber?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchType   = caseTypeFilter === "All" || c.caseType === caseTypeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 28px 60px" }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ marginBottom:24 }}>
          <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#64748b", marginBottom:4 }}>Case Management</p>
          <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:"-0.4px" }}>
            {editingCase ? `Editing: ${editingCase.caseTitle}` : "Cases"}
          </h1>
        </div>

        {/* Quick Add Client Modal */}
        {showClientModal && (
          <QuickAddClientModal
            onClose={() => setShowClientModal(false)}
            onAdded={handleClientAdded}
          />
        )}

        {/* ── FORM ── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", padding:"24px 28px", marginBottom:28, boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <h2 style={{ margin:"0 0 20px", fontSize:16, fontWeight:700, color:"#0f172a" }}>
            {editingCase ? "✏️ Edit Case" : "➕ Add New Case"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

              {/* Case Type */}
              <div style={{ gridColumn:"1 / -1" }}>
                <FieldLabel>Case Type</FieldLabel>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {caseTypes.map(t => {
                    const sel = formData.caseType === t;
                    return (
                      <label key={t} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 14px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600, border: sel ? "2px solid #2563eb" : "1.5px solid #e2e8f0", background: sel ? "#eff6ff" : "#f8fafc", color: sel ? "#1d4ed8" : "#64748b", transition:"all 0.15s" }}>
                        <input type="radio" name="caseType" value={t} checked={sel} onChange={handleChange} style={{ display:"none" }} />
                        {caseTypeIcons[t]} {t}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Case Prefix + Number */}
              <FormField label="Case Prefix / Type">
                <select name="casePrefix" value={formData.casePrefix} onChange={handleChange} style={inputStyle()} {...focusHandlers}>
                  {casePrefixes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>

              <FormField label="Case Number">
                <input name="caseNumber" placeholder="e.g. 4/2026  or  443/2023" value={formData.caseNumber} onChange={handleChange} required style={inputStyle()} {...focusHandlers} />
              </FormField>

              {/* Case Title */}
              <FormField label="Case Title (Parties — Vs —)" colSpan={2}>
                <input name="caseTitle" placeholder="e.g. Aman Rajpurohit Vs Varalakshmi Automobiles Pvt. Ltd. & Others" value={formData.caseTitle} onChange={handleChange} required style={inputStyle()} {...focusHandlers} />
              </FormField>

              {/* Forum + Court */}
              <FormField label="Forum / Commission">
                <select name="forum" value={formData.forum} onChange={handleChange} style={inputStyle()} {...focusHandlers}>
                  {forums.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </FormField>

              <FormField label="Court Name / Location">
                <input name="courtName" placeholder="e.g. A.P. State Consumer Commission, Vijayawada" value={formData.courtName} onChange={handleChange} required style={inputStyle()} {...focusHandlers} />
              </FormField>

              {/* Which side does lawyer represent */}
              <FormField label="Lawyer Represents" colSpan={2}>
                <div style={{ display:"flex", gap:10 }}>
                  {["Appellant / Petitioner / Complainant", "Respondent / Defendant / Opposite Party"].map(side => {
                    const sel = formData.lawyerRepresents === side;
                    const isApp = side.includes("Appellant");
                    return (
                      <label key={side} style={{ flex:1, display:"flex", alignItems:"center", gap:8, padding:"12px 16px", borderRadius:10, cursor:"pointer", fontSize:13.5, fontWeight:600, border: sel ? `2px solid ${isApp ? "#2563eb" : "#7c3aed"}` : "1.5px solid #e2e8f0", background: sel ? (isApp ? "#eff6ff" : "#faf5ff") : "#f8fafc", color: sel ? (isApp ? "#1d4ed8" : "#7c3aed") : "#64748b", transition:"all 0.15s" }}>
                        <input type="radio" name="lawyerRepresents" value={side} checked={sel} onChange={handleChange} style={{ display:"none" }} />
                        <span style={{ fontSize:18 }}>{isApp ? "⬆️" : "⬇️"}</span>
                        {side}
                      </label>
                    );
                  })}
                </div>
              </FormField>

              {/* Our client (main party) */}
              <FormField label={formData.lawyerRepresents.includes("Appellant") ? "Appellant / Complainant (Main Client)" : "Respondent / Defendant (Main Client)"} hint="Optional if WhatsApp Group ID is provided">
                <div style={{ display:"flex", gap:8 }}>
                  <select name="client" value={formData.client} onChange={handleChange} style={{ ...inputStyle(), flex:1 }} {...focusHandlers}>
                    <option value="">— Select Client —</option>
                    {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => setShowClientModal(true)} title="Add new client" style={{ padding:"0 16px", borderRadius:9, border:"1.5px solid #bfdbfe", background:"#eff6ff", color:"#1d4ed8", fontWeight:700, fontSize:13, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
                    + New Client
                  </button>
                </div>
              </FormField>

              {/* Opposite counsel */}
              <FormField label="Opposite Counsel (Advocate Name)">
                <input name="oppositeCounsel" placeholder="e.g. M/s. T. Bhair Raju" value={formData.oppositeCounsel} onChange={handleChange} style={inputStyle()} {...focusHandlers} />
              </FormField>

              {/* Additional parties on OUR side */}
              <div style={{ gridColumn:"1 / -1" }}>
                <PartyEditor
                  label={`Additional ${formData.lawyerRepresents.includes("Appellant") ? "Appellants / Co-Complainants" : "Co-Respondents"} (our side)`}
                  parties={formData.ourParties}
                  onChange={val => setFormData(prev => ({ ...prev, ourParties: val }))}
                />
              </div>

              {/* Opposite parties */}
              <div style={{ gridColumn:"1 / -1" }}>
                <PartyEditor
                  label={`${formData.lawyerRepresents.includes("Appellant") ? "Respondents / Opposite Parties" : "Appellants / Complainants"} (opposite side)`}
                  parties={formData.oppositeParties}
                  onChange={val => setFormData(prev => ({ ...prev, oppositeParties: val }))}
                />
              </div>

              {/* Hearing details */}
              <FormField label="Next Hearing Date">
                <input name="nextHearing" type="date" value={formData.nextHearing} onChange={handleChange} required style={inputStyle()} {...focusHandlers} />
              </FormField>

              <FormField label="Hearing Time">
                <input name="hearingTime" type="text" placeholder="e.g. 10:30 AM" value={formData.hearingTime} onChange={handleChange} style={inputStyle()} {...focusHandlers} />
              </FormField>

              {/* Status */}
              <FormField label="Stage / Proceeding (optional)" colSpan={2}>
                <input name="stage" type="text"
                  placeholder="e.g. Arguments, Evidence, Counter Filing, Stay Application..."
                  value={formData.stage} onChange={handleChange}
                  style={inputStyle()} {...focusHandlers} />
              </FormField>

              <FormField label="WhatsApp Group ID (optional)" colSpan={2}>
                <input name="whatsappGroupId" type="text"
                  placeholder="e.g. 120363XXXXXXXXXX@g.us — run get-groups.js to find your group ID"
                  value={formData.whatsappGroupId} onChange={handleChange}
                  style={inputStyle()} {...focusHandlers} />
                <p style={{ margin:"4px 0 0", fontSize:11, color:"#64748b" }}>
                  If set, hearing reminders will also be sent to this WhatsApp group automatically
                </p>
              </FormField>

              <FormField label="Status" colSpan={2}>
                <div style={{ display:"flex", gap:10 }}>
                  {["Active","Pending","Closed"].map(s => {
                    const cfg = statusConfig[s];
                    const sel = formData.status === s;
                    return (
                      <label key={s} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"10px 0", borderRadius:9, cursor:"pointer", fontSize:13.5, fontWeight:600, border: sel ? `2px solid ${cfg.dot}` : "1.5px solid #e2e8f0", background: sel ? cfg.bg : "#f8fafc", color: sel ? cfg.color : "#94a3b8", transition:"all 0.15s" }}>
                        <input type="radio" name="status" value={s} checked={sel} onChange={handleChange} style={{ display:"none" }} />
                        <span style={{ width:8, height:8, borderRadius:"50%", background: sel ? cfg.dot : "#cbd5e1" }} />{s}
                      </label>
                    );
                  })}
                </div>
              </FormField>

            </div>

            {/* Submit */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20 }}>
              {editingCase && (
                <button type="button" onClick={() => { setEditingCase(null); resetForm(); }} style={{ padding:"11px 24px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#f8fafc", color:"#64748b", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  Cancel
                </button>
              )}
              <button type="submit" disabled={submitting} style={{ display:"inline-flex", alignItems:"center", gap:8, background: editingCase ? "#2563eb" : "#10b981", color:"#fff", border:"none", borderRadius:10, padding:"11px 28px", fontSize:14, fontWeight:700, cursor: submitting ? "not-allowed" : "pointer", fontFamily:"inherit", opacity: submitting ? 0.7 : 1 }}>
                {submitting ? (editingCase ? "Updating…" : "Saving…") : (editingCase ? "✓ Update Case" : "＋ Add Case")}
              </button>
            </div>
          </form>
        </div>

        {/* ── SEARCH + FILTERS ── */}
        <div style={{ display:"flex", gap:12, marginBottom:12, alignItems:"center" }}>
          <div style={{ flex:1, position:"relative" }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#94a3b8", pointerEvents:"none" }}>🔍</span>
            <input type="text" placeholder="Search by title or case number…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle({ paddingLeft:38, height:44, width:"100%", boxSizing:"border-box" }) }} {...focusHandlers} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["All","Active","Pending","Closed"].map(s => {
              const sel = statusFilter === s;
              const cfg = statusConfig[s] ?? { bg:"#1e293b", color:"#fff" };
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding:"9px 16px", borderRadius:9, fontSize:13, fontWeight:600, border: sel ? "none" : "1.5px solid #e2e8f0", background: sel ? (s==="All" ? "#1e293b" : cfg.bg) : "#fff", color: sel ? (s==="All" ? "#fff" : cfg.color) : "#64748b", cursor:"pointer", fontFamily:"inherit" }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Case type filter */}
        <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
          {["All", ...caseTypes].map(t => {
            const sel = caseTypeFilter === t;
            return (
              <button key={t} onClick={() => setCaseTypeFilter(t)} style={{ padding:"7px 14px", borderRadius:9, fontSize:12.5, fontWeight:600, border: sel ? "none" : "1.5px solid #e2e8f0", background: sel ? "#0369a1" : "#fff", color: sel ? "#fff" : "#64748b", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 }}>
                {t !== "All" ? `${caseTypeIcons[t]} ` : ""}{t}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize:12.5, color:"#94a3b8", marginBottom:14, fontWeight:500 }}>
          Showing {filtered.length} of {cases.length} case{cases.length !== 1 ? "s" : ""}
        </p>

        {/* ── CASE CARDS ── */}
        {filtered.length === 0 ? (
          <div style={{ background:"#fff", borderRadius:18, border:"1px solid #e2e8f0", padding:"52px 24px", textAlign:"center" }}>
            <div style={{ fontSize:38, marginBottom:10 }}>🗂️</div>
            <p style={{ margin:0, fontWeight:700, color:"#475569" }}>No cases found</p>
            <p style={{ margin:"4px 0 0", color:"#94a3b8", fontSize:13 }}>
              {search ? "Try a different search term." : "Add your first case using the form above."}
            </p>
          </div>
        ) : (
          <div style={{ display:"grid", gap:14 }}>
            {filtered.map((c) => {
              const isAppellant = c.lawyerRepresents?.includes("Appellant");
              const opposites   = c.oppositeParties?.filter(p => p.name) ?? [];
              const ourExtra    = c.ourParties?.filter(p => p.name) ?? [];

              return (
                <div key={c._id} style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", padding:"20px 22px 18px", boxShadow:"0 1px 4px rgba(15,23,42,0.05)", transition:"box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow="0 1px 4px rgba(15,23,42,0.05)"}
                >
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                    <div style={{ flex:1, minWidth:0 }}>

                      {/* Badges row */}
                      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:7, marginBottom:6 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"#0369a1", background:"#e0f2fe", padding:"3px 10px", borderRadius:6, letterSpacing:"0.04em" }}>
                          {c.casePrefix}/{c.caseNumber}
                        </span>
                        <StatusBadge status={c.status} />
                        {c.caseType && <CaseTypeBadge caseType={c.caseType} />}
                        {c.lawyerRepresents && <RepresentsBadge side={c.lawyerRepresents} />}
                      </div>

                      {/* Title */}
                      <h2 style={{ margin:"0 0 4px", fontSize:16.5, fontWeight:700, color:"#0f172a", letterSpacing:"-0.02em" }}>{c.caseTitle}</h2>

                      {/* Forum */}
                      {c.forum && <p style={{ margin:"0 0 10px", fontSize:12, color:"#64748b" }}>📍 {c.forum}</p>}

                      {/* Parties summary */}
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 20px", marginBottom:10 }}>
                        {/* Our side */}
                        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"8px 12px" }}>
                          <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#15803d" }}>
                            {isAppellant ? "Appellant / Complainant" : "Respondent / Defendant"}
                          </p>
                          <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#0f172a" }}>{c.client?.name || "—"}</p>
                          {ourExtra.map((p,i) => <p key={i} style={{ margin:"2px 0 0", fontSize:12, color:"#475569" }}>{i+1+1}. {p.name}</p>)}
                        </div>
                        {/* Opposite side */}
                        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px" }}>
                          <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#b91c1c" }}>
                            {isAppellant ? "Respondent / Opposite Party" : "Appellant / Complainant"}
                          </p>
                          {opposites.length === 0
                            ? <p style={{ margin:0, fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>Not entered</p>
                            : opposites.map((p,i) => <p key={i} style={{ margin: i===0 ? 0 : "2px 0 0", fontSize:13, fontWeight: i===0 ? 600 : 400, color:"#0f172a" }}>{opposites.length > 1 ? `${i+1}. ` : ""}{p.name}</p>)
                          }
                          {c.oppositeCounsel && <p style={{ margin:"4px 0 0", fontSize:11, color:"#64748b" }}>Counsel: {c.oppositeCounsel}</p>}
                        </div>
                      </div>

                      {/* Meta row */}
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 20px" }}>
                        {[
                          { icon:"🏛️", label:"Court",   val: c.courtName },
                          { icon:"📅", label:"Hearing", val: new Date(c.nextHearing).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" }) },
                          { icon:"🕐", label:"Time",    val: c.hearingTime },
                          { icon:"📋", label:"Stage",   val: c.stage },
                        ].filter(m => m.val).map(({ icon, label, val }) => (
                          <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                            <span style={{ fontSize:13 }}>{icon}</span>
                            <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600, marginRight:2 }}>{label}:</span>
                            <span style={{ fontSize:13, color:"#334155", fontWeight:500 }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:"flex", flexDirection:"column", gap:8, flexShrink:0 }}>
                      {[
                        { label:"📖 Diary",   bg:"#f5f3ff", color:"#7c3aed", border:"#ddd6fe", onClick:() => navigate(`/cases/${c._id}/diary`) },
                        { label:"✏️ Edit",    bg:"#eff6ff", color:"#1d4ed8", border:"#bfdbfe", onClick:() => handleEdit(c) },
                        { label:`🗑 ${deletingId===c._id?"…":"Delete"}`, bg:"#fff1f2", color:"#be123c", border:"#fecdd3", onClick:() => handleDelete(c._id), disabled: deletingId===c._id },
                        { label:"⏰ Reminder", bg:"#fff7ed", color:"#c2410c", border:"#fed7aa", onClick:() => createReminder({ caseId:c._id, scheduledFor:c.nextHearing, message:`${c.caseTitle} - Hearing Reminder` }) },
                        { label:"⚖️ Outcome", bg:"#ecfdf5", color:"#059669", border:"#a7f3d0", onClick:() => navigate(`/cases/${c._id}/outcome`) },
                      ].map(({ label, bg, color, border, onClick, disabled }) => (
                        <button key={label} onClick={onClick} disabled={disabled} style={{ display:"inline-flex", alignItems:"center", gap:6, background:bg, color, border:`1.5px solid ${border}`, borderRadius:9, padding:"8px 14px", fontSize:13, fontWeight:600, cursor: disabled ? "not-allowed" : "pointer", fontFamily:"inherit", transition:"all 0.15s", opacity: disabled ? 0.6 : 1 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;
