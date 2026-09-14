import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import { Mail, ArrowRight, ArrowLeft, MailCheck } from "lucide-react";

const Spinner = () => (
  <span style={{ display:"inline-block", width:16, height:16,
                  border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", borderRadius:"50%" }}
        className="spin" />
);

const ForgotPasswordPage = () => {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
                        background: sent ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#1d4ed8,#2563eb)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow: sent ? "0 8px 24px rgba(16,185,129,0.35)" : "0 8px 24px rgba(37,99,235,0.35)" }}>
            {sent ? <MailCheck size={26} color="#fff" strokeWidth={1.8} /> : <Mail size={26} color="#fff" strokeWidth={1.8} />}
          </div>
          <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" }}>
            {sent ? "Check your inbox" : "Forgot password?"}
          </h1>
          <p style={{ margin:0, fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
            {sent
              ? "If an account exists with that email, check your inbox for a reset link."
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:10,
              background:"rgba(255,255,255,0.07)", borderRadius:14, padding:"0 14px",
              border:"1.5px solid rgba(255,255,255,0.15)",
            }}>
              <Mail size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.8} style={{ flexShrink:0 }} />
              <input type="email" placeholder="you@lawfirm.com" value={email} required
                onChange={e => setEmail(e.target.value)}
                style={{ flex:1, padding:"15px 0", background:"transparent", border:"none", outline:"none",
                         fontSize:14, color:"#fff", fontFamily:"'Inter',sans-serif" }} />
            </div>

            {error && (
              <p style={{ margin:0, fontSize:13, color:"#f87171", lineHeight:1.6 }}>{error}</p>
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
              {loading ? <><Spinner/>Sending…</> : <>Send Reset Link &nbsp;<ArrowRight size={16}/></>}
            </button>
          </form>
        )}

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

export default ForgotPasswordPage;
