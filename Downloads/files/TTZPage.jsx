"use client";

import { useState, useEffect, useRef } from "react";

/* ── TOKENS ── */
const Y    = "#f5c400";
const YD   = "#c49a00";
const YL   = "#ffe566";
const BG   = "#060606";
const CARD = "rgba(255,255,255,0.035)";

/* ── GLOBAL CSS (injected once) ── */
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #060606; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: #060606; }
  ::-webkit-scrollbar-thumb { background: #f5c400; border-radius: 2px; }

  @keyframes spin  { to { transform: rotate(360deg); } }
  @keyframes spinR { to { transform: rotate(-360deg); } }
  @keyframes float {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-10px); }
  }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 20px rgba(245,196,0,0.18), 0 0 60px rgba(245,196,0,0.07); }
    50%      { box-shadow: 0 0 40px rgba(245,196,0,0.38), 0 0 100px rgba(245,196,0,0.13); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes rexora-glow {
    0%,100% { text-shadow: 0 0 12px rgba(245,196,0,0.55), 0 0 28px rgba(245,196,0,0.28); }
    50%      { text-shadow: 0 0 24px rgba(245,196,0,0.9), 0 0 56px rgba(245,196,0,0.45), 0 0 80px rgba(245,196,0,0.22); }
  }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes bannerShimmer {
    0%   { background-position: -300% center; }
    100% { background-position:  300% center; }
  }
  @keyframes wa-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(37,211,102,0.45); }
    50%      { box-shadow: 0 0 0 10px rgba(37,211,102,0); }
  }
