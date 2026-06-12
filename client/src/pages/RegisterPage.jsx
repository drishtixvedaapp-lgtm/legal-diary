import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Scale, User, Mail, Lock } from "lucide-react";
import { registerUser } from "../services/authService";
 
const FloatingInput = ({
  icon: Icon,
  type,
  name,
  label,
  value,
  onChange,
  required,
  rightSlot,
}) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
 
  return (
    <div className="relative group">
      <div
        className={`
          absolute inset-0 rounded-xl transition-all duration-300
          ${active ? "ring-1 ring-emerald-500/60 shadow-[0_0_12px_2px_rgba(16,185,129,0.08)]" : ""}
        `}
        aria-hidden="true"
      />
 
      {/* Icon */}
      <div
        className={`
          absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200
          ${active ? "text-emerald-400" : "text-slate-500"}
        `}
      >
        <Icon size={16} />
      </div>
 
      {/* Floating label */}
      <label
        htmlFor={name}
        className={`
          absolute left-11 transition-all duration-200 pointer-events-none select-none
          ${active
            ? "top-2 text-[10px] font-semibold tracking-widest uppercase text-emerald-400"
            : "top-1/2 -translate-y-1/2 text-sm text-slate-400"
          }
        `}
      >
        {label}
      </label>
 
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete="off"
        className={`
          w-full bg-slate-800/60 border border-slate-700/80 rounded-xl
          px-4 pl-11 text-white text-sm
          transition-all duration-200
          focus:outline-none focus:border-emerald-500/70 focus:bg-slate-800
          placeholder-transparent
          ${active ? "pt-6 pb-2" : "py-4"}
          ${rightSlot ? "pr-12" : ""}
        `}
      />
 
      {rightSlot && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
};
 
const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    });
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match");
    }
    try {
      setLoading(true);
      const response = await registerUser(formData);
      navigate("/verify-otp", { state: { email: response.email } });
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060B18 0%, #0A1128 50%, #0D1A2E 100%)" }}
    >
      {/* Dot-grid background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
 
      {/* Ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-[-120px] w-[480px] h-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
        }}
      />
 
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Card */}
        <div
          className="rounded-2xl border border-slate-700/60 shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{ background: "rgba(15,22,40,0.92)", backdropFilter: "blur(20px)" }}
        >
          {/* Top accent bar */}
          <div
            className="h-[3px] w-full"
            style={{
              background: "linear-gradient(90deg, #6366F1 0%, #10B981 100%)",
            }}
          />
 
          <div className="px-8 pt-8 pb-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(16,185,129,0.2) 100%)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <Scale size={22} className="text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Join the Legal Diary Platform
              </p>
            </div>
 
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <FloatingInput
                icon={User}
                type="text"
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
 
              <FloatingInput
                icon={Mail}
                type="email"
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FloatingInput
                icon={Lock}
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-300 transition-colors duration-150 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
 
              <FloatingInput
                icon={Lock}
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
 
              {/* Divider */}
              <div className="pt-2" />
 
              <button
                type="submit"
                disabled={loading}
                className="relative w-full rounded-xl py-3.5 text-sm font-semibold text-white overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 disabled:cursor-not-allowed group"
                style={{
                  background: loading
                    ? "rgba(16,185,129,0.4)"
                    : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                  boxShadow: loading
                    ? "none"
                    : "0 4px 20px rgba(16,185,129,0.25)",
                }}
              >
                {/* Shimmer */}
                {!loading && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </span>
              </button>
            </form>
 
            {/* Footer link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-150"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
 
        {/* Sub-footer */}
        <p className="mt-5 text-center text-xs text-slate-600">
          By registering you agree to our{" "}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          &amp;{" "}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};
 
export default RegisterPage;