import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { Scale, Mail, Lock, ArrowRight, Shield } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(formData);
      navigate("/verify-login-otp", { state: { email: res.email } });
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'Inter',sans-serif" }}>
      {/* Left panel */}
      <div style={{
        flex:"0 0 420px", background:"linear-gradient(160deg,#0f2744 0%,#0a1c38 55%,#071428 100%)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"60px 48px", position:"relative", overflow:"hidden",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateX(-20px)",
        transition:"opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* Background circles */}
        {[["50%","5%","500px","rgba(37,99,235,0.07)"],["80%","70%","300px","rgba(180,83,9,0.05)"]].map(([t,l,s,bg],i) => (
          <div key={i} style={{ position:"absolute", top:t, left:l, width:s, height:s, borderRadius:"50%",
                                 background:bg, transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
        ))}
        <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
          <div style={{
            width:64, height:64, borderRadius:18, margin:"0 auto 24px",
            background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 32px rgba(37,99,235,0.35)",
          }}>
            <Scale size={30} color="#fff" strokeWidth={1.8} />
          </div>
          <h1 style={{ margin:"0 0 8px", fontSize:30, fontWeight:700, color:"#fff",
                       letterSpacing:"-0.5px", fontFamily:"'Playfair Display',Georgia,serif" }}>
            Legal Diary
          </h1>
          <p style={{ margin:"0 0 32px", fontSize:12, fontWeight:600, letterSpacing:"0.14em",
                      textTransform:"uppercase", color:"#b45309" }}>
            Case Management System
          </p>
          <div style={{ width:40, height:1, background:"rgba(180,83,9,0.5)", margin:"0 auto 28px" }} />
          <p style={{ margin:0, fontSize:14, fontStyle:"italic",
                      color:"rgba(255,255,255,0.45)", lineHeight:1.8, maxWidth:260 }}>
            "Justice is the foundation upon which law is built."
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        background:"#fff", padding:"48px 40px",
        opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)",
        transition:"opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
      }}>
        <div style={{ width:"100%", maxWidth:380 }}>
          <p style={{ margin:"0 0 6px", fontSize:11, fontWeight:600, letterSpacing:"0.12em",
                      textTransform:"uppercase", color:"#b45309" }}>Welcome back</p>
          <h2 style={{ margin:"0 0 6px", fontSize:30, fontWeight:700, color:"#0f172a",
                       letterSpacing:"-0.5px", fontFamily:"'Playfair Display',Georgia,serif" }}>Sign In</h2>
          <p style={{ margin:"0 0 36px", fontSize:13.5, color:"#94a3b8" }}>Access your case dashboard</p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <Field label="Email Address" name="email" type="email" icon={Mail}
              placeholder="you@lawfirm.com" value={formData.email}
              focused={focused==="email"} onFocus={()=>setFocused("email")} onBlur={()=>setFocused(null)}
              onChange={e=>setFormData({...formData,email:e.target.value})} />
            <Field label="Password" name="password" type="password" icon={Lock}
              placeholder="••••••••" value={formData.password}
              focused={focused==="password"} onFocus={()=>setFocused("password")} onBlur={()=>setFocused(null)}
              onChange={e=>setFormData({...formData,password:e.target.value})} />

            <button type="submit" disabled={loading}
              style={{
                height:48, borderRadius:12, border:"none", cursor: loading?"not-allowed":"pointer",
                background:"linear-gradient(135deg,#0f2744,#1a3a6e)",
                color:"#fff", fontSize:14.5, fontWeight:600, letterSpacing:"0.02em",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"opacity 0.15s, transform 0.15s", opacity:loading?0.7:1,
              }}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}
            >
              {loading
                ? <><Spinner /> Authenticating…</>
                : <>{`Sign In`} <ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p style={{ textAlign:"center", fontSize:13.5, color:"#94a3b8", marginTop:24 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color:"#0f2744", fontWeight:600,
              textDecoration:"none", borderBottom:"1.5px solid #b45309", paddingBottom:1 }}>
              Create account
            </Link>
          </p>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                        gap:5, marginTop:16, fontSize:11, color:"#cbd5e1" }}>
            <Shield size={12} /> Secured with 256-bit encryption
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, name, type, icon:Icon, placeholder, value, focused, onFocus, onBlur, onChange }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
    <label style={{ fontSize:11, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", color:"#64748b" }}>
      {label}
    </label>
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      background:"#f8fafc", borderRadius:12, padding:"0 14px",
      border:`1.5px solid ${focused ? "#2563eb" : "#e2e8f0"}`,
      boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.1)" : "none",
      transition:"border-color 0.15s, box-shadow 0.15s",
    }}>
      <Icon size={15} color={focused ? "#2563eb" : "#94a3b8"} strokeWidth={1.8} style={{ flexShrink:0 }} />
      <input name={name} type={type} placeholder={placeholder} value={value} required
        onFocus={onFocus} onBlur={onBlur} onChange={onChange}
        style={{ flex:1, padding:"13px 0", background:"transparent", border:"none", outline:"none",
                 fontSize:14, color:"#0f172a", fontFamily:"'Inter',sans-serif" }} />
    </div>
  </div>
);

const Spinner = () => (
  <span style={{ display:"inline-block", width:16, height:16,
                  border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff",
                  borderRadius:"50%" }} className="spin" />
);

export default LoginPage;