`;

/* ══════════════════════════════════════
   PARTICLES
══════════════════════════════════════ */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.2 + 0.2,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.55 + 0.08,
      gold: Math.random() > 0.68,
    }));
    const frame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(245,196,0,${p.a})`
          : `rgba(255,255,255,${p.a * 0.22})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ══════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════ */
function Loader({ done }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setPct(p => { if (p >= 100) { clearInterval(iv); return 100; } return p + 3; });
    }, 35);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, background: BG,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: done ? 0 : 1, pointerEvents: done ? "none" : "all",
      transition: "opacity 0.9s ease",
    }}>
      <div style={{ position: "relative", width: 110, height: 110, marginBottom: 28 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: Y, borderRightColor: Y + "44",
          animation: "spin 1.1s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 14, borderRadius: "50%",
          border: "1px solid " + Y + "33", borderBottomColor: Y,
          animation: "spinR 0.8s linear infinite",
        }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: "white", letterSpacing: "4px" }}>TTZ</span>
        </div>
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: Y, letterSpacing: "6px", marginBottom: 28 }}>
        FITNESS REDEFINED
      </div>
      <div style={{ width: 190, height: 1, background: "rgba(255,255,255,0.07)", borderRadius: 1, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${YD},${Y},${YL})`, transition: "width 0.08s linear" }} />
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "3px" }}>
        {pct}%
      </div>
      <div style={{ position: "absolute", bottom: 24, fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: Y + "88", letterSpacing: "4px", animation: "rexora-glow 2.5s ease-in-out infinite" }}>
        POWERED BY REXORA MEDIA
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   TOP REXORA BANNER
══════════════════════════════════════ */
function RexoraBanner() {
  const [hov, setHov] = useState(false);
  return (
    <div style={{
      position: "relative", zIndex: 50,
      background: "linear-gradient(90deg,rgba(245,196,0,0.06),rgba(245,196,0,0.14),rgba(245,196,0,0.06))",
      borderBottom: "1px solid rgba(245,196,0,0.22)",
      padding: "11px 24px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg,transparent 10%,rgba(245,196,0,0.12) 50%,transparent 90%)",
        backgroundSize: "300% 100%",
        animation: "bannerShimmer 3.5s linear infinite",
        pointerEvents: "none",
      }} />
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: "rgba(245,196,0,0.55)", letterSpacing: "3px", position: "relative" }}>
        CRAFTED BY
      </div>
      <a
        href="https://www.instagram.com/rexora.media/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: hov ? 22 : 20,
          letterSpacing: hov ? "10px" : "6px",
          color: Y, textDecoration: "none",
          animation: "rexora-glow 2.5s ease-in-out infinite",
          transition: "all 0.3s ease", position: "relative",
        }}
      >
        REXORA MEDIA
      </a>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: "rgba(245,196,0,0.45)", letterSpacing: "3px", position: "relative" }}>
        · DIGITAL INNOVATION
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   ROTATING ORB
══════════════════════════════════════ */
function Orb() {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    let raf;
    const tick = () => { setAngle(a => a + 0.5); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const sx = Math.cos((angle * Math.PI) / 180);
  return (
    <div style={{ animation: "float 4s ease-in-out infinite", filter: "drop-shadow(0 0 28px rgba(245,196,0,0.5))" }}>
      <svg viewBox="0 0 170 170" width="150" height="150">
        <circle cx="85" cy="85" r="78" fill="none" stroke="rgba(245,196,0,0.2)" strokeWidth="1"
          strokeDasharray="5 4" style={{ transformOrigin: "85px 85px", transform: `rotate(${angle}deg)` }} />
        <circle cx="85" cy="85" r="63" fill="none" stroke="rgba(245,196,0,0.12)" strokeWidth="1"
          style={{ transformOrigin: "85px 85px", transform: `rotate(${-angle * 0.6}deg)` }} />
        <ellipse cx="85" cy="85" rx={Math.abs(sx * 49)} ry="49" fill="none" stroke="rgba(245,196,0,0.65)" strokeWidth="1.5" />
        <polygon points="85,47 115,62 115,92 85,107 55,92 55,62"
          fill="rgba(10,10,10,0.92)" stroke={Y} strokeWidth="1.5"
          style={{ transformOrigin: "85px 77px", transform: `scaleX(${sx})` }} />
        <text x="85" y="81" textAnchor="middle" fill="white" fontFamily="'Bebas Neue', sans-serif" fontSize="18" letterSpacing="3">TTZ</text>
        <text x="85" y="96" textAnchor="middle" fill={Y} fontFamily="'Orbitron', sans-serif" fontSize="5.5" letterSpacing="2">FITNESS</text>
        <g transform="translate(85,116)" opacity="0.85">
          <rect x="-17" y="-3" width="34" height="6" rx="1.5" fill="rgba(245,196,0,0.7)" />
          <rect x="-21" y="-5.5" width="6" height="11" rx="1.5" fill={Y} />
          <rect x="15"  y="-5.5" width="6" height="11" rx="1.5" fill={Y} />
        </g>
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════
   HERO
══════════════════════════════════════ */
function Hero({ visible }) {
  return (
    <div style={{
      textAlign: "center", padding: "44px 24px 12px",
      position: "relative", zIndex: 2,
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : "translateY(24px)",
      transition: "all 1s cubic-bezier(.23,1,.32,1) 0.1s",
    }}>
      <div style={{
        position: "absolute", top: "35%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(245,196,0,0.13) 0%,transparent 65%)",
        pointerEvents: "none",
      }} />
      <Orb />
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(48px,10vw,104px)",
        color: "white", letterSpacing: "7px", lineHeight: 0.9, marginTop: 16,
        textShadow: "0 0 60px rgba(245,196,0,0.18)",
      }}>
        TRANSFORM<br />
        <span style={{
          background: `linear-gradient(135deg,${Y},${YL},${Y})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundSize: "200% auto", animation: "shimmer 3s linear infinite",
        }}>YOUR BODY</span>
      </h1>
      <h2 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "clamp(20px,3.5vw,38px)",
        color: "rgba(255,255,255,0.14)", letterSpacing: "9px",
        marginTop: 4, marginBottom: 14,
      }}>TRANSFORM YOUR LIFE</h2>
      <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(7px,1vw,9px)", color: "rgba(255,255,255,0.38)", letterSpacing: "5px" }}>
        DISCIPLINE &nbsp;·&nbsp; STRENGTH &nbsp;·&nbsp; CONFIDENCE
      </p>
    </div>
  );
}

/* ══════════════════════════════════════
   LINK CARDS
══════════════════════════════════════ */
const LINKS = [
  { label: "JOIN TTZ NOW",     sub: "Start your transformation today",      href: "https://chat.whatsapp.com/BUaeyEsLaKSCjO1j9zuqB8",  icon: "⚡", accent: Y,         primary: true },
  { label: "MEET ARCHANA",    sub: "Your elite personal trainer",           href: "https://www.instagram.com/archannabirajdar/",        icon: "👑", accent: "#e0e0e0" },
  { label: "GOOGLE REVIEWS",  sub: "5★ rated by 500+ members",             href: "https://share.google/r4pwbOIgAQN32fshL",            icon: "★", accent: Y },
  { label: "TTZ FITNESS",     sub: "Explore our full fitness world",        href: "https://www.instagram.com/ttz_fitness_24/",          icon: "🔥", accent: "#ff9900" },
  { label: "REXORA SERVICES", sub: "Premium digital agency — our creators", href: "https://www.instagram.com/rexora.media/",            icon: "◈", accent: Y,         rexora: true },
];

function LinkCard({ item, index, visible }) {
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const delay = `${0.2 + index * 0.09}s`;

  const onMove = e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <a
      ref={ref}
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseMove={onMove}
      style={{
        display: "block", position: "relative",
        padding: item.primary ? "22px 26px" : "18px 26px",
        borderRadius: 13, overflow: "hidden",
        textDecoration: "none", cursor: "pointer",
        opacity:   visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.7s ease ${delay}, transform 0.7s cubic-bezier(.23,1,.32,1) ${delay}, box-shadow 0.3s, border-color 0.3s, background 0.3s`,
        background: item.primary
          ? hov ? "rgba(245,196,0,0.16)" : "rgba(245,196,0,0.10)"
          : item.rexora
          ? hov ? "rgba(245,196,0,0.12)" : "rgba(245,196,0,0.06)"
          : hov ? "rgba(255,255,255,0.055)" : CARD,
        border: `1px solid ${
          hov           ? item.accent + "80"
          : item.primary ? Y + "50"
          : item.rexora  ? Y + "28"
          : "rgba(255,255,255,0.08)"
        }`,
        boxShadow: hov
          ? `0 16px 48px rgba(0,0,0,0.55), 0 0 28px ${item.accent}28, inset 0 1px 0 rgba(255,255,255,0.07)`
          : item.primary
          ? "0 0 24px rgba(245,196,0,0.18), 0 4px 20px rgba(0,0,0,0.3)"
          : "0 2px 16px rgba(0,0,0,0.25)",
        animation: item.primary ? "pulse-glow 2.5s ease-in-out infinite" : "none",
        backdropFilter: "blur(18px)",
      }}
    >
      {hov && (
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle,${item.accent}18 0%,transparent 65%)`,
          left: pos.x - 100, top: pos.y - 100, pointerEvents: "none", zIndex: 0,
        }} />
      )}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: hov
          ? `linear-gradient(90deg,transparent,${item.accent}cc,transparent)`
          : item.primary ? `linear-gradient(90deg,transparent,${Y}55,transparent)` : "transparent",
        transition: "all 0.4s", zIndex: 1,
      }} />
      {item.rexora && (
        <div style={{
          position: "absolute", top: 10, right: 12,
          fontFamily: "'Orbitron', sans-serif", fontSize: 6, color: Y,
          background: "rgba(245,196,0,0.12)", border: "1px solid rgba(245,196,0,0.35)",
          borderRadius: 4, padding: "3px 7px", letterSpacing: "2px",
        }}>OUR CREATORS</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 2 }}>
        <div style={{
          width: item.primary ? 52 : 46, height: item.primary ? 52 : 46, borderRadius: 11,
          background: hov ? `${item.accent}1e` : `${item.accent}0d`,
          border: `1px solid ${hov ? item.accent + "66" : item.accent + "22"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: item.primary ? 22 : 19, flexShrink: 0,
          boxShadow: hov ? `0 0 18px ${item.accent}30` : "none",
          transition: "all 0.3s",
        }}>{item.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: item.primary ? "clamp(11px,1.5vw,13px)" : "clamp(10px,1.3vw,12px)",
            fontWeight: 700,
            color: hov ? "white" : item.primary ? Y : "rgba(255,255,255,0.88)",
            letterSpacing: "2.5px", marginBottom: 4,
            transition: "color 0.3s",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{item.label}</div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 12,
            color: item.rexora
              ? hov ? "rgba(245,196,0,0.85)" : "rgba(245,196,0,0.5)"
              : "rgba(255,255,255,0.33)",
            fontWeight: 300, transition: "color 0.3s",
          }}>{item.sub}</div>
        </div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: 17,
          color: hov ? item.accent : "rgba(255,255,255,0.16)",
          transform: hov ? "translateX(4px)" : "none",
          transition: "all 0.3s", flexShrink: 0,
        }}>→</div>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════
   ABOUT
