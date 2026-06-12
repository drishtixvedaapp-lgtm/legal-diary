import { useEffect, useState } from "react";
import { getClients }      from "../services/clientService";
import { getCases }        from "../services/caseService";
import { getDashboardStats } from "../services/dashboardService";
import { Users, Briefcase, CheckCircle, Clock, FileText, AlertTriangle, Calendar, Building2 } from "lucide-react";

/* ── Design tokens ── */
const C = {
  navy:"#0f2744", blue:"#2563eb", gold:"#b45309",
  green:"#15803d", red:"#b91c1c", surface:"#fff",
  border:"#e2e8f0", text:"#0f172a", muted:"#64748b",
};

/* ── Page shell ── */
const Page = ({ children }) => (
  <div style={{ background:"#f1f5f9", minHeight:"100vh", padding:"32px 36px" }}>
    {children}
  </div>
);

/* ── Page header ── */
const PageHeader = ({ title, sub }) => (
  <div style={{ marginBottom:32 }}>
    <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em",
                textTransform:"uppercase", color:C.muted, marginBottom:4 }}>Overview</p>
    <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:C.text, letterSpacing:"-0.4px" }}>{title}</h1>
    {sub && <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>{sub}</p>}
  </div>
);

/* ── Stat card ── */
const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div style={{
    background: C.surface, borderRadius:14, padding:"20px 22px",
    border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:16,
    boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
  }}>
    <div style={{
      width:44, height:44, borderRadius:12, flexShrink:0,
      background: accent + "18", display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <Icon size={20} color={accent} strokeWidth={1.8} />
    </div>
    <div>
      <p style={{ margin:0, fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</p>
      <p style={{ margin:"3px 0 0", fontSize:26, fontWeight:700, color:C.text, letterSpacing:"-0.5px" }}>{value ?? "—"}</p>
    </div>
  </div>
);

/* ── Section heading ── */
const SectionHeading = ({ title, count, urgent }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}>
    <h2 style={{ margin:0, fontSize:15, fontWeight:600, color:C.text }}>{title}</h2>
    {count !== undefined && (
      <span style={{
        background: urgent ? "#fef2f2" : "#f1f5f9",
        color: urgent ? C.red : C.muted,
        border: `1px solid ${urgent ? "#fecaca" : C.border}`,
        fontSize:12, fontWeight:600, padding:"1px 10px", borderRadius:99,
      }}>{count}</span>
    )}
  </div>
);

/* ── Urgent case card ── */
const UrgentCard = ({ c }) => (
  <div style={{
    background:C.surface, borderRadius:14, padding:"18px 20px",
    border:"1px solid #fecaca", position:"relative", overflow:"hidden",
    boxShadow:"0 1px 4px rgba(185,28,28,0.06)",
  }}>
    <div style={{ position:"absolute", left:0, top:0, bottom:0, width:3, background:C.red, borderRadius:"4px 0 0 4px" }} />
    <div style={{ paddingLeft:8 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
        <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:C.red }} className="pulse2" />
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:C.red }}>Urgent</span>
      </div>
      <p style={{ margin:"0 0 10px", fontSize:14, fontWeight:600, color:C.text, lineHeight:1.4 }}>{c.caseTitle}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <Row icon={Users}     text={c.client?.name} />
        <Row icon={Building2} text={c.courtName} />
        <Row icon={Calendar}  text={new Date(c.nextHearing).toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"})} color={C.red} />
      </div>
    </div>
  </div>
);

/* ── Upcoming hearing card ── */
const HearingCard = ({ c }) => {
  const d = new Date(c.nextHearing);
  return (
    <div style={{
      background:C.surface, borderRadius:14, padding:"18px 20px",
      border:`1px solid ${C.border}`, boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
      transition:"box-shadow 0.15s, transform 0.15s",
    }}
      onMouseEnter={e=>{ e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.09)"; e.currentTarget.style.transform="translateY(-1px)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="none"; }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
        <div style={{
          flexShrink:0, width:48, height:48, borderRadius:12,
          background:"#eff6ff", border:"1px solid #bfdbfe",
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#3b82f6", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {d.toLocaleDateString("en-IN",{month:"short"})}
          </span>
          <span style={{ fontSize:20, fontWeight:800, color:C.blue, lineHeight:1 }}>
            {d.getDate()}
          </span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <span style={{ display:"inline-block", background:"#eff6ff", color:C.blue, fontSize:10,
                         fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
                         padding:"2px 8px", borderRadius:6, marginBottom:6 }}>Hearing</span>
          <p style={{ margin:0, fontSize:13.5, fontWeight:600, color:C.text, lineHeight:1.3,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.caseTitle}</p>
        </div>
      </div>
      <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:4 }}>
        <Row icon={Users}     text={c.client?.name} />
        <Row icon={Building2} text={c.courtName} />
      </div>
    </div>
  );
};

/* ── Row helper ── */
const Row = ({ icon: Icon, text, color }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, color: color || C.muted }}>
    <Icon size={13} strokeWidth={1.8} style={{ flexShrink:0 }} />
    <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{text || "—"}</span>
  </div>
);

