import { useEffect, useState } from "react";
import {
  getCases,
  createCase,
  updateCase,
  deleteCase,
} from "../services/caseService";
import {
  createReminder,
} from "../services/notificationService";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { getClients } from "../services/clientService";

// ── Stage definitions per case type ─────────────────────────────────────────

const stagesByType = {
  "Civil": [
    "Filing", "Summons", "Written Statement",
    "Framing of Issues", "Evidence", "Arguments", "Judgment", "Appeal", "Closed",
  ],
  "Criminal": [
    "FIR / Complaint", "Remand", "Charge Sheet",
    "Charge Framing", "Prosecution Evidence",
    "Defence Evidence", "Arguments", "Judgment", "Appeal", "Closed",
  ],
  "Constitutional / Writ": [
    "Filing", "Admission", "Rule Nisi",
    "Counter Affidavit", "Arguments", "Judgment", "Closed",
  ],
  "Family": [
    "Filing", "Summons", "Written Statement",
    "Mediation", "Evidence", "Arguments", "Judgment", "Appeal", "Closed",
  ],
  "Consumer": [
    "Filing", "Notice", "Reply / Counter",
    "Evidence", "Arguments", "Order", "Appeal", "Closed",
  ],
  "Labour / Employment": [
    "Filing", "Notice", "Reply / Counter",
    "Evidence", "Arguments", "Award / Order", "Appeal", "Closed",
  ],
  "Taxation": [
    "Filing", "Notice", "Reply",
    "Assessment", "Arguments", "Order", "Appeal", "Closed",
  ],
  "Revenue / Land": [
    "Filing", "Notice", "Written Statement",
    "Evidence", "Arguments", "Order", "Appeal", "Closed",
  ],
  "Commercial": [
    "Filing", "Summons", "Written Statement",
    "Framing of Issues", "Evidence", "Arguments", "Judgment", "Appeal", "Closed",
  ],
};

const hearingTypesByCase = {
  "Civil": [
    "First Hearing",
    "Summons / Notice",
    "Interlocutory / Interim Relief",
    "Framing of Issues",
    "Examination in Chief",
    "Cross Examination",
    "Arguments",
    "Judgment",
    "Stay Application",
    "Appeal Hearing",
  ],
  "Criminal": [
    "Remand Hearing",
    "Bail Hearing",
    "Charge Framing",
    "Prosecution Evidence",
    "Cross Examination",
    "Section 313 Statement",
    "Defence Evidence",
    "Final Arguments",
    "Judgment",
    "Appeal Hearing",
  ],
  "Constitutional / Writ": [
    "Admission Hearing",
    "Rule Nisi",
    "Counter Affidavit Hearing",
    "Writ Hearing",
    "Arguments",
    "Judgment",
    "Stay Application",
  ],
  "Family": [
    "First Hearing",
    "Mediation",
    "Interim Relief",
    "Examination in Chief",
    "Cross Examination",
    "Arguments",
    "Judgment",
    "Appeal Hearing",
  ],
  "Consumer": [
    "First Hearing",
    "Notice Hearing",
    "Evidence",
    "Arguments",
    "Order",
    "Appeal Hearing",
  ],
  "Labour / Employment": [
    "First Hearing",
    "Evidence",
    "Cross Examination",
    "Arguments",
    "Award Hearing",
    "Appeal Hearing",
  ],
  "Taxation": [
    "First Hearing",
    "Assessment Hearing",
    "Arguments",
    "Order",
    "Appeal Hearing",
  ],
  "Revenue / Land": [
    "First Hearing",
    "Evidence",
    "Cross Examination",
    "Arguments",
    "Order",
    "Appeal Hearing",
  ],
  "Commercial": [
    "First Hearing",
    "Framing of Issues",
    "Evidence",
    "Cross Examination",
    "Arguments",
    "Judgment",
    "Appeal Hearing",
  ],
};

const caseTypes = [
  "Civil",
  "Criminal",
  "Constitutional / Writ",
  "Family",
  "Consumer",
  "Labour / Employment",
  "Taxation",
  "Revenue / Land",
  "Commercial",
];

