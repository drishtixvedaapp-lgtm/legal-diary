import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Scale, User, Mail, Lock, ArrowRight } from "lucide-react";
import { registerUser } from "../services/authService";
 
const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [focused, setFocused]             = useState(null);
  const [formData, setFormData]           = useState({
    name: "", email: "", password: "", confirmPassword: "",
  });
 
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return alert("Passwords do not match");
    setLoading(true);
    try {
      const res = await registerUser({
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
      });
      navigate("/verify-otp", { state: { email: res.email } });
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
 
  const field = (name, label, type, icon, extra) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
      }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(255,255,255,0.05)",
        border: `1.5px solid ${focused === name ? "#10b981" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 12, padding: "0 14px",
        boxShadow: focused === name ? "0 0 0 3px rgba(16,185,129,0.1)" : "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}>
        <span style={{ color: focused === name ? "#10b981" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
          {icon}
        </span>
        <input
          name={name}
          type={type}
          placeholder={label}
          value={formData[name]}
          onChange={handleChange}
          onFocus={() => setFocused(name)}
          onBlur={() => setFocused(null)}
          required
          autoComplete="off"
          style={{
            flex: 1, padding: "13px 0",
            background: "transparent", border: "none", outline: "none",
            fontSize: 14, color: "#fff",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {extra}
      </div>
    </div>
  );
 
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px 16px",
      background: "linear-gradient(135deg,#060b18 0%,#0a1128 50%,#0d1a2e 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
 
        {/* Card */}
        <div style={{
          background: "rgba(15,22,40,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
          overflow: "hidden",
        }}>
          {/* Top accent */}
          <div style={{
            height: 3,
            background: "linear-gradient(90deg,#6366f1,#10b981)",
          }} />
 
          <div style={{ padding: "36px 32px 40px" }}>
 
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: "0 auto 16px",
                background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(16,185,129,0.2))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Scale size={24} color="#10b981" />
              </div>
              <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
                Create your account
              </h1>
              <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.4)" }}>
                Join the VakilSummons Platform
              </p>
            </div>
 
            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
 
              {field("name", "Full Name", "text",
                <User size={16} />
              )}
 
              {field("email", "Email Address", "email",
                <Mail size={16} />
              )}
 
              {field("password", "Password", showPassword ? "text" : "password",
                <Lock size={16} />,
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.3)", padding: 0, display: "flex" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
 
              {field("confirmPassword", "Confirm Password", "password",
                <Lock size={16} />
              )}
 
              <div style={{ marginTop: 8 }}>
                <button type="submit" disabled={loading} style={{
                  width: "100%", height: 50, borderRadius: 12, border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  background: loading
                    ? "rgba(16,185,129,0.4)"
                    : "linear-gradient(135deg,#059669,#10b981)",
                  color: "#fff", fontSize: 15, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: loading ? "none" : "0 4px 20px rgba(16,185,129,0.3)",
                  transition: "opacity 0.15s, transform 0.15s",
                  fontFamily: "'Inter', sans-serif",
                }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff", borderRadius: "50%",
                        display: "inline-block", animation: "spin 0.7s linear infinite",
                      }} />
                      Creating account…
                    </>
                  ) : (
                    <> Create Account <ArrowRight size={16} /> </>
                  )}
                </button>
              </div>
            </form>
 
            <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(255,255,255,0.35)", marginTop: 24 }}>
              Already have an account?{" "}
              <Link to="/login" style={{
                color: "#10b981", fontWeight: 600, textDecoration: "none",
              }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
 
        <p style={{ textAlign: "center", fontSize: 11.5, color: "rgba(255,255,255,0.2)", marginTop: 20 }}>
          By registering you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
 
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
 
export default RegisterPage;