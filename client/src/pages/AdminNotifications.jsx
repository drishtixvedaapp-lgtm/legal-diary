import { useEffect, useState } from "react";
import { getNotifications } from "../services/adminNotificationService";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getNotifications()
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(err => {
        console.log(err);
        setError(err.response?.data?.message || "Couldn't load notifications. Check that the server is reachable.");
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="text-white">
      <h1 className="text-5xl font-bold mb-10">Notifications</h1>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,0.5)", fontSize: 14, padding: 20 }}>
          <span className="spin" style={{ display: "inline-block", width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#2563eb", borderRadius: "50%" }} />
          Loading notifications…
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: 24, color: "#fca5a5", fontSize: 14 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 600 }}>{error}</p>
          <button onClick={load} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5", padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>No notifications scheduled yet.</p>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="grid gap-5">
          {notifications.map((item) => (
            <div key={item._id} className="bg-white/10 p-6 rounded-3xl">
              <h3 className="text-xl font-bold">{item.message}</h3>
              <p className="mt-2">Type: {item.type}</p>
              <p>Scheduled: {new Date(item.scheduledFor).toLocaleDateString()}</p>
              <p>Status: {item.sent ? "Sent" : "Pending"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