══════════════════════════════════════ */
function About() {
  return (
    <section id="about" style={{ padding: "72px 24px 56px", position: "relative", zIndex: 2 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, color: Y + "cc", letterSpacing: "5px", marginBottom: 12 }}>ABOUT TTZ</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,6vw,60px)", color: "white", letterSpacing: "5px", marginBottom: 20 }}>
          MORE THAN A <span style={{ color: Y }}>GYM</span>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "rgba(255,255,255,0.48)", lineHeight: 2, fontWeight: 300, marginBottom: 36 }}>
          TTZ is more than a gym. It&apos;s a transformation space focused on strength, confidence,
          discipline, and lifestyle improvement. We forge athletes, build mindsets, and create
          communities that last a lifetime.
        </p>
        <div style={{
          display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap",
          padding: "24px 28px",
          background: "linear-gradient(135deg,rgba(245,196,0,0.06),rgba(255,255,255,0.02))",
          border: "1px solid rgba(245,196,0,0.18)", borderRadius: 14, backdropFilter: "blur(16px)",
        }}>
          {[["500+","MEMBERS"],["4.9★","RATING"],["10+","PROGRAMS"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: Y, letterSpacing: "2px" }}>{n}</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   WHY TTZ
══════════════════════════════════════ */
const FEATURES = [
  { icon: "🎯", title: "Expert Guidance",      desc: "Elite coaches with decades of proven results." },
  { icon: "📋", title: "Personalized Training", desc: "Custom programs built for your exact goals." },
  { icon: "🥗", title: "Nutrition Support",     desc: "Science-backed meal plans for peak performance." },
  { icon: "🔥", title: "Positive Environment",  desc: "High-energy community that lifts you higher." },
  { icon: "⚡", title: "Real Transformation",   desc: "Visible, measurable results — guaranteed." },
];

function FeatureRow({ f }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 16, padding: "15px 20px", borderRadius: 10,
        background: hov ? "rgba(245,196,0,0.06)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${hov ? "rgba(245,196,0,0.35)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
        transform: hov ? "translateX(6px)" : "none",
        backdropFilter: "blur(10px)",
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
      <div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, fontWeight: 700, color: hov ? Y : "white", letterSpacing: "2px", marginBottom: 3, transition: "color 0.3s" }}>
          {f.title.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.38)" }}>{f.desc}</div>
      </div>
    </div>
  );
}

