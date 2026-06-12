import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import { KeyRound, ArrowRight } from "lucide-react";

const Spinner = () => (
  <span style={{ display:"inline-block", width:16, height:16,
                  border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", borderRadius:"50%" }}
        className="spin" />
);

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email    = location.state?.email;
  const [otp, setOtp]         = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
                  background:"linear-gradient(135deg,#0f2744 0%,#0a1c38 60%,#071428 100%)",
                  fontFamily:"'Inter',sans-serif", padding:24 }}>
      <div style={{
        width:"100%", maxWidth:420, background:"rgba(255,255,255,0.05)",
        backdropFilter:"blur(20px)", borderRadius:24,
        border:"1px solid rgba(255,255,255,0.1)", padding:"48px 44px",
        boxShadow:"0 24px 60px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:56, height:56, borderRadius:16, margin:"0 auto 20px",
                        background:"linear-gradient(135deg,#15803d,#16a34a)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 8px 24px rgba(21,128,61,0.35)" }}>
            <KeyRound size={26} color="#fff" strokeWidth={1.8} />
          </div>
          <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" }}>Verify Email</h1>
          <p style={{ margin:0, fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
            OTP sent to<br />
            <span style={{ color:"#4ade80", fontWeight:600 }}>{email}</span>
          </p>
        </div>
        <form onSubmit={handleVerify} style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <input type="text" placeholder="Enter OTP" value={otp} required
            onChange={e => setOtp(e.target.value)}
            style={{
              textAlign:"center", letterSpacing:"0.4em", fontSize:22, fontWeight:700,
              padding:"16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.15)",
              background:"rgba(255,255,255,0.07)", color:"#fff", outline:"none",
              fontFamily:"'Inter',sans-serif", width:"100%", boxSizing:"border-box",
            }} />
          <button type="submit" disabled={loading}
            style={{
              height:50, borderRadius:14, border:"none", cursor:loading?"not-allowed":"pointer",
              background:"linear-gradient(135deg,#16a34a,#15803d)",
              color:"#fff", fontSize:15, fontWeight:600,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 20px rgba(21,128,61,0.35)",
              opacity:loading?0.7:1, transition:"opacity 0.15s",
            }}>
            {loading ? <><Spinner/>Verifying…</> : <>Verify OTP &nbsp;<ArrowRight size={16}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
