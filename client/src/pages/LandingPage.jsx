import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   TOKENS — dark label system. Amber and teal are type/dot/rule only.
═══════════════════════════════════════════════════════════════ */
const GROUND   = "#0A0C0E";
const GROUND2  = "#101317";
const INK      = "#EDE7DC";
const INK2     = "#9EA5A8";
const MUTED    = "#6C7378";
const AMBER    = "#E8913C";
const TEAL     = "#2E6B72";
const HAIRLINE = "rgba(237,231,220,.13)";

const DISPLAY = "'Syne', sans-serif";
const SANS    = "'Sora', sans-serif";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(prefersReducedMotion());
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(Math.max(t, 0), 1);

/* ═══════════════════════════════════════════════════════════════
   PORTAL HERO — sticky stage, two panels part outward, the seal
   settles from overscale, a duotone rises, two dots travel to the
   corners, and the wordmark grows + tightens + splits — all bound
   to scroll position within the hero's own scroll range.
═══════════════════════════════════════════════════════════════ */
const HERO_VH = 2.4;

const PortalHero = ({ navigate }) => {
  const reduced = prefersReducedMotion();
  const heroRef = useRef(null);
  const leftSpanRef = useRef(null);
  const rightSpanRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [halfWidths, setHalfWidths] = useState({ l: 0, r: 0 });

  useEffect(() => {
    const measure = () => {
      setHalfWidths({
        l: leftSpanRef.current ? leftSpanRef.current.getBoundingClientRect().width / 2 : 0,
        r: rightSpanRef.current ? rightSpanRef.current.getBoundingClientRect().width / 2 : 0,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (reduced) { setProgress(1); return; }
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const range = vh * HERO_VH - vh;
        setProgress(clamp01(window.scrollY / Math.max(range, 1)));
        raf = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  const p = progress;
  const panelShift = lerp(0, 100, p);       // % — travels past its own edge
  const imgScale = lerp(1.16, 1, p);
  const duotoneOp = lerp(0, 0.32, p);
  const dotTravel = lerp(0, 1, p);
  const wordScale = lerp(1, 1.9, p);
  const wordTrack = lerp(-0.01, -0.055, p); // em — tightens
  const leftShift = -halfWidths.l * p;
  const rightShift = halfWidths.r * p;

  return (
    <section ref={heroRef} style={{ height: `${HERO_VH * 100}vh`, position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
        isolation: "isolate",
      }}>
        {/* Full-bleed image, overscaled settling to 1 */}
        <img
          src="/brand/photos/hero-gavel.jpg"
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 45%",
            transform: `scale(${imgScale})`, filter: "brightness(0.92)",
          }}
        />
        {/* Duotone wash pulled from the two accents */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(135deg, ${AMBER}, ${TEAL})`,
          mixBlendMode: "overlay", opacity: duotoneOp,
        }} />
        {/* Radial veil */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(10,12,14,0.85) 100%)",
        }} />

        {/* Two accent dots travelling to opposite corners */}
        <div style={{
          position: "absolute", top: `${50 - dotTravel * 38}%`, left: `${50 - dotTravel * 40}%`,
          width: 8, height: 8, borderRadius: "50%", background: AMBER,
          transform: "translate(-50%,-50%)", opacity: reduced ? 1 : lerp(0.3, 1, dotTravel),
        }} />
        <div style={{
          position: "absolute", top: `${50 + dotTravel * 38}%`, left: `${50 + dotTravel * 40}%`,
          width: 8, height: 8, borderRadius: "50%", background: TEAL,
          transform: "translate(-50%,-50%)", opacity: reduced ? 1 : lerp(0.3, 1, dotTravel),
        }} />

        {/* Split, growing, tightening wordmark */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          display: "flex", alignItems: "baseline", zIndex: 3, pointerEvents: "none",
        }}>
          <span ref={leftSpanRef} style={{
            fontFamily: DISPLAY, fontWeight: 800, color: INK,
            fontSize: "clamp(34px,7vw,96px)",
            transform: `scale(${wordScale}) translateX(${leftShift}px)`,
            letterSpacing: `${wordTrack}em`, display: "inline-block",
          }}>VAKIL</span>
          <span ref={rightSpanRef} style={{
            fontFamily: DISPLAY, fontWeight: 800, color: INK,
            fontSize: "clamp(34px,7vw,96px)",
            transform: `scale(${wordScale}) translateX(${rightShift}px)`,
            letterSpacing: `${wordTrack}em`, display: "inline-block",
          }}>SUMMONS</span>
        </div>

        {/* Two panels, closed at start, parting outward */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0, width: "52%",
          background: GROUND, zIndex: 2,
          transform: `translateX(${-panelShift}%)`,
        }} />
        <div style={{
          position: "absolute", top: 0, bottom: 0, right: 0, width: "52%",
          background: GROUND, zIndex: 2,
          transform: `translateX(${panelShift}%)`,
        }} />

        {/* Corner metadata */}
        <div style={{ position: "absolute", top: 76, left: 28, zIndex: 4, fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: INK2 }}>
          VakilSummons<span style={{ color: AMBER }}>.</span> Est. 2026
        </div>
        <div style={{ position: "absolute", top: 76, right: 28, zIndex: 4, fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: INK2 }}>
          Court System — India
        </div>
        <div style={{ position: "absolute", bottom: 28, left: 28, zIndex: 4, fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: INK2 }}>
          File No. VS/2026
        </div>
        <div style={{ position: "absolute", bottom: 28, right: 28, zIndex: 4, display: "flex", gap: 10 }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "10px 22px", borderRadius: 999, border: `1px solid ${INK}`,
              background: "transparent", color: INK, cursor: "pointer",
            }}
          >Sign In</button>
        </div>
      </div>
    </section>
  );
};

/* ── Hint text below the deck ── */
const CASE_DECK = [
  { key: "Civil",      icon: "⚖️", forum: "District Court",              structure: "Plaintiff vs Defendant" },
  { key: "Criminal",   icon: "🚔", forum: "District / Sessions Court",    structure: "Prosecution vs Accused" },
  { key: "Family",     icon: "👨‍👩‍👧", forum: "Family Court",                 structure: "Petitioner vs Respondent" },
  { key: "Consumer",   icon: "🛒", forum: "Consumer Commission",          structure: "Complainant vs Opposite Party" },
  { key: "Commercial", icon: "🏢", forum: "Commercial Court / High Court", structure: "Plaintiff vs Defendant" },
  { key: "Labour / Employment", icon: "👷", forum: "Labour Court",        structure: "Workman vs Employer" },
];

/* ═══════════════════════════════════════════════════════════════
   THROWABLE CASE-TYPE DECK — pointer drag + keyboard, physical stack
═══════════════════════════════════════════════════════════════ */
const CardDeck = () => {
  const [order, setOrder] = useState(CASE_DECK.map((_, i) => i));
  const topRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, dx: 0 });
  const deckRef = useRef(null);

  const throwCard = (dir) => {
    const el = topRef.current;
    if (!el) return;
    const w = deckRef.current?.offsetWidth || 320;
    el.style.transition = "transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.38s ease";
    el.style.transform = `translate(${dir * (w + 80)}px, -30px) rotate(${dir * 22}deg)`;
    el.style.opacity = "0";
    setTimeout(() => {
      setOrder(prev => [...prev.slice(1), prev[0]]);
      if (topRef.current) {
        topRef.current.style.transition = "none";
        topRef.current.style.transform = "translate(0,0) rotate(0deg)";
        topRef.current.style.opacity = "1";
      }
    }, 380);
  };

  const snapBack = () => {
    const el = topRef.current;
    if (!el) return;
    el.style.transition = "transform 0.28s cubic-bezier(0.22,1,0.36,1)";
    el.style.transform = "translate(0,0) rotate(0deg)";
  };

  const onPointerDown = (e) => {
    dragState.current = { dragging: true, startX: e.clientX, dx: 0 };
    topRef.current?.setPointerCapture?.(e.pointerId);
    if (topRef.current) topRef.current.style.transition = "none";
  };
  const onPointerMove = (e) => {
    if (!dragState.current.dragging || !topRef.current) return;
    const dx = e.clientX - dragState.current.startX;
    dragState.current.dx = dx;
    topRef.current.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg) scale(1.02)`;
  };
  const onPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const w = deckRef.current?.offsetWidth || 320;
    if (Math.abs(dragState.current.dx) > w * 0.1) {
      throwCard(dragState.current.dx > 0 ? 1 : -1);
    } else {
      snapBack();
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); throwCard(1); }
    if (e.key === "ArrowLeft")  { e.preventDefault(); throwCard(-1); }
  };

  const visible = order.slice(0, 4);

  return (
    <div>
      <div
        ref={deckRef}
        tabIndex={0}
        role="group"
        aria-label="Practice areas — drag or use arrow keys to browse"
        onKeyDown={onKeyDown}
        style={{
          position: "relative", width: "100%", maxWidth: 340, aspectRatio: "1 / 1",
          margin: "0 auto", touchAction: "pan-y", outline: "none",
        }}
      >
        {visible.slice().reverse().map((idx, stackPos) => {
          const depth = visible.length - 1 - stackPos; // 0 = top
          const card = CASE_DECK[idx];
          const isTop = depth === 0;
          return (
            <div
              key={idx}
              ref={isTop ? topRef : null}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              style={{
                position: "absolute", inset: 0,
                background: GROUND2,
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 0,
                padding: 28,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                transform: `translate(${depth * 6}px, ${depth * -6}px) rotate(${depth * (idx % 2 === 0 ? 1 : -1) * 1.6}deg) scale(${1 - depth * 0.03})`,
                boxShadow: isTop ? "0 20px 50px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.3)",
                cursor: isTop ? "grab" : "default",
                zIndex: 10 - depth,
                userSelect: "none",
              }}
            >
              <div>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{card.icon}</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: INK, letterSpacing: "-0.02em" }}>{card.key}</div>
              </div>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 4 }}>Forum</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: INK2, marginBottom: 12 }}>{card.forum}</div>
                <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, marginBottom: 4 }}>Party Structure</div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: INK2 }}>{card.structure}</div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, textAlign: "center", marginTop: 24 }}>
        Drag, or use ← → keys
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {CASE_DECK.map((_, i) => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: order[0] === i ? AMBER : HAIRLINE,
          }} />
        ))}
      </div>
    </div>
  );
};

