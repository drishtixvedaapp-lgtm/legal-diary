import { useEffect, useState, useRef } from "react";
import { createCauselistJob, getCauselistJobs, getCauselistJobById } from "../services/causelistJobService";
import useIsMobile from "../hooks/useIsMobile";

const inputStyle = () => ({
  padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0",
  fontSize: 14, background: "#f8fafc", color: "#0f172a", outline: "none",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
});
const label = { fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#64748b", marginBottom: 5, display: "block" };

const STATUS_COLORS = {
  queued:    { bg: "#f1f5f9", fg: "#64748b" },
  running:   { bg: "#dbeafe", fg: "#1d4ed8" },
  completed: { bg: "#dcfce7", fg: "#15803d" },
  failed:    { bg: "#fee2e2", fg: "#b91c1c" },
};

const StatusPill = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.queued;
  return (
    <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {status}
    </span>
  );
};

const JobCard = ({ job }) => {
  const pct = job.totalDates > 0 ? Math.round((job.datesProcessed / job.totalDates) * 100) : 0;
  return (
    <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: 18, marginBottom: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
            {job.surname} {job.givenName} — {job.commission} / {job.district}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
            {new Date(job.dateFrom).toLocaleDateString("en-IN")} → {new Date(job.dateTo).toLocaleDateString("en-IN")}
            {" · "}for {job.assignedLawyer?.name || "?"}
          </div>
        </div>
        <StatusPill status={job.status} />
      </div>

      {(job.status === "running" || job.status === "queued") && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "#2563eb", transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 5 }}>
            {job.datesProcessed} / {job.totalDates} dates scanned{job.currentDate ? ` — currently on ${job.currentDate}` : ""}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", fontSize: 13, color: "#334155" }}>
        <span>🔎 {job.matchesFound} match{job.matchesFound === 1 ? "" : "es"}</span>
        <span>✅ {job.casesCreated} created</span>
        <span>⏭️ {job.casesSkipped} skipped (existing)</span>
      </div>

      {job.status === "failed" && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#b91c1c", background: "#fef2f2", padding: "8px 12px", borderRadius: 8 }}>
          ❌ {job.errorMessage}
        </div>
      )}

      {job.log?.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 12, color: "#2563eb", cursor: "pointer" }}>View log ({job.log.length} lines)</summary>
          <div style={{ marginTop: 8, maxHeight: 200, overflowY: "auto", background: "#f8fafc", borderRadius: 8, padding: 10, fontSize: 11, fontFamily: "monospace", color: "#475569", wordBreak: "break-word" }}>
            {job.log.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </details>
      )}
    </div>
  );
};

const CauselistImport = () => {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    commission: "", district: "", dateFrom: "", dateTo: "",
    surname: "", givenName: "", lawyerEmail: "",
  });
  const [jobs, setJobs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const pollRef = useRef(null);

  const loadJobs = async () => {
    try {
      const data = await getCauselistJobs();
      setJobs(data);
    } catch (e) { console.error("Failed to load jobs:", e); }
  };

  useEffect(() => {
    loadJobs();
    // Poll every 4s so running jobs' progress bars update live. Stops
    // nothing — cheap enough to just always poll while this page is open.
    pollRef.current = setInterval(loadJobs, 4000);
    return () => clearInterval(pollRef.current);
  }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.commission || !form.district || !form.dateFrom || !form.dateTo || !form.surname || !form.givenName || !form.lawyerEmail) {
      return setError("Please fill in every field.");
    }
    if (new Date(form.dateFrom) > new Date(form.dateTo)) {
      return setError("Start date must be before end date.");
    }
    setSubmitting(true);
    try {
      await createCauselistJob(form);
      await loadJobs();
      setForm(prev => ({ ...prev, dateFrom: "", dateTo: "" })); // keep commission/district/name for convenience, clear dates
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start import.");
    } finally {
      setSubmitting(false);
    }
  };

  const fi = (name, placeholderLabel, type = "text", placeholder = "") => (
    <div>
      <label style={label}>{placeholderLabel}</label>
      <input
        name={name} type={type} value={form[name]} onChange={handleChange}
        placeholder={placeholder} style={inputStyle()}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>📋 Causelist Import</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
        Automatically scan e-Jagriti causelists over a date range and pull in every case matching a lawyer's name.
      </p>

      <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 22, marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {fi("commission", "Commission", "text", "e.g. ANDHRA PRADESH or NCDRC")}
          {fi("district", "CauseList For (District/Commission)", "text", "e.g. Krishna at Vijaywada")}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {fi("dateFrom", "Start Date", "date")}
          {fi("dateTo", "End Date", "date")}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {fi("surname", "Advocate Surname", "text", "e.g. Manne")}
          {fi("givenName", "Advocate Given Name", "text", "e.g. Hari Babu")}
        </div>

        <div style={{ marginBottom: 16 }}>
          {fi("lawyerEmail", "Assign cases to (lawyer's account email)", "email", "e.g. mannehbabu@gmail.com")}
        </div>

        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16, lineHeight: 1.5 }}>
          Type Commission/District exactly as they appear on the e-Jagriti Causelist page's dropdowns.
          The advocate name is matched in either order and with flexible spacing, so "Manne Hari Babu",
          "Hari Babu Manne", and "Manne Haribabu" all match automatically.
        </p>

        {error && <p style={{ color: "#dc2626", fontSize: 13, background: "#fef2f2", padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>{error}</p>}

        <button type="submit" disabled={submitting}
          style={{ padding: "11px 22px", minHeight: 44, borderRadius: 10, border: "none", background: submitting ? "#93c5fd" : "#2563eb", color: "#fff", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {submitting ? "Starting…" : "▶️ Start Import"}
        </button>
      </form>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Recent Imports</h3>
      {jobs.length === 0 && <p style={{ color: "#94a3b8", fontSize: 14 }}>No imports run yet.</p>}
      {jobs.map(job => <JobCard key={job._id} job={job} />)}
    </div>
  );
};

export default CauselistImport;
