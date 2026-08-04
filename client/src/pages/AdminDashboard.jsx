import { useEffect, useState } from "react";
import { getAdminAnalytics } from "../services/adminService";
import { Users, Scale, Briefcase, FileText, Activity } from "lucide-react";

const C = { text:"#fff", muted:"rgba(255,255,255,0.55)", border:"rgba(255,255,255,0.08)", surface:"rgba(255,255,255,0.06)" };

const StatCard = ({ label, value, icon:Icon, accent }) => (
  <div style={{
    background: C.surface, borderRadius:14, padding:"24px",
    border:`1px solid ${C.border}`,
    display:"flex", alignItems:"center", gap:18,
  }}>
    <div style={{ width:48, height:48, borderRadius:12, background:accent+"28",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={22} color={accent} strokeWidth={1.8} />
    </div>
    <div>
      <p style={{ margin:0, fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>{label}</p>
      <p style={{ margin:"4px 0 0", fontSize:30, fontWeight:700, color:C.text, letterSpacing:"-0.5px" }}>{value ?? "—"}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminAnalytics()
      .then(data => { setAnalytics(data); setLoading(false); })
      .catch(err => {
        console.log(err);
        setError(err.response?.data?.message || "Couldn't load analytics. Check that the server is reachable.");
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", gap:10, color:"rgba(255,255,255,0.5)", fontSize:14, padding:20 }}>
      <span className="spin" style={{ display:"inline-block", width:18, height:18, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#2563eb", borderRadius:"50%" }} />
      Loading analytics…
    </div>
  );

  if (error) return (
    <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:14, padding:24, color:"#fca5a5", fontSize:14 }}>
      <p style={{ margin:"0 0 12px", fontWeight:600 }}>{error}</p>
      <button onClick={load} style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.4)", color:"#fca5a5", padding:"8px 18px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600 }}>
        Retry
      </button>
    </div>
  );

  if (!analytics) return null;

  return (
    <div>
      <div style={{ marginBottom:32 }}>
        <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:C.muted, marginBottom:6 }}>Administration</p>
        <h1 style={{ margin:0, fontSize:28, fontWeight:700, color:C.text, letterSpacing:"-0.4px" }}>Admin Dashboard</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>System-wide overview and analytics.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:36 }}>
        <StatCard label="Total Users"    value={analytics.totalUsers}   icon={Users}     accent="#3b82f6" />
        <StatCard label="Lawyers"        value={analytics.totalLawyers} icon={Scale}     accent="#a78bfa" />
        <StatCard label="Total Cases"    value={analytics.totalCases}   icon={Briefcase} accent="#34d399" />
        <StatCard label="Active Cases"   value={analytics.activeCases}  icon={Activity}  accent="#fbbf24" />
        <StatCard label="Notifications"  value={analytics.totalNotifications} icon={FileText} accent="#f87171" />
      </div>

      {/* Recent activity placeholder */}
      <div style={{ background:C.surface, borderRadius:14, border:`1px solid ${C.border}`, padding:"24px" }}>
        <p style={{ margin:"0 0 16px", fontSize:13, fontWeight:600, color:C.text, textTransform:"uppercase", letterSpacing:"0.07em" }}>
          System Status
        </p>
        {[
          ["Database",         "Connected",  "#34d399"],
          ["Email Service",    "Active",     "#34d399"],
          ["Scheduler",        "Running",    "#34d399"],
          ["Authentication",   "Operational","#34d399"],
        ].map(([label, status, color]) => (
          <div key={label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                                     padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
            <span style={{ fontSize:13.5, color:C.muted }}>{label}</span>
            <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12.5, fontWeight:600, color }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:color }} className="pulse2" />
              {status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
