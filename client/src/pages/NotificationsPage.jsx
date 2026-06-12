import { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService";
import { Bell, Folder, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

const C = { navy:"#0f2744", blue:"#2563eb", border:"#e2e8f0", text:"#0f172a", muted:"#64748b", surface:"#fff" };

const StatusBadge = ({ sent, closed }) => {
  if (closed) return <Chip color="#15803d" bg="#dcfce7" border="#bbf7d0" label="Closed" />;
  if (sent)   return <Chip color="#2563eb" bg="#eff6ff" border="#bfdbfe" label="Sent" dot />;
  return              <Chip color="#b45309" bg="#fef3c7" border="#fde68a" label="Pending" dot pulse />;
};

const Chip = ({ color, bg, border, label, dot, pulse }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:5,
    background:bg, color, border:`1px solid ${border}`,
    fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:99, whiteSpace:"nowrap",
  }}>
    {dot && <span style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }}
                  className={pulse ? "pulse2" : ""} />}
    {label}
  </span>
);

const NotificationCard = ({ n }) => (
  <div style={{
    background:C.surface, borderRadius:14, border:`1px solid ${C.border}`,
    padding:"18px 22px", display:"flex", alignItems:"flex-start", gap:18,
    boxShadow:"0 1px 3px rgba(0,0,0,0.04)", transition:"box-shadow 0.15s",
  }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"}
  >
    {/* Icon */}
    <div style={{ width:40, height:40, borderRadius:10, background:"#eff6ff",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Bell size={18} color={C.blue} strokeWidth={1.8} />
    </div>

    {/* Content */}
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ margin:"0 0 10px", fontSize:14, fontWeight:600, color:C.text, lineHeight:1.4 }}>
        {n.message}
      </p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
        <MetaItem icon={Folder}   label="Case No" value={n.case?.caseNumber} />
        <MetaItem icon={Folder}   label="Case"    value={n.case?.caseTitle}  />
        <MetaItem icon={Folder}   label="Court"   value={n.case?.courtName}  />
        <MetaItem icon={Calendar} label="Date"    value={new Date(n.scheduledFor).toLocaleString("en-IN")} />
      </div>
    </div>

    {/* Status */}
    <div style={{ flexShrink:0, paddingTop:2 }}>
      <StatusBadge sent={n.sent} closed={n.case?.status === "Closed"} />
    </div>
  </div>
);

const MetaItem = ({ icon: Icon, label, value }) => (
  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#64748b" }}>
    <Icon size={12} strokeWidth={2} />
    <span style={{ fontWeight:500 }}>{label}:</span>
    <span style={{ color:"#475569" }}>{value || "—"}</span>
  </div>
);

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(console.log);
  }, []);

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", padding:"32px 36px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em",
                      textTransform:"uppercase", color:C.muted, marginBottom:4 }}>
            Case Management System
          </p>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:C.text, letterSpacing:"-0.4px" }}>
            Notifications
          </h1>
        </div>
        <span style={{
          background:"#eff6ff", color:C.blue, border:"1px solid #bfdbfe",
          fontSize:13, fontWeight:600, padding:"5px 14px", borderRadius:99,
        }}>
          {notifications.length} total
        </span>
      </div>

      <div style={{ height:1, background:"linear-gradient(90deg,#2563eb44,transparent)", marginBottom:28 }} />

      {/* Empty */}
      {notifications.length === 0 && (
        <div style={{ textAlign:"center", padding:"80px 24px" }}>
          <XCircle size={40} color="#cbd5e1" strokeWidth={1.2} style={{ marginBottom:12 }} />
          <p style={{ margin:0, fontSize:15, fontWeight:500, color:C.muted }}>All caught up</p>
          <p style={{ margin:"4px 0 0", fontSize:13, color:"#94a3b8" }}>No notifications found.</p>
        </div>
      )}

      {/* List */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {notifications.map((n, i) => (
          <div key={n._id} className="fade-up" style={{ animationDelay:`${i*40}ms` }}>
            <NotificationCard n={n} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