const caseTypeIcons = {
  "Civil":                  "⚖️",
  "Criminal":               "🚔",
  "Constitutional / Writ":  "📜",
  "Family":                 "👨‍👩‍👧",
  "Consumer":               "🛒",
  "Labour / Employment":    "🏭",
  "Taxation":               "💰",
  "Revenue / Land":         "🏡",
  "Commercial":             "🏢",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig = {
  Active:  { bg: "#dcfce7", color: "#15803d", dot: "#16a34a" },
  Pending: { bg: "#fef9c3", color: "#a16207", dot: "#ca8a04" },
  Closed:  { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: 99,
      fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {status}
    </span>
  );
};

const CaseTypeBadge = ({ caseType }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: "#f0f9ff", color: "#0369a1",
    padding: "3px 10px", borderRadius: 99,
    fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
  }}>
    {caseTypeIcons[caseType] ?? "📁"} {caseType}
  </span>
);

const StageBar = ({ stage, caseType }) => {
  const stages = stagesByType[caseType] ?? stagesByType["Civil"];
  const idx = stages.indexOf(stage);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexWrap: "wrap", gap: 2 }}>
        {stages.map((s, i) => (
          <span key={s} style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: i <= idx ? "#3b82f6" : "#cbd5e1",
          }}>{s}</span>
        ))}
      </div>
      <div style={{ height: 4, borderRadius: 99, background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 99,
          background: "linear-gradient(90deg,#3b82f6,#6366f1)",
          width: idx < 0 ? "0%" : `${((idx + 1) / stages.length) * 100}%`,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
};

const FieldLabel = ({ children }) => (
  <label style={{
    display: "block", fontSize: 11.5, fontWeight: 700,
    color: "#64748b", letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 5,
  }}>{children}</label>
);

const inputStyle = (extra = {}) => ({
  width: "100%", boxSizing: "border-box",
  height: 42, padding: "0 13px",
  border: "1.5px solid #e2e8f0", borderRadius: 9,
  fontSize: 13.5, color: "#1e293b",
  background: "#f8fafc", outline: "none",
  fontFamily: "inherit", transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
  ...extra,
});

const focusHandlers = {
  onFocus: (e) => {
    e.target.style.borderColor = "#3b82f6";
    e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.13)";
    e.target.style.background = "#fff";
  },
  onBlur: (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
    e.target.style.background = "#f8fafc";
  },
};

