import { useEffect, useState } from "react";
import { getCases } from "../services/caseService";
import { Archive, User, Building2, Calendar, Search, XCircle } from "lucide-react";

const C = { navy:"#0f2744", blue:"#2563eb", border:"#e2e8f0", text:"#0f172a", muted:"#64748b", surface:"#fff", green:"#15803d" };

const HistoryPage = () => {
  const [closedCases, setClosedCases] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCases().then(data => setClosedCases(data.filter(c => c.status === "Closed"))).catch(console.log);
  }, []);

  const filtered = closedCases.filter(c =>
    c.caseTitle?.toLowerCase().includes(search.toLowerCase()) ||
    c.caseNumber?.toString().includes(search) ||
    c.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", padding:"32px 36px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:28 }}>
        <div>
          <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, marginBottom:4 }}>Case Archive</p>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:C.text, letterSpacing:"-0.4px" }}>Case History</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>All closed and disposed cases.</p>
        </div>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 16px",
          fontSize:13, color:C.muted,
        }}>
          <Archive size={14} strokeWidth={1.8} color={C.green} />
          <span style={{ fontWeight:700, fontSize:18, color:C.text }}>{closedCases.length}</span>
          <span>closed cases</span>
        </div>
      </div>

      {/* Search */}
      <div style={{ position:"relative", maxWidth:400, marginBottom:24 }}>
        <Search size={15} strokeWidth={1.8} color={C.muted}
          style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
        <input
          placeholder="Search by case title, number or client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width:"100%", paddingLeft:36, paddingRight:14, height:40,
            border:`1px solid ${C.border}`, borderRadius:10, fontSize:13.5,
            background:C.surface, color:C.text, outline:"none", boxSizing:"border-box",
          }}
        />
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <XCircle size={40} color="#cbd5e1" strokeWidth={1.2} style={{ marginBottom:12 }} />
          <p style={{ margin:0, fontSize:14, fontWeight:500, color:C.muted }}>No closed cases found.</p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13.5 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Case No","Case Title","Client","Court","Closed On","Type","Stage"].map(h => (
                  <th key={h} style={{ padding:"12px 18px", textAlign:"left", fontWeight:600, fontSize:11,
                                       letterSpacing:"0.07em", textTransform:"uppercase", color:C.muted,
                                       borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c._id} style={{ background: i%2===0 ? C.surface : "#f8fafc",
                                         transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.surface:"#f8fafc"}
                >
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, fontWeight:600, color:C.blue }}>{c.caseNumber}</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, fontWeight:500, color:C.text, maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.caseTitle}</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{c.client?.name || "—"}</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>{c.courtName}</td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, color:C.muted }}>
                    {c.closedAt ? new Date(c.closedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                  </td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ background:"#f1f5f9", color:C.muted, border:`1px solid ${C.border}`,
                                   fontSize:11, fontWeight:500, padding:"2px 8px", borderRadius:6 }}>
                      {c.caseType || "Civil"}
                    </span>
                  </td>
                  <td style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ background:"#dcfce7", color:C.green, border:"1px solid #bbf7d0",
                                   fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:6 }}>
                      {c.stage || "Closed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