function WhyTTZ() {
  return (
    <section id="whyttz" style={{ padding: "0 24px 72px", position: "relative", zIndex: 2 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, color: Y + "cc", letterSpacing: "5px", marginBottom: 12 }}>THE TTZ EDGE</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,6vw,58px)", color: "white", letterSpacing: "5px" }}>
          WHY CHOOSE <span style={{ color: Y }}>TTZ</span>
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FEATURES.map(f => <FeatureRow key={f.title} f={f} />)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════ */
const TESTIMONIALS = [
  { name: "RAHUL M.",  result: "Lost 18kg in 4 months",  quote: "TTZ changed my life. Archana's coaching is unmatched — precise, motivating, results-driven.", stars: 5 },
  { name: "PRIYA K.",  result: "Lean muscle in 90 days", quote: "I tried 5 gyms before TTZ. Nothing compares. The energy and community are on another level.", stars: 5 },
  { name: "ARJUN S.",  result: "28% → 12% body fat",     quote: "The personalized nutrition plan alone was worth it. My confidence is through the roof.", stars: 5 },
];

function TestCard({ t }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "22px 24px", borderRadius: 12,
        background: hov ? "rgba(245,196,0,0.06)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${hov ? "rgba(245,196,0,0.35)" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.3s", position: "relative", overflow: "hidden",
        backdropFilter: "blur(16px)",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: hov ? `linear-gradient(90deg,transparent,${Y},transparent)` : "transparent", transition: "all 0.4s" }} />
      <div style={{ color: Y, fontSize: 11, letterSpacing: "2px", marginBottom: 10 }}>{"★".repeat(t.stars)}</div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.52)", lineHeight: 1.8, fontStyle: "italic", marginBottom: 16, fontWeight: 300 }}>
        &ldquo;{t.quote}&rdquo;
      </p>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: "white", fontWeight: 700, letterSpacing: "2px" }}>{t.name}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: Y }}>{t.result}</div>
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: "0 24px 72px", position: "relative", zIndex: 2 }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, color: Y + "cc", letterSpacing: "5px", marginBottom: 12 }}>CLIENT STORIES</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,6vw,58px)", color: "white", letterSpacing: "5px" }}>
          REAL <span style={{ color: Y }}>RESULTS</span>
        </h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TESTIMONIALS.map(t => <TestCard key={t.name} t={t} />)}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   CONTACT
