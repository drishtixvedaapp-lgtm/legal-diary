import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Design tokens ── */
const NAVY   = "#0f2744";
const NAVY2  = "#162f52";
const GOLD   = "#c9a84c";
const GOLD2  = "#e8c96a";
const CREAM  = "#faf8f3";
const WHITE  = "#ffffff";

/* ── Inline style helpers ── */
const s = (obj) => obj;

/* ── Animated counter ── */
const Counter = ({ to, duration = 1500 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(p * to));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}</span>;
};

/* ── Scroll reveal hook ── */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ── Lady Justice SVG (pure geometric, no copyright) ── */
const JusticeSVG = ({ animated }) => (
  <svg viewBox="0 0 200 280" width="200" height="280" style={{ overflow:"visible" }}>
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    {/* Laurel wreath circle */}
    <circle cx="100" cy="110" r="95" fill="none" stroke={GOLD} strokeWidth="1.5" opacity="0.4"/>

    {/* Scales */}
    {/* Center pole */}
    <line x1="100" y1="30" x2="100" y2="150" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
    {/* Crossbar */}
    <line x1="40" y1="60" x2="160" y2="60" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Left chain */}
    <line x1="55" y1="60" x2="45" y2="95" stroke={GOLD} strokeWidth="1.5"/>
    <line x1="70" y1="60" x2="80" y2="95" stroke={GOLD} strokeWidth="1.5"/>
    {/* Right chain */}
    <line x1="130" y1="60" x2="120" y2="95" stroke={GOLD} strokeWidth="1.5"/>
    <line x1="145" y1="60" x2="155" y2="95" stroke={GOLD} strokeWidth="1.5"/>

    {/* Left pan */}
    <path d="M35,97 Q62,105 85,97" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"
          style={animated ? { transformOrigin:"62px 97px", animation:"swingL 3s ease-in-out infinite" } : {}}/>
    {/* Right pan */}
    <path d="M115,97 Q138,105 165,97" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"
          style={animated ? { transformOrigin:"140px 97px", animation:"swingR 3s ease-in-out infinite" } : {}}/>

    {/* Top knob */}
    <circle cx="100" cy="28" r="5" fill={GOLD} filter="url(#glow)"/>

    {/* Figure body — Lady Justice silhouette */}
    {/* Head */}
    <circle cx="100" cy="158" r="12" fill={NAVY} stroke={GOLD} strokeWidth="1.5"/>
    {/* Blindfold */}
    <line x1="88" y1="158" x2="112" y2="158" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Body */}
    <path d="M88,170 Q82,190 78,220 L122,220 Q118,190 112,170 Z" fill={NAVY} stroke={GOLD} strokeWidth="1"/>
    {/* Left arm (holding scales) */}
    <line x1="100" y1="175" x2="65" y2="155" stroke={NAVY} strokeWidth="8" strokeLinecap="round"/>
    <line x1="65" y1="155" x2="62" y2="140" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
    {/* Right arm (sword) */}
    <line x1="100" y1="178" x2="138" y2="195" stroke={NAVY} strokeWidth="8" strokeLinecap="round"/>
    <line x1="134" y1="192" x2="148" y2="222" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="140" y1="206" x2="154" y2="206" stroke={GOLD} strokeWidth="2" strokeLinecap="round"/>
    {/* Book at feet */}
    <rect x="78" y="218" width="44" height="8" rx="2" fill={GOLD} opacity="0.8"/>
    <line x1="100" y1="218" x2="100" y2="226" stroke={NAVY} strokeWidth="1"/>
    {/* Robe/dress bottom */}
    <path d="M78,220 Q70,240 65,255 L135,255 Q130,240 122,220 Z" fill={NAVY} stroke={GOLD} strokeWidth="0.8" opacity="0.9"/>

    {/* Court building silhouette */}
    <rect x="20" y="238" width="160" height="30" fill={NAVY} opacity="0.3"/>
    <rect x="35" y="225" width="130" height="15" fill={NAVY} opacity="0.25"/>
    {/* Columns */}
    {[50,75,100,125,150].map(x => (
      <rect key={x} x={x-3} y="210" width="6" height="30" fill={GOLD} opacity="0.15"/>
    ))}
    {/* Dome */}
    <ellipse cx="100" cy="228" rx="40" ry="15" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.3"/>

    {/* Laurel leaves - left */}
    {[-60,-45,-30,-15,0,15,30,45,60].map((a,i) => {
      const rad = (a - 90) * Math.PI / 180;
      const x = 100 + 95 * Math.cos(rad);
      const y = 110 + 95 * Math.sin(rad);
      return <ellipse key={i} cx={x} cy={y} rx="7" ry="3"
        transform={`rotate(${a+20},${x},${y})`}
        fill={GOLD} opacity="0.35"/>;
    })}
    {/* Laurel leaves - right */}
    {[120,135,150,165,180,195,210,225,240].map((a,i) => {
      const rad = (a - 90) * Math.PI / 180;
      const x = 100 + 95 * Math.cos(rad);
      const y = 110 + 95 * Math.sin(rad);
      return <ellipse key={i} cx={x} cy={y} rx="7" ry="3"
        transform={`rotate(${a-20},${x},${y})`}
        fill={GOLD} opacity="0.35"/>;
    })}

    {/* Ashoka emblem suggestion */}
    <circle cx="100" cy="18" r="7" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.6"/>
    <circle cx="100" cy="18" r="2" fill={GOLD} opacity="0.6"/>

  </svg>
);

