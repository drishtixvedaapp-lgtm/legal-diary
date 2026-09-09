import { useEffect, useState } from "react";
import { getCaseFilterOptions, getFilteredCases } from "../services/caseBrowseService";
import { Link } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const selectStyle = {
  padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0",
  fontSize: 13, background: "#fff", color: "#0f172a", outline: "none",
  fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};
const label = { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748b", marginBottom: 5, display: "block" };

const CaseBrowser = () => {
  const isMobile = useIsMobile();
  const [options, setOptions] = useState({ courtNames: [], caseTypes: [], statuses: [], lawyerRepresentsValues: [] });
  const [filters, setFilters] = useState({ courtName: "", caseType: "", status: "", lawyerRepresents: "", hasClientPhone: "", search: "" });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaseFilterOptions().then(setOptions).catch(() => {});
  }, []);

  const runSearch = async (activeFilters) => {
    setLoading(true);
    try {
      const data = await getFilteredCases(activeFilters);
      setCases(data);
    } catch (e) {
      console.error("Failed to load cases:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runSearch(filters); /* eslint-disable-next-line */ }, []);

  const handleFilterChange = (e) => {
    const next = { ...filters, [e.target.name]: e.target.value };
    setFilters(next);
    runSearch(next);
  };

  const clearFilters = () => {
    const cleared = { courtName: "", caseType: "", status: "", lawyerRepresents: "", hasClientPhone: "", search: "" };
    setFilters(cleared);
    runSearch(cleared);
  };

  const sel = (name, placeholderLabel, optionList) => (
    <div>
      <label style={label}>{placeholderLabel}</label>
      <select name={name} value={filters[name]} onChange={handleFilterChange} style={selectStyle}>
        <option value="">All</option>
        {optionList.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const missingPhoneCount = cases.filter(c => !c.client).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>🔍 Case Browser</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
        Browse and filter every case — by commission/court, status, side represented, or missing contact info.
      </p>

      {/* Filter bar */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)", gap: 12, marginBottom: 12 }}>
          {sel("courtName", "Court / Commission", options.courtNames)}
          {sel("caseType", "Case Type", options.caseTypes)}
          {sel("status", "Status", options.statuses)}
          {sel("lawyerRepresents", "Represents", options.lawyerRepresentsValues)}
          <div>
            <label style={label}>Contact Info</label>
            <select name="hasClientPhone" value={filters.hasClientPhone} onChange={handleFilterChange} style={selectStyle}>
              <option value="">All</option>
              <option value="false">⚠️ Missing phone</option>
              <option value="true">✅ Has phone</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10 }}>
          <input
            name="search" value={filters.search} onChange={handleFilterChange}
            placeholder="Search case number or title…"
            style={{ ...selectStyle, flex: 1, minWidth: 0 }}
          />
          <button onClick={clearFilters} style={{ padding: "9px 16px", minHeight: isMobile ? 44 : "auto", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            Clear filters
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 14, fontSize: 13, color: "#475569" }}>
        <span><strong>{cases.length}</strong> case{cases.length === 1 ? "" : "s"} found</span>
        {missingPhoneCount > 0 && <span style={{ color: "#b45309" }}>⚠️ {missingPhoneCount} missing contact info</span>}
      </div>

      {/* Results */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading…</p>
      ) : cases.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No cases match these filters.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {cases.map(c => (
            <Link key={c._id} to={`/dashboard/cases/${c._id}/diary`} style={{ textDecoration: "none" }}>
              <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.caseTitle}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                    {c.caseNumber} · {c.courtName} · {c.lawyerRepresents?.split(" / ")[0]}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: c.client ? "#15803d" : "#b45309", fontWeight: 600 }}>
                    {c.client ? `📞 ${c.client.phone}` : "⚠️ No phone"}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {c.nextHearing ? new Date(c.nextHearing).toLocaleDateString("en-IN") : "No date"}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseBrowser;