══════════════════════════════════════ */
function Contact() {
  const [hov, setHov] = useState(false);
  return (
    <section id="contact" style={{ padding: "0 24px 72px", position: "relative", zIndex: 2 }}>
      <div style={{
        padding: "40px 32px", borderRadius: 16, textAlign: "center",
        background: "linear-gradient(135deg,rgba(245,196,0,0.07),rgba(255,255,255,0.02))",
        border: "1px solid rgba(245,196,0,0.2)",
        backdropFilter: "blur(18px)", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,196,0,0.12),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, color: Y + "cc", letterSpacing: "5px", marginBottom: 12 }}>GET IN TOUCH</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px,5vw,54px)", color: "white", letterSpacing: "5px", marginBottom: 14 }}>
          CONNECT <span style={{ color: Y }}>WITH US</span>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.8, marginBottom: 28, fontWeight: 300 }}>
          Ready to transform? Message us on WhatsApp and take the first step toward the best version of yourself.
        </p>
        <a
          href="https://wa.link/z36oiv"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "16px 40px",
            fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "3px", color: BG,
            background: hov ? `linear-gradient(135deg,${YL},${Y})` : `linear-gradient(135deg,${Y},${YD})`,
            borderRadius: 8, textDecoration: "none",
            boxShadow: hov ? "0 0 40px rgba(245,196,0,0.55), 0 8px 32px rgba(0,0,0,0.4)" : "0 0 24px rgba(245,196,0,0.3), 0 4px 20px rgba(0,0,0,0.3)",
            transform: hov ? "scale(1.04)" : "scale(1)",
            transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
          }}
        >
          <span style={{ fontSize: 18 }}>💬</span>
          CONTACT US NOW
        </a>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════
   REXORA HIGHLIGHT
══════════════════════════════════════ */
function RexoraHighlight() {
  const [hov, setHov] = useState(false);
  return (
    <section style={{ padding: "0 24px 72px", position: "relative", zIndex: 2 }}>
      <a
        href="https://www.instagram.com/rexora.media/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "block", textDecoration: "none", padding: "34px 30px", borderRadius: 16,
          background: hov
            ? "linear-gradient(135deg,rgba(245,196,0,0.16),rgba(245,196,0,0.07),rgba(255,255,255,0.03))"
            : "linear-gradient(135deg,rgba(245,196,0,0.10),rgba(255,255,255,0.02))",
          border: `1px solid ${hov ? "rgba(245,196,0,0.7)" : "rgba(245,196,0,0.28)"}`,
          boxShadow: hov
            ? "0 0 60px rgba(245,196,0,0.18), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(245,196,0,0.18)"
            : "0 0 30px rgba(245,196,0,0.08), 0 4px 24px rgba(0,0,0,0.3)",
          transition: "all 0.4s cubic-bezier(.23,1,.32,1)",
          position: "relative", overflow: "hidden", backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ position: "absolute", top: -40, right: -40, width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,196,0,0.18),transparent 65%)", transform: hov ? "scale(1.5)" : "scale(1)", transition: "all 0.5s" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${Y}${hov ? "ee" : "77"},transparent)`, transition: "all 0.4s" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: "rgba(245,196,0,0.6)", letterSpacing: "4px", marginBottom: 10 }}>
            WEBSITE DESIGNED & DEVELOPED BY
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(30px,6vw,48px)", color: Y, letterSpacing: "8px", animation: "rexora-glow 2.5s ease-in-out infinite", marginBottom: 10 }}>
            REXORA MEDIA
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.38)", fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>
            Premium digital experiences for ambitious brands. We build websites, apps, and brand identities that command attention.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {["Web Design","Branding","Motion","Development"].map(tag => (
              <span key={tag} style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: 7,
                color: hov ? Y : "rgba(245,196,0,0.6)",
                border: `1px solid ${hov ? "rgba(245,196,0,0.5)" : "rgba(245,196,0,0.25)"}`,
                borderRadius: 4, padding: "4px 10px", letterSpacing: "2px", transition: "all 0.3s",
              }}>{tag}</span>
            ))}
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, color: hov ? Y : "rgba(255,255,255,0.2)", marginLeft: "auto", transform: hov ? "translateX(5px)" : "none", transition: "all 0.3s" }}>→</span>
          </div>
        </div>
      </a>
    </section>
  );
}