const FormField = ({ label, children, colSpan }) => (
  <div style={{ gridColumn: colSpan === 2 ? "1 / -1" : undefined }}>
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

// ── Default form state ────────────────────────────────────────────────────────

const defaultForm = {
  caseNumber: "",
  client: "",
  caseTitle: "",
  courtName: "",
  nextHearing: "",
  hearingTime: "",
  caseType: "Civil",
  hearingType: "First Hearing",
  stage: "Filing",
  status: "Active",
};

// ── Main Component ────────────────────────────────────────────────────────────

const Cases = () => {

  const location = useLocation();
  const navigate = useNavigate();

  const [editingCase, setEditingCase]   = useState(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [caseTypeFilter, setCaseTypeFilter] = useState("All");
  const [cases, setCases]               = useState([]);
  const [clients, setClients]           = useState([]);
  const [deletingId, setDeletingId]     = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [formData, setFormData]         = useState(defaultForm);

  // Dynamic options based on selected caseType
  const currentStages       = stagesByType[formData.caseType]      ?? stagesByType["Civil"];
  const currentHearingTypes = hearingTypesByCase[formData.caseType] ?? hearingTypesByCase["Civil"];

  // Pre-fill date from calendar navigation
  useEffect(() => {
    if (location.state?.selectedDate) {
      const date = new Date(location.state.selectedDate).toISOString().split("T")[0];
      setFormData((prev) => ({ ...prev, nextHearing: date }));
    }
  }, [location]);

  const fetchCases = async () => {
    try { setCases(await getCases()); } catch (e) { console.error(e); }
  };
  const fetchClients = async () => {
    try { setClients(await getClients()); } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchCases(); fetchClients(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // When caseType changes, reset stage and hearingType to first valid option
    if (name === "caseType") {
      const newStages       = stagesByType[value]      ?? stagesByType["Civil"];
      const newHearingTypes = hearingTypesByCase[value] ?? hearingTypesByCase["Civil"];
      setFormData((prev) => ({
        ...prev,
        caseType:    value,
        stage:       newStages[0],
        hearingType: newHearingTypes[0],
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => setFormData(defaultForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCase) {
        await updateCase(editingCase._id, formData);
        setEditingCase(null);
      } else {
        await createCase(formData);
      }
      resetForm();
      fetchCases();
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try { await deleteCase(id); fetchCases(); }
    catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  };

  const handleEdit = (c) => {
    setEditingCase(c);
    setFormData({
      caseNumber:  c.caseNumber,
      client:      c.client?._id,
      caseTitle:   c.caseTitle,
      courtName:   c.courtName,
      nextHearing: c.nextHearing?.split("T")[0],
      hearingTime: c.hearingTime,
      caseType:    c.caseType   ?? "Civil",
      hearingType: c.hearingType,
      stage:       c.stage,
      status:      c.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = cases.filter((c) => {
    const q           = search.toLowerCase();
    const matchSearch = c.caseTitle.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    const matchType   = caseTypeFilter === "All" || c.caseType === caseTypeFilter;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .case-card { animation: fadeUp 0.22s ease both; }
        .case-card:hover { box-shadow: 0 6px 24px rgba(15,23,42,0.1) !important; border-color: #cbd5e1 !important; }
        .icon-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .icon-btn:active { transform: scale(0.96); }
        select option { background: #fff; color: #1e293b; }
        .filter-scroll { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
        .filter-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px 72px" }}>

        {/* ── PAGE HEADER ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg,#065f46,#10b981)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: "0 4px 14px rgba(16,185,129,0.35)",
            }}>⚖️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.03em" }}>
                Case Management
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
                {cases.length} case{cases.length !== 1 ? "s" : ""} on record
              </p>
            </div>
          </div>
        </div>

        {/* ── FORM PANEL ── */}
        <div style={{
          background: "#fff", borderRadius: 18,
          border: editingCase ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
          padding: "26px 28px 24px",
          marginBottom: 30,
          boxShadow: editingCase
            ? "0 0 0 4px rgba(59,130,246,0.08), 0 2px 8px rgba(15,23,42,0.06)"
            : "0 1px 4px rgba(15,23,42,0.06)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}>

          {/* Form header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                {editingCase ? "✏️  Editing Case" : "➕  Add New Case"}
              </span>
              {editingCase && (
                <span style={{
                  fontSize: 12, fontWeight: 600, background: "#eff6ff",
                  color: "#3b82f6", padding: "2px 10px", borderRadius: 99,
                }}>
                  {editingCase.caseNumber}
                </span>
              )}
            </div>
            {editingCase && (
              <button
                onClick={() => { setEditingCase(null); resetForm(); }}
                style={{
                  background: "transparent", border: "1.5px solid #e2e8f0",
                  borderRadius: 8, padding: "5px 12px",
                  fontSize: 12.5, fontWeight: 600, color: "#64748b",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                ✕ Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }}>

              {/* Case Type — full width, first so it controls other dropdowns */}
              <FormField label="Case Type" colSpan={2}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {caseTypes.map((t) => {
                    const sel = formData.caseType === t;
                    return (
                      <label key={t} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", borderRadius: 9, cursor: "pointer",
                        fontSize: 13, fontWeight: 600,
                        border: sel ? "2px solid #0369a1" : "1.5px solid #e2e8f0",
                        background: sel ? "#e0f2fe" : "#f8fafc",
                        color: sel ? "#0369a1" : "#94a3b8",
                        transition: "all 0.15s",
                      }}>
                        <input type="radio" name="caseType" value={t}
                          checked={sel} onChange={handleChange}
                          style={{ display: "none" }} />
                        {caseTypeIcons[t]} {t}
                      </label>
                    );
                  })}
                </div>
              </FormField>

              <FormField label="Case Number">
                <input name="caseNumber" type="text" placeholder="e.g. CIV-2024-001"
                  value={formData.caseNumber} onChange={handleChange} required
                  style={inputStyle()} {...focusHandlers} />
              </FormField>

              <FormField label="Case Title">
                <input name="caseTitle" type="text" placeholder="Brief case title"
                  value={formData.caseTitle} onChange={handleChange} required
                  style={inputStyle()} {...focusHandlers} />
              </FormField>

              <FormField label="Client">
                <select name="client" value={formData.client} onChange={handleChange} required
                  style={inputStyle()} {...focusHandlers}>
                  <option value="">— Select Client —</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Court Name">
                <input name="courtName" type="text" placeholder="e.g. High Court of Delhi"
                  value={formData.courtName} onChange={handleChange} required
                  style={inputStyle()} {...focusHandlers} />
              </FormField>

              <FormField label="Next Hearing Date">
                <input name="nextHearing" type="date"
                  value={formData.nextHearing} onChange={handleChange} required
                  style={inputStyle()} {...focusHandlers} />
              </FormField>

              <FormField label="Hearing Time">
                <input name="hearingTime" type="text" placeholder="e.g. 10:30 AM"
                  value={formData.hearingTime} onChange={handleChange}
                  style={inputStyle()} {...focusHandlers} />
              </FormField>

              {/* Hearing Type — dynamic based on caseType */}
              <FormField label="Hearing Type">
                <select name="hearingType" value={formData.hearingType} onChange={handleChange}
                  style={inputStyle()} {...focusHandlers}>
                  {currentHearingTypes.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </FormField>

              {/* Stage — dynamic based on caseType */}
              <FormField label="Stage">
                <select name="stage" value={formData.stage} onChange={handleChange}
                  style={inputStyle()} {...focusHandlers}>
                  {currentStages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FormField>

              {/* Status */}
              <FormField label="Status" colSpan={2}>
                <div style={{ display: "flex", gap: 10 }}>
                  {["Active", "Pending", "Closed"].map((s) => {
                    const cfg = statusConfig[s];
                    const sel = formData.status === s;
                    return (
                      <label key={s} style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "10px 0", borderRadius: 9, cursor: "pointer", fontSize: 13.5, fontWeight: 600,
                        border: sel ? `2px solid ${cfg.dot}` : "1.5px solid #e2e8f0",
                        background: sel ? cfg.bg : "#f8fafc",
                        color: sel ? cfg.color : "#94a3b8",
                        transition: "all 0.15s",
                      }}>
                        <input type="radio" name="status" value={s}
                          checked={sel} onChange={handleChange}
                          style={{ display: "none" }} />
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: sel ? cfg.dot : "#cbd5e1" }} />
                        {s}
                      </label>
                    );
                  })}
                </div>
              </FormField>

            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={submitting} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: editingCase
                  ? (submitting ? "#93c5fd" : "#3b82f6")
                  : (submitting ? "#6ee7b7" : "#10b981"),
                color: "#fff", border: "none", borderRadius: 10,
                padding: "11px 28px", fontSize: 14, fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "-0.01em",
                boxShadow: editingCase
                  ? "0 2px 10px rgba(59,130,246,0.35)"
                  : "0 2px 10px rgba(16,185,129,0.35)",
                transition: "background 0.15s, transform 0.1s",
              }}>
                {submitting
                  ? (editingCase ? "Updating…" : "Saving…")
                  : (editingCase ? "✓ Update Case" : "＋ Add Case")}
              </button>
            </div>
          </form>
        </div>

        {/* ── SEARCH + STATUS FILTER ── */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              fontSize: 16, color: "#94a3b8", pointerEvents: "none",
            }}>🔍</span>
            <input
              type="text" placeholder="Search by title or case number…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle({ paddingLeft: 38, height: 44, width: "100%", boxSizing: "border-box" }) }}
              {...focusHandlers}
            />
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {["All", "Active", "Pending", "Closed"].map((s) => {
              const sel = statusFilter === s;
              const cfg = statusConfig[s] ?? { bg: "#1e293b", color: "#fff" };
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{
                  padding: "9px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                  border: sel ? "none" : "1.5px solid #e2e8f0",
                  background: sel ? (s === "All" ? "#1e293b" : cfg.bg) : "#fff",
                  color: sel ? (s === "All" ? "#fff" : cfg.color) : "#64748b",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CASE TYPE FILTER (scrollable) ── */}
        <div className="filter-scroll" style={{ marginBottom: 20 }}>
          {["All", ...caseTypes].map((t) => {
            const sel = caseTypeFilter === t;
            return (
              <button key={t} onClick={() => setCaseTypeFilter(t)} style={{
                padding: "7px 14px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
                border: sel ? "none" : "1.5px solid #e2e8f0",
                background: sel ? "#0369a1" : "#fff",
                color: sel ? "#fff" : "#64748b",
                cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {t !== "All" ? `${caseTypeIcons[t]} ` : ""}{t}
              </button>
            );
          })}
        </div>

        {/* ── RESULTS COUNT ── */}
        <p style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 14, fontWeight: 500 }}>
          Showing {filtered.length} of {cases.length} case{cases.length !== 1 ? "s" : ""}
        </p>

        {/* ── CASE LIST ── */}
        {filtered.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 18, border: "1px solid #e2e8f0",
            padding: "52px 24px", textAlign: "center",
            boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
          }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🗂️</div>
            <p style={{ margin: 0, fontWeight: 700, color: "#475569" }}>No cases found</p>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>
              {search ? "Try a different search term or filter." : "Add your first case using the form above."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((c, idx) => (
              <div key={c._id} className="case-card" style={{
                background: "#fff", borderRadius: 16,
                border: "1px solid #e2e8f0",
                padding: "20px 22px 18px",
                boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                transition: "box-shadow 0.2s, border-color 0.2s",
                animationDelay: `${idx * 0.04}s`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Title + badges */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.02em" }}>
                        {c.caseTitle}
                      </h2>
                      <StatusBadge status={c.status} />
                      {c.caseType && <CaseTypeBadge caseType={c.caseType} />}
                    </div>

                    <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em" }}>
                      CASE NO. {c.caseNumber}
                    </p>

                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "6px 20px" }}>
                      {[
                        { icon: "👤", label: "Client",  val: c.client?.name },
                        { icon: "🏛️", label: "Court",   val: c.courtName },
                        { icon: "📅", label: "Hearing", val: new Date(c.nextHearing).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                        { icon: "🕐", label: "Time",    val: c.hearingTime },
                        { icon: "📋", label: "Type",    val: c.hearingType },
                      ].filter(m => m.val).map(({ icon, label, val }) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13 }}>{icon}</span>
                          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginRight: 3 }}>{label}:</span>
                          <span style={{ fontSize: 13, color: "#334155", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stage bar — now dynamic per case type */}
                    <StageBar stage={c.stage} caseType={c.caseType ?? "Civil"} />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/cases/${c._id}/diary`)}
                      title="Open Diary"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#f5f3ff", color: "#7c3aed",
                        border: "1.5px solid #ddd6fe", borderRadius: 9,
                        padding: "8px 14px", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>
                      📖 Diary
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => handleEdit(c)}
                      title="Edit Case"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#eff6ff", color: "#1d4ed8",
                        border: "1.5px solid #bfdbfe", borderRadius: 9,
                        padding: "8px 14px", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>
                      ✏️ Edit
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      title="Delete Case"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#fff1f2", color: "#be123c",
                        border: "1.5px solid #fecdd3", borderRadius: 9,
                        padding: "8px 14px", fontSize: 13, fontWeight: 600,
                        cursor: deletingId === c._id ? "not-allowed" : "pointer",
                        fontFamily: "inherit", transition: "all 0.15s",
                        opacity: deletingId === c._id ? 0.6 : 1,
                      }}>
                      🗑 {deletingId === c._id ? "…" : "Delete"}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() =>
                        createReminder({
                          caseId: c._id,
                          scheduledFor: c.nextHearing,
                          message: `${c.caseTitle} - Hearing Reminder`,
                        })
                      }
                      title="Set Reminder"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "#fff7ed", color: "#c2410c",
                        border: "1.5px solid #fed7aa", borderRadius: 9,
                        padding: "8px 14px", fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      }}>
                      ⏰Reminder
                    </button>
                    <button
  className="icon-btn"
  onClick={() =>
    navigate(
      `/cases/${c._id}/outcome`
    )
  }
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#ecfdf5",
    color: "#059669",
    border: "1.5px solid #a7f3d0",
    borderRadius: 9,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  ⚖️ Outcome
</button>
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

export default Cases;