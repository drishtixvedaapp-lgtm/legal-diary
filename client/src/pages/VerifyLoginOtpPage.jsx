import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyLoginOtp } from "../services/authService";
import { Scale, KeyRound, ArrowRight } from "lucide-react";

const OtpPage = ({ title, subtitle, email, onVerify, loading }) => (
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
                      background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 8px 24px rgba(37,99,235,0.35)" }}>
          <KeyRound size={26} color="#fff" strokeWidth={1.8} />
        </div>
        <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" }}>{title}</h1>
        <p style={{ margin:0, fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>
          {subtitle}<br />
          <span style={{ color:"#60a5fa", fontWeight:600 }}>{email}</span>
        </p>
      </div>

      <form onSubmit={onVerify} style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <input
          type="text" placeholder="000000" required
          style={{
            textAlign:"center", letterSpacing:"0.4em", fontSize:24, fontWeight:700,
            padding:"16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,0.15)",
            background:"rgba(255,255,255,0.07)", color:"#fff", outline:"none",
            fontFamily:"'Inter',sans-serif", width:"100%", boxSizing:"border-box",
          }}
        />
        <button type="submit" disabled={loading}
          style={{
            height:50, borderRadius:14, border:"none", cursor:loading?"not-allowed":"pointer",
            background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
            color:"#fff", fontSize:15, fontWeight:600,
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow:"0 4px 20px rgba(37,99,235,0.35)",
            opacity:loading?0.7:1, transition:"opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e=>e.currentTarget.style.transform="none"}
        >
          {loading
            ? <><Spinner /> Verifying…</>
            : <>{title} <ArrowRight size={16}/></>
          }
        </button>
      </form>
    </div>
  </div>
);

const Spinner = () => (
  <span style={{ display:"inline-block", width:16, height:16,
                  border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", borderRadius:"50%" }}
        className="spin" />
);

const VerifyLoginOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email    = location.state?.email;
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyLoginOtp({ email, otp });
      navigate(res.role === "admin" ? "/admin" : "/");
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
                        background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        boxShadow:"0 8px 24px rgba(37,99,235,0.35)" }}>
            <KeyRound size={26} color="#fff" strokeWidth={1.8} />
          </div>
          <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" }}>Verify OTP</h1>
          <p style={{ margin:0, fontSize:13.5, color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
            A one-time password was sent to<br />
            <span style={{ color:"#60a5fa", fontWeight:600 }}>{email}</span>
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
              background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
              color:"#fff", fontSize:15, fontWeight:600,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 4px 20px rgba(37,99,235,0.35)",
              opacity:loading?0.7:1, transition:"opacity 0.15s, transform 0.15s",
            }}>
            {loading ? <><Spinner/>Verifying…</> : <>Verify Login &nbsp;<ArrowRight size={16}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyLoginOtpPage;