/* ── Feature card ── */
const FeatureCard = ({ icon, title, desc, delay }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      background: `rgba(255,255,255,0.04)`,
      border: `1px solid rgba(201,168,76,0.2)`,
      borderRadius: 16,
      padding: "28px 24px",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
    }}>
      <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
      <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 600, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
};

/* ── Stat box ── */
const StatBox = ({ num, label, suffix = "+" }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ fontSize: 44, fontWeight: 800, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "-1px" }}>
        {visible ? <Counter to={num} /> : "0"}{suffix}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0=loading 1=logo 2=tagline 3=full
  const [typed, setTyped] = useState("");
  const fullName = "VAKIL SUMMONS";

  /* Entrance animation sequence */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  /* Typewriter effect */
  useEffect(() => {
    if (phase < 2) return;
    let i = 0;
    setTyped("");
    const interval = setInterval(() => {
      if (i <= fullName.length) {
        setTyped(fullName.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  const [heroRef, heroVisible] = useReveal();
  const [aboutRef, aboutVisible] = useReveal();

  return (
    <div style={{ background: NAVY, color: WHITE, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes swingL {
          0%,100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }
        @keyframes swingR {
          0%,100% { transform: rotate(3deg); }
          50%      { transform: rotate(-3deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 1; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .btn-gold {
          display: inline-flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #c9a84c, #e8c96a, #c9a84c);
          background-size: 200% auto;
          color: #0f2744; font-weight: 700; font-size: 16px;
          padding: 15px 36px; border-radius: 50px; border: none;
          cursor: pointer; letter-spacing: 0.05em;
          transition: background-position 0.5s, transform 0.2s, box-shadow 0.2s;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 24px rgba(201,168,76,0.4);
        }
        .btn-gold:hover {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(201,168,76,0.6);
        }
        .btn-outline {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent;
          color: #fff; font-weight: 500; font-size: 15px;
          padding: 14px 32px; border-radius: 50px;
          border: 1.5px solid rgba(255,255,255,0.3);
          cursor: pointer; letter-spacing: 0.03em;
          transition: all 0.2s; font-family: 'Inter', sans-serif;
        }
        .btn-outline:hover {
          border-color: #c9a84c; color: #c9a84c;
          background: rgba(201,168,76,0.08);
        }
        .nav-link {
          color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500;
          text-decoration: none; letter-spacing: 0.05em; text-transform: uppercase;
          transition: color 0.2s; padding: 6px 0;
          border-bottom: 2px solid transparent;
        }
        .nav-link:hover { color: #c9a84c; border-bottom-color: #c9a84c; }
        .gold-divider {
          width: 60px; height: 2px;
          background: linear-gradient(90deg, transparent, #c9a84c, transparent);
          margin: 16px auto;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f2744; }
        ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 3px; }
      `}</style>

      {/* ══ STICKY NAVBAR ══════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(15,39,68,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(201,168,76,0.15)",
        padding: "0 60px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36 }}>
            <svg viewBox="0 0 40 40" width="36" height="36">
              <rect width="40" height="40" rx="8" fill={GOLD} opacity="0.15"/>
              <line x1="20" y1="6" x2="20" y2="34" stroke={GOLD} strokeWidth="2"/>
              <line x1="8" y1="14" x2="32" y2="14" stroke={GOLD} strokeWidth="2"/>
              <path d="M8,16 Q14,21 20,16" fill="none" stroke={GOLD} strokeWidth="1.5"/>
              <path d="M20,16 Q26,21 32,16" fill="none" stroke={GOLD} strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, letterSpacing: "0.05em", fontFamily: "'Playfair Display', Georgia, serif" }}>VakilSummons</div>
            <div style={{ fontSize: 9, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase" }}>Court Hearing System</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <a href="#about" className="nav-link">About</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button className="btn-gold" onClick={() => navigate("/login")} style={{ fontSize: 13, padding: "9px 24px" }}>
            Sign In →
          </button>
        </div>
      </nav>

      {/* ══ HERO — ANIMATED ENTRANCE ════════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", position: "relative",
        paddingTop: 64, overflow: "hidden",
      }}>
        {/* Background radial glow */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)", pointerEvents: "none" }}/>

        {/* Rotating outer ring */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-55%)", width: 500, height: 500, border: "1px solid rgba(201,168,76,0.08)", borderRadius: "50%", animation: phase >= 1 ? "rotateSlow 40s linear infinite" : "none" }}/>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-55%)", width: 380, height: 380, border: "1px dashed rgba(201,168,76,0.06)", borderRadius: "50%", animation: phase >= 1 ? "rotateSlow 25s linear infinite reverse" : "none" }}/>

        <div style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 860, padding: "0 24px" }}>

          {/* Logo animation */}
          <div style={{
            marginBottom: 32,
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
            transition: "opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            animation: phase >= 1 ? "float 4s ease-in-out infinite 2s" : "none",
            display: "inline-block",
          }}>
            <JusticeSVG animated={phase >= 3} />
          </div>

          {/* Typewriter title */}
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(42px, 6vw, 72px)",
            fontWeight: 800,
            letterSpacing: "0.12em",
            color: WHITE,
            minHeight: "1.2em",
            marginBottom: 16,
          }}>
            {typed}
            {phase === 2 && <span style={{ animation: "pulse 0.8s infinite", borderRight: `3px solid ${GOLD}`, marginLeft: 2 }}>&nbsp;</span>}
          </div>

          {/* Gold divider */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20,
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.6s ease 0.2s",
          }}>
            <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }}/>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }}/>
            <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, ${GOLD}, transparent)` }}/>
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: "clamp(13px, 1.5vw, 16px)",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: GOLD,
            marginBottom: 12,
            fontWeight: 500,
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.6s ease 0.4s",
          }}>
            Your Rights. Our Duty. Justice Delivered.
          </p>

          <p style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.8,
            marginBottom: 44,
            maxWidth: 560,
            margin: "0 auto 44px",
            opacity: phase >= 3 ? 1 : 0,
            transition: "opacity 0.6s ease 0.6s",
          }}>
            India's first intelligent court hearing reminder system — built for advocates who refuse to let clients miss their day in court.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease 0.8s, transform 0.6s ease 0.8s",
          }}>
            <button className="btn-gold" onClick={() => navigate("/login")}>
              Enter Portal →
            </button>
            <button className="btn-outline" onClick={() => document.getElementById("about").scrollIntoView({ behavior: "smooth" })}>
              Learn More ↓
            </button>
          </div>

          {/* Scroll indicator */}
          <div style={{
            marginTop: 64,
            opacity: phase >= 3 ? 0.5 : 0,
            transition: "opacity 0.6s ease 1.2s",
            animation: phase >= 3 ? "float 2s ease-in-out infinite" : "none",
          }}>
            <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Scroll</div>
            <div style={{ width: 1, height: 40, background: `linear-gradient(180deg, ${GOLD}, transparent)`, margin: "0 auto" }}/>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "rgba(201,168,76,0.06)", borderTop: "1px solid rgba(201,168,76,0.15)", borderBottom: "1px solid rgba(201,168,76,0.15)", padding: "0 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", divideX: "1px solid rgba(201,168,76,0.15)" }}>
          {[
            { num: 500, label: "Cases Managed", suffix: "+" },
            { num: 50,  label: "Advocates",     suffix: "+"  },
            { num: 98,  label: "Reminder Rate",  suffix: "%"  },
            { num: 3,   label: "Languages",      suffix: ""   },
          ].map((s, i) => (
            <div key={i} style={{ borderRight: i < 3 ? "1px solid rgba(201,168,76,0.12)" : "none" }}>
              <StatBox {...s}/>
            </div>
          ))}
        </div>
      </section>

      {/* ══ ABOUT ═══════════════════════════════════════════════════════════════ */}
      <section id="about" style={{ padding: "100px 60px", maxWidth: 1100, margin: "0 auto" }}>
        <div ref={aboutRef} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center",
          opacity: aboutVisible ? 1 : 0,
          transform: aboutVisible ? "none" : "translateY(40px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
        }}>
          {/* Left */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Who We Are</p>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, lineHeight: 1.2, margin: "0 0 8px", color: WHITE }}>
              Built for the<br/>
              <span style={{ color: GOLD }}>Indian Courtroom</span>
            </h2>
            <div className="gold-divider" style={{ margin: "16px 0" }}/>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: 20 }}>
              VakilSummons is India's dedicated court hearing management platform — designed from the ground up for advocates practising in Indian courts, from District Forums to High Courts.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.9, marginBottom: 32 }}>
              We understand that a missed hearing can cost a client their case. Our automated reminder system sends WhatsApp messages in Telugu, Hindi and English — directly from your number — so every client knows exactly when to appear.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["Consumer Forum","High Court","District Court","Labour Court","Family Court"].map(c => (
                <span key={c} style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: GOLD, fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: 99, letterSpacing: "0.05em" }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Right — visual */}
          <div style={{ position: "relative" }}>
            <div style={{ background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 20, padding: 32, position: "relative" }}>
              {/* Quote */}
              <div style={{ fontSize: 64, color: GOLD, opacity: 0.2, fontFamily: "Georgia", lineHeight: 1, marginBottom: -20 }}>"</div>
              <p style={{ fontSize: 20, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 24 }}>
                Justice delayed is justice denied. We make sure your clients are never the reason for delay.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 2, background: GOLD }}/>
                <span style={{ fontSize: 13, color: GOLD, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>VakilSummons</span>
              </div>

              {/* WhatsApp preview card */}
              <div style={{ marginTop: 28, background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid #25D366` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>💬</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#25D366", textTransform: "uppercase", letterSpacing: "0.08em" }}>WhatsApp Reminder</span>
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                  ⚖️ <strong>Hearing Tomorrow</strong><br/>
                  📋 Business Rivalry Case | FA/494/2026<br/>
                  🏛️ A.P. State Consumer Commission<br/>
                  📅 Wednesday, 29 July 2026 (29-07-2026)
                </p>
              </div>
            </div>

            {/* Decorative corner */}
            <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, border: `2px solid rgba(201,168,76,0.3)`, borderRadius: 12, transform: "rotate(15deg)" }}/>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: "80px 60px", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>What We Offer</p>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: WHITE, margin: 0 }}>
              Everything an Advocate Needs
            </h2>
            <div className="gold-divider"/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              { icon: "💬", title: "WhatsApp Reminders", desc: "Automated reminders sent from your own WhatsApp number in Telugu, Hindi or English — 8 PM the night before and 7 AM on the day.", delay: 0 },
              { icon: "📋", title: "Case Diary", desc: "Complete litigation record — notes, documents, hearing outcomes and timeline all in one place for every case.", delay: 100 },
              { icon: "⚖️", title: "Appellant vs Respondent", desc: "Proper legal party structure — appellant, respondent, co-complainants with counsel details, exactly like a cause list.", delay: 200 },
              { icon: "📅", title: "Hearing Calendar", desc: "Visual calendar with all scheduled hearings. See at a glance which days are busy and plan accordingly.", delay: 300 },
              { icon: "🔐", title: "2-Factor Security", desc: "Login OTP verification ensures only authorised lawyers can access client data and case records.", delay: 400 },
              { icon: "🏛️", title: "All Courts Supported", desc: "District Forum, Consumer Commission, High Court, Labour Court — all case types and hearing stages supported.", delay: 500 },
            ].map((f, i) => <FeatureCard key={i} {...f}/>)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "100px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD, marginBottom: 12 }}>Simple Process</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: WHITE, margin: 0 }}>How It Works</h2>
          <div className="gold-divider"/>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 40 }}>
          {[
            { n: "01", title: "Register & Verify", desc: "Create your lawyer account with email OTP verification. Secure from day one." },
            { n: "02", title: "Add Cases & Clients", desc: "File cases with full party details — appellant, respondent, court, hearing date." },
            { n: "03", title: "Record Each Hearing", desc: "After every hearing, record the outcome and set the next date in the diary." },
            { n: "04", title: "Reminders Go Automatically", desc: "Clients receive WhatsApp and email reminders — 8 PM before and 7 AM on the day." },
          ].map(({ n, title, desc }, i) => {
            const [ref, vis] = useReveal();
            return (
              <div key={i} ref={ref} style={{ textAlign: "center", opacity: vis?1:0, transform: vis?"none":"translateY(30px)", transition: `opacity 0.6s ease ${i*150}ms, transform 0.6s ease ${i*150}ms` }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", border: `2px solid rgba(201,168,76,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: GOLD }}>
                  {n}
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 600, color: WHITE, margin: "0 0 10px" }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{desc}</p>
                {i < 3 && <div style={{ position: "absolute", display: "none" }}/>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: "80px 60px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 24, padding: "60px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 300, height: 300, background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)", pointerEvents: "none" }}/>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 700, color: WHITE, margin: "0 0 12px" }}>
            Ready to manage your practice better?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", marginBottom: 36, lineHeight: 1.7 }}>
            Join advocates across Andhra Pradesh who trust VakilSummons to keep their clients informed and their cases organised.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <button className="btn-gold" onClick={() => navigate("/login")}>Sign In to Portal →</button>
            <button className="btn-outline" onClick={() => navigate("/register")}>Create Account</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: "1px solid rgba(201,168,76,0.1)", padding: "32px 60px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: WHITE }}>VakilSummons</div>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD }}/>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Your Rights. Our Duty. Justice Delivered.</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} VakilSummons. Built for Indian Advocates.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;