/* ══════════════════════════════════════
   FOOTER
══════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ padding: "28px 24px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 2, textAlign: "center" }}>
      <div style={{ overflow: "hidden", marginBottom: 20, opacity: 0.22 }}>
        <div style={{ display: "inline-flex", gap: 56, fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: Y, letterSpacing: "4px", animation: "ticker 18s linear infinite", whiteSpace: "nowrap" }}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>TTZ FITNESS · DISCIPLINE · STRENGTH · CONFIDENCE · TRANSFORM · REXORA MEDIA ·&nbsp;</span>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "white", letterSpacing: "6px", marginBottom: 5 }}>
        TTZ <span style={{ color: Y }}>FITNESS</span>
      </div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.22)", marginBottom: 18 }}>Discipline. Strength. Confidence.</div>
      <div style={{ width: 36, height: 1, background: "rgba(245,196,0,0.35)", margin: "0 auto 16px" }} />
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: "rgba(255,255,255,0.18)", letterSpacing: "3px", marginBottom: 7 }}>DESIGNED & DEVELOPED BY</div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: Y, letterSpacing: "5px", animation: "rexora-glow 3s ease-in-out infinite", marginBottom: 14 }}>REXORA MEDIA</div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, color: "rgba(255,255,255,0.13)", letterSpacing: "2px" }}>
        © {new Date().getFullYear()} TTZ FITNESS — ALL RIGHTS RESERVED
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════
   WHATSAPP FAB
══════════════════════════════════════ */
function WhatsAppFAB() {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="https://wa.link/z36oiv"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Chat on WhatsApp"
      style={{
        position: "fixed", bottom: 22, right: 22, zIndex: 500,
        width: 54, height: 54, borderRadius: "50%",
        background: hov ? "#25d366" : "#20c05c",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
        boxShadow: hov ? "0 8px 32px rgba(37,211,102,0.55)" : "0 4px 18px rgba(37,211,102,0.3)",
        transform: hov ? "scale(1.14)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
        textDecoration: "none",
        animation: "wa-pulse 2.5s ease-in-out infinite",
      }}
    >💬</a>
  );
}

/* ══════════════════════════════════════
   ROOT
══════════════════════════════════════ */
export default function TTZPage() {
  const [loaded,  setLoaded]  = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true),  1700);
    const t2 = setTimeout(() => setVisible(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div style={{ background: BG, minHeight: "100vh", color: "white", overflowX: "hidden" }}>
        <Loader done={loaded} />
        <Particles />
        <div style={{ position: "relative", zIndex: 10 }}>
          <RexoraBanner />
        </div>
        <main style={{ position: "relative", zIndex: 2, maxWidth: 620, margin: "0 auto" }}>
          <Hero visible={visible} />
          <div style={{ padding: "30px 20px 12px", display: "flex", flexDirection: "column", gap: 11 }}>
            {LINKS.map((item, i) => (
              <LinkCard key={item.label} item={item} index={i} visible={visible} />
            ))}
          </div>
          <div style={{ margin: "44px 20px 0", height: 1, background: "linear-gradient(90deg,transparent,rgba(245,196,0,0.2),transparent)" }} />
          <About />
          <div style={{ margin: "0 20px 44px", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)" }} />
          <WhyTTZ />
          <Testimonials />
          <Contact />
          <RexoraHighlight />
        </main>
        <Footer />
        <WhatsAppFAB />
      </div>
    </>
  );
}