/* ── Empty state ── */
const Empty = ({ text }) => (
  <div style={{
    background:C.surface, borderRadius:14, border:`1px dashed ${C.border}`,
    padding:"40px 24px", textAlign:"center",
  }}>
    <CheckCircle size={28} color="#86efac" strokeWidth={1.5} style={{ marginBottom:8 }} />
    <p style={{ margin:0, fontSize:13.5, fontWeight:500, color:C.muted }}>{text}</p>
  </div>
);

/* ── Dashboard ── */
const Dashboard = () => {
  const [clients, setClients] = useState([]);
  const [cases,   setCases]   = useState([]);
  const [stats,   setStats]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [cl, ca, st] = await Promise.all([getClients(), getCases(), getDashboardStats()]);
        setClients(cl); setCases(ca); setStats(st);
      } catch(e) { console.log(e); }
    })();
  }, []);

  const urgentCases = cases.filter(c => {
    const diff = Math.ceil((new Date(c.nextHearing) - new Date()) / 86400000);
    return diff <= 1 && diff >= 0;
  });

  const today = new Date().toLocaleDateString("en-IN",{ weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <Page>
      <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:32 }}>
        <PageHeader title="Dashboard" sub="Manage cases, hearings and clients from one place." />
        <span style={{ fontSize:12.5, color:C.muted, paddingBottom:6 }}>{today}</span>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:36 }}>
        <StatCard label="Clients"         value={stats?.totalClients   ?? clients.length} icon={Users}         accent={C.navy}  />
        <StatCard label="Total Cases"     value={cases.length}                            icon={Briefcase}     accent={C.blue}  />
        <StatCard label="Active Cases"    value={stats?.activeCases    ?? "—"}            icon={Clock}         accent="#7c3aed" />
        <StatCard label="Closed Cases"    value={stats?.closedCases    ?? "—"}            icon={CheckCircle}   accent={C.green} />
        <StatCard label="Today's Hearings" value={stats?.todayHearings ?? "—"}            icon={AlertTriangle} accent="#d97706" />
        <StatCard label="Documents"       value={stats?.totalDocuments ?? "—"}            icon={FileText}      accent={C.red}   />
      </div>

      {/* Urgent hearings */}
      <section style={{ marginBottom:36 }}>
        <SectionHeading title="Urgent Hearing Alerts" count={urgentCases.length} urgent />
        {urgentCases.length === 0
          ? <Empty text="No urgent hearings — you're all clear!" />
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {urgentCases.map(c => <UrgentCard key={c._id} c={c} />)}
            </div>
        }
      </section>

      {/* Upcoming hearings */}
      <section style={{ paddingBottom:40 }}>
        <SectionHeading title="Upcoming Hearings" count={cases.length} />
        {cases.length === 0
          ? <Empty text="No upcoming hearings scheduled." />
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
              {cases.map(c => <HearingCard key={c._id} c={c} />)}
            </div>
        }
      </section>
    </Page>
  );
};

export default Dashboard;