const Btn = ({ children, onClick, primary, style }) => (
  <button
    onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.background = primary ? "transparent" : INK; e.currentTarget.style.color = primary ? INK : GROUND; }}
    onMouseLeave={e => { e.currentTarget.style.background = primary ? INK : "transparent"; e.currentTarget.style.color = primary ? GROUND : INK; }}
    style={{
      fontFamily: SANS, fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
      padding: "14px 28px", border: `1.5px solid ${INK}`, borderRadius: 999, cursor: "pointer",
      background: primary ? INK : "transparent", color: primary ? GROUND : INK,
      transition: "background 0.15s, color 0.15s", ...style,
    }}
  >{children}</button>
);

const Row = ({ label, name, value, delay = 0 }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{
      display: "flex", alignItems: "baseline", gap: 20, padding: "20px 0",
      borderBottom: `1px solid ${HAIRLINE}`,
      opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(14px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>
      <span style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: AMBER, flexShrink: 0, width: 130 }}>{label}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: INK, flex: 1, letterSpacing: "-0.01em" }}>{name}</span>
      <span style={{ fontFamily: SANS, fontSize: 12.5, color: INK2, whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
};

/* ── Floating circular seal for the statement fold ── */
const FloatingSeal = () => {
  const reduced = prefersReducedMotion();
  const [t, setT] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (reduced) return;
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const vh = window.innerHeight;
          setT(clamp01(1 - rect.top / vh));
        }
        raf = null;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);
  return (
    <div ref={ref} style={{
      position: "absolute", right: "-6%", top: "50%",
      width: "clamp(220px,26vw,380px)", aspectRatio: "1/1",
      transform: `translateY(${-50 + lerp(6, -6, t)}%) rotate(${lerp(-8, 8, t)}deg)`,
      opacity: 0.72, overflow: "hidden", borderRadius: "50%",
      border: `1px solid ${HAIRLINE}`,
    }}>
      <img src="/brand/photos/detail-pen.jpg" alt="" aria-hidden="true" draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [statementRef, statementVisible] = useReveal();
  const [releasesRef, releasesVisible] = useReveal();
  const [rosterRef, rosterVisible] = useReveal();
  const [closeRef, closeVisible] = useReveal();

  return (
    <div style={{ background: GROUND, color: INK, fontFamily: SANS, position: "relative", overflowX: "clip" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Sora:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        a { color: inherit; }
        .nav-link { font-family: ${SANS}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; color: ${INK2}; transition: color 0.15s; }
        .nav-link:hover { color: ${AMBER}; }
        ::selection { background: ${AMBER}; color: ${GROUND}; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition-duration: 0.001ms !important; animation-duration: 0.001ms !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 58, zIndex: 60,
        background: "rgba(10,12,14,0.75)", backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${HAIRLINE}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px,4vw,48px)",
      }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em" }}>
          VAKILSUMMONS<span style={{ color: AMBER }}>.</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <a href="#statement" className="nav-link">About</a>
          <a href="#releases" className="nav-link">Practice Areas</a>
          <a href="#close" className="nav-link">Contact</a>
          <Btn onClick={() => navigate("/login")} style={{ padding: "8px 20px", fontSize: 10.5 }}>Sign In</Btn>
        </div>
      </nav>

      <PortalHero navigate={navigate} />

      {/* ── STATEMENT FOLD ── */}
      <section id="statement" style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", padding: "0 clamp(20px,4vw,48px)", overflow: "hidden" }}>
        {/* Case-files photo, dimmed well back so text stays the focus */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img src="/brand/photos/statement-files.jpg" alt="" aria-hidden="true" draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%", opacity: 0.28 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${GROUND} 0%, ${GROUND} 30%, rgba(10,12,14,0.55) 65%, rgba(10,12,14,0.2) 100%)` }} />
        </div>
        <div ref={statementRef} style={{
          maxWidth: 620, position: "relative", zIndex: 2,
          opacity: statementVisible ? 1 : 0, transform: statementVisible ? "none" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <span style={{
            position: "absolute", top: -60, left: -20, fontFamily: DISPLAY, fontWeight: 800,
            fontSize: "clamp(160px,20vw,300px)", lineHeight: 1, color: "transparent",
            WebkitTextStroke: `1px ${HAIRLINE}`, zIndex: -1, userSelect: "none",
          }}>01</span>
          <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 20 }}>
            Why VakilSummons
          </p>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(24px,3.6vw,52px)", letterSpacing: "-0.02em", lineHeight: 1.25, maxWidth: "22ch", margin: 0 }}>
            A missed hearing costs more than time — it costs <span style={{ color: AMBER }}>trust.</span>
          </h2>
        </div>
        <FloatingSeal />
      </section>

      {/* ── RELEASES → PRACTICE AREAS ── */}
      <section id="releases" style={{ padding: "min(12vw,120px) clamp(20px,4vw,48px)", maxWidth: 1180, margin: "0 auto" }}>
        <div ref={releasesRef} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,90px)", alignItems: "center",
          opacity: releasesVisible ? 1 : 0, transform: releasesVisible ? "none" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 18 }}>
              Practice Areas
            </p>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(28px,3.4vw,46px)", letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 20px" }}>
              Six courts.<br/><span style={{ color: TEAL }}>One system.</span>
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14, color: INK2, lineHeight: 1.8, marginBottom: 36, maxWidth: 400 }}>
              Every matter filed with proper party structure — appellant, respondent,
              forum and stage — whichever court it belongs to.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <Btn primary onClick={() => navigate("/login")}>Sign In</Btn>
              <Btn onClick={() => navigate("/register")}>Start Free</Btn>
            </div>
          </div>
          <CardDeck />
        </div>
      </section>

      {/* ── ROSTER ── */}
      <section ref={rosterRef} style={{
        padding: "0 clamp(20px,4vw,48px) min(12vw,120px)", maxWidth: 900, margin: "0 auto",
        opacity: rosterVisible ? 1 : 0, transform: rosterVisible ? "none" : "translateY(20px)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}>
        <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, marginBottom: 20 }}>
          Forums Supported
        </p>
        <Row label="ROSTER" name="District Forum"        value="Supported" delay={0} />
        <Row label="ROSTER" name="Consumer Commission"   value="Supported" delay={60} />
        <Row label="ROSTER" name="High Court"             value="Supported" delay={120} />
        <Row label="ROSTER" name="Labour Court"           value="Supported" delay={180} />
        <Row label="ROSTER" name="Family Court"           value="Supported" delay={240} />

        <p style={{ fontFamily: SANS, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, margin: "56px 0 20px" }}>
          Reminder Schedule
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
            <thead>
              <tr>
                {["Stage", "Timing", "Channel", "Languages"].map(h => (
                  <th key={h} style={{ textAlign: "left", fontFamily: SANS, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, borderBottom: `1px solid ${HAIRLINE}`, padding: "0 0 12px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Evening Reminder", "8:00 PM (day before)", "WhatsApp + Email", "EN / HI / TE"],
                ["Morning Reminder", "7:00 AM (day of)",      "WhatsApp + Email", "EN / HI / TE"],
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: INK, padding: "16px 0", borderBottom: `1px solid ${HAIRLINE}` }}>{row[0]}</td>
                  {row.slice(1).map((c, j) => (
                    <td key={j} style={{ fontFamily: SANS, fontSize: 13, color: INK2, padding: "16px 0", borderBottom: `1px solid ${HAIRLINE}` }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CLOSE ── */}
      <section id="close" style={{ background: GROUND2, paddingTop: "min(10vw,100px)" }}>
        <div ref={closeRef} style={{
          padding: "0 clamp(20px,4vw,48px)", maxWidth: 900, margin: "0 auto",
          opacity: closeVisible ? 1 : 0, transform: closeVisible ? "none" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: "clamp(28px,4vw,52px)", letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 18px" }}>
            Justice, <span style={{ color: AMBER }}>on schedule.</span>
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 13.5, color: INK2, lineHeight: 1.8, marginBottom: 40, maxWidth: 460 }}>
            Built for advocates practising in Indian courts. No hearing left to memory.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, paddingBottom: 40 }}>
            <Btn primary onClick={() => navigate("/login")}>Sign In</Btn>
            <Btn onClick={() => navigate("/register")}>Start Free</Btn>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${HAIRLINE}`, padding: "18px clamp(20px,4vw,48px)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>© {new Date().getFullYear()} VakilSummons</span>
          <span style={{ fontFamily: SANS, fontSize: 11, color: MUTED }}>Your Rights. Our Duty. Justice Delivered.</span>
        </div>
        <div style={{ overflow: "hidden", padding: "0 0 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "103%", marginLeft: "-1.5%", transform: "translateY(16px)" }}>
            {"VAKILSUMMONS".split("").map((ch, i) => (
              <span key={i} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(24px,7vw,90px)", color: INK, letterSpacing: "-0.02em", lineHeight: 1 }}>{ch}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
