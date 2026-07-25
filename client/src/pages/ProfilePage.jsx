import { useState, useEffect } from "react";
import { User, Phone, Mail, Lock, Save, CheckCircle, AlertCircle } from "lucide-react";
import API from "../services/api";

const ProfilePage = () => {
  const [profile,  setProfile]  = useState({ name:"", email:"", phone:"", role:"" });
  const [passForm, setPassForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [saving,   setSaving]   = useState(false);
  const [changing, setChanging] = useState(false);
  const [toast,    setToast]    = useState(null); // { type: "success"|"error", msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Load profile on mount
  useEffect(() => {
    API.get("/profile")
      .then(res => setProfile({
        ...res.data,
        phone: res.data.phone || "",   // ensure never undefined
      }))
      .catch(e => console.error(e));
  }, []);

  // Update localStorage userInfo when profile changes
  const syncLocalStorage = (updated) => {
    const info = JSON.parse(localStorage.getItem("userInfo") || "{}");
    localStorage.setItem("userInfo", JSON.stringify({ ...info, ...updated }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/profile", {
        name : profile.name,
        phone: profile.phone,
      });
      setProfile(res.data);
      syncLocalStorage({ name: res.data.name });
      showToast("success", "Profile updated successfully!");
    } catch(err) {
      showToast("error", err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword)
      return showToast("error", "New passwords do not match");
    if (passForm.newPassword.length < 6)
      return showToast("error", "Password must be at least 6 characters");

    setChanging(true);
    try {
      await API.patch("/profile/change-password", {
        currentPassword: passForm.currentPassword,
        newPassword    : passForm.newPassword,
      });
      setPassForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
      showToast("success", "Password changed successfully!");
    } catch(err) {
      showToast("error", err.response?.data?.message || "Failed to change password");
    } finally { setChanging(false); }
  };

  // Avatar initials
  const initials = profile.name
    ? profile.name.split(" ").slice(0,2).map(w => w[0]?.toUpperCase()).join("")
    : "?";

  const inp = (extra = {}) => ({
    width:"100%", padding:"11px 14px", borderRadius:10,
    border:"1.5px solid #e2e8f0", background:"#f8fafc",
    fontSize:14, color:"#0f172a", outline:"none",
    fontFamily:"inherit", boxSizing:"border-box", ...extra,
  });

  const focus = {
    onFocus: e => { e.currentTarget.style.borderColor="#2563eb"; e.currentTarget.style.background="#fff"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(37,99,235,0.1)"; },
    onBlur:  e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.boxShadow="none"; },
  };

  return (
    <div style={{ background:"#f1f5f9", minHeight:"100vh", padding:"28px 32px", fontFamily:"'Inter',sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:20, zIndex:9999,
          background: toast.type === "success" ? "#15803d" : "#b91c1c",
          color:"#fff", padding:"12px 20px", borderRadius:12,
          fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:10,
          boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
        }}>
          {toast.type === "success"
            ? <CheckCircle size={17} />
            : <AlertCircle size={17} />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <p style={{ margin:0, fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"#64748b", marginBottom:4 }}>Account</p>
        <h1 style={{ margin:0, fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:"-0.4px" }}>My Profile</h1>
        <p style={{ margin:"4px 0 0", fontSize:13, color:"#64748b" }}>Manage your personal details and contact information</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, maxWidth:900 }}>

        {/* ── Profile Card ── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", padding:"28px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

          {/* Avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, paddingBottom:20, borderBottom:"1px solid #f1f5f9" }}>
            <div style={{
              width:60, height:60, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#0f2744,#1a3a5c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:700, color:"#fff",
              boxShadow:"0 4px 14px rgba(15,39,68,0.3)",
            }}>
              {initials}
            </div>
            <div>
              <p style={{ margin:0, fontSize:17, fontWeight:700, color:"#0f172a" }}>{profile.name || "—"}</p>
              <p style={{ margin:"2px 0 0", fontSize:12, fontWeight:600, color:"#2563eb", textTransform:"capitalize", background:"#eff6ff", padding:"2px 10px", borderRadius:6, display:"inline-block" }}>
                {profile.role || "lawyer"}
              </p>
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={handleProfileSave} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div>
              <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748b", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <User size={13} /> Full Name
              </label>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
                required
                style={inp()} {...focus}
              />
            </div>

            <div>
              <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748b", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <Mail size={13} /> Email
              </label>
              <input
                value={profile.email}
                disabled
                style={inp({ background:"#f1f5f9", color:"#94a3b8", cursor:"not-allowed" })}
              />
              <p style={{ margin:"4px 0 0", fontSize:11, color:"#94a3b8" }}>Email cannot be changed</p>
            </div>

            <div>
              <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748b", display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                <Phone size={13} /> WhatsApp / Mobile Number
              </label>
              <input
                value={profile.phone || ""}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="e.g. 9876543210"
                style={inp()} {...focus}
              />
              <p style={{ margin:"4px 0 0", fontSize:11, color:"#64748b" }}>
                This number appears in all hearing reminder emails and WhatsApp messages sent to clients
              </p>
            </div>

            <button type="submit" disabled={saving} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"11px", borderRadius:10, border:"none",
              background: saving ? "#93c5fd" : "#0f2744",
              color:"#fff", fontSize:14, fontWeight:700,
              cursor: saving ? "not-allowed" : "pointer", fontFamily:"inherit",
              marginTop:4, transition:"opacity 0.15s",
            }}>
              <Save size={16} />
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* ── Change Password Card ── */}
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e2e8f0", padding:"28px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24, paddingBottom:16, borderBottom:"1px solid #f1f5f9" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Lock size={17} color="#b45309" />
            </div>
            <div>
              <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#0f172a" }}>Change Password</p>
              <p style={{ margin:0, fontSize:12, color:"#94a3b8" }}>Update your login password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {[
              { label:"Current Password",  key:"currentPassword",  placeholder:"Enter current password" },
              { label:"New Password",       key:"newPassword",       placeholder:"Min 6 characters" },
              { label:"Confirm New Password", key:"confirmPassword", placeholder:"Repeat new password" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#64748b", display:"block", marginBottom:6 }}>
                  {label}
                </label>
                <input
                  type="password"
                  value={passForm[key]}
                  onChange={e => setPassForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  style={inp()} {...focus}
                />
              </div>
            ))}

            <button type="submit" disabled={changing} style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              padding:"11px", borderRadius:10, border:"none",
              background: changing ? "#fde68a" : "#b45309",
              color:"#fff", fontSize:14, fontWeight:700,
              cursor: changing ? "not-allowed" : "pointer", fontFamily:"inherit",
              marginTop:4,
            }}>
              <Lock size={16} />
              {changing ? "Changing…" : "Change Password"}
            </button>
          </form>

          {/* Info box */}
          <div style={{ marginTop:20, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:10, padding:"12px 14px" }}>
            <p style={{ margin:0, fontSize:12.5, color:"#15803d", lineHeight:1.6 }}>
              💡 <strong>Why add your phone number?</strong><br />
              Your WhatsApp number shows in every reminder message sent to clients — so they can call you directly before the hearing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
