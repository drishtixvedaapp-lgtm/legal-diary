import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { acceptInvite } from "../services/authService";
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft, UserPlus, AlertTriangle } from "lucide-react";

const Spinner = () => (
  <span style={{ display:"inline-block", width:16, height:16,
                  border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", borderRadius:"50%" }}
        className="spin" />
);

const AcceptInvitePage = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [tokenInvalid, setTokenInvalid] = useState(false);
  const [formData, setFormData]         = useState({ password: "", confirmPassword: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTokenInvalid(false);

    if (formData.password.length < 8)
      return setError("Password must be at least 8 characters long.");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      await acceptInvite({ token, password: formData.password });
      navigate("/login", { state: { message: "Account set up successfully. Please sign in with your new password." } });
    } catch (err) {
      const status  = err.response?.status;
      const message = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
      if (status === 400 || status === 401 || status === 404) setTokenInvalid(true);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"linear-gradient(135deg,#0f2744 0%,#0a1c38 60%,#071428 100%)",
                  fontFamily:"'Inter',sans-serif", padding:24 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width:"100%", maxWidth:420, background:"rgba(255,255,255,0.05)",
        backdropFilter:"blur(20px)", borderRadius:24,
        border:"1px solid rgba(255,255,255,0.1)", padding:"48px 44px",
        boxShadow:"0 24px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 20px",
                        background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 8px 24px rgba(37,99,235,0.35)" }}>
            <UserPlus size={26} color="#fff" strokeWidth={1.8} />
          </div>
          <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" }}>
            Set up your account
          </h1>
          <p style={{ margin:0, fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
            You've been invited to VakilSummons — choose a password to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em",
                            textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
              Password
            </label>
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              background:"rgba(255,255,255,0.07)", borderRadius:14, padding:"0 14px",
              border:"1.5px solid rgba(255,255,255,0.15)",
            }}>
              <Lock size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.8} style={{ flexShrink:0 }} />
              <input name="password" type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters" value={formData.password} required
                onChange={handleChange}
                style={{ flex:1, padding:"15px 0", background:"transparent", border:"none", outline:"none",
                         fontSize:14, color:"#fff", fontFamily:"'Inter',sans-serif" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ background:"none", border:"none", cursor:"pointer",
                          color:"rgba(255,255,255,0.3)", padding:0, display:"flex" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em",
                            textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
              Confirm Password
            </label>
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              background:"rgba(255,255,255,0.07)", borderRadius:14, padding:"0 14px",
              border:"1.5px solid rgba(255,255,255,0.15)",
            }}>
              <Lock size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.8} style={{ flexShrink:0 }} />
              <input name="confirmPassword" type={showPassword ? "text" : "password"}
                placeholder="Re-enter password" value={formData.confirmPassword} required
                onChange={handleChange}
                style={{ flex:1, padding:"15px 0", background:"transparent", border:"none", outline:"none",
                         fontSize:14, color:"#fff", fontFamily:"'Inter',sans-serif" }} />
            </div>
          </div>

          {error && (
            <div style={{
              display:"flex", alignItems:"flex-start", gap:8,
              background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)",
              borderRadius:10, padding:"10px 12px",
            }}>
              <AlertTriangle size={15} color="#f87171" style={{ flexShrink:0, marginTop:1 }} />
              <div>
                <p style={{ margin:0, fontSize:13, color:"#f87171", lineHeight:1.6 }}>{error}</p>
                {tokenInvalid && (
                  <p style={{ margin:"4px 0 0", fontSize:12.5, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>
                    This invite link may have expired or already been used. Please ask the
                    person who invited you to send a new invite.
                  </p>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{
              height:50, borderRadius:14, border:"none", cursor:loading?"not-allowed":"pointer",
              background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
              color:"#fff", fontSize:15, fontWeight:600,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 20px rgba(37,99,235,0.35)",
              opacity:loading?0.7:1, transition:"opacity 0.15s, transform 0.15s",
            }}>
            {loading ? <><Spinner/>Setting up…</> : <>Activate Account &nbsp;<ArrowRight size={16}/></>}
          </button>
        </form>

        <p style={{ textAlign:"center", fontSize:13.5, color:"rgba(255,255,255,0.4)", marginTop:28 }}>
          <Link to="/login" style={{
            color:"#60a5fa", fontWeight:600, textDecoration:"none",
            display:"inline-flex", alignItems:"center", gap:6,
          }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
