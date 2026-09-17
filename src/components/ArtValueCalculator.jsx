import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── Inline style helpers ──────────────────────────────────────────────────────
const G = {
  bg: "#0B0B0B",
  red: "#E50914",
  redDim: "#B8070F",
  redGlow: "rgba(229,9,20,0.18)",
  white: "#FFFFFF",
  grey: "#1A1A1A",
  greyMid: "#2A2A2A",
  greyText: "#888",
  greyLight: "#AAAAAA",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: ${G.bg}; color: ${G.white}; font-family: 'League Spartan', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.red}; border-radius: 2px; }
  ::selection { background: ${G.red}; color: white; }
  input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: ${G.greyMid}; outline: none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${G.red}; cursor: pointer; box-shadow: 0 0 10px ${G.redGlow}; transition: transform 0.15s; }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { opacity: 0.3; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes barFill { from { width: 0%; } to { width: var(--w); } }
  @keyframes countUp { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
  .fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  .fade-up-3 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
  .fade-up-4 { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
  .fade-in { animation: fadeIn 0.5s ease both; }
`;

// ── Calculation engine (mirrors backend) ─────────────────────────────────────
const MULTIPLIERS = {
  skill: { beginner: 1, intermediate: 1.5, professional: 2.5, master: 4 },
  rarity: { print: 1, limited: 1.5, unique: 2 },
  demand: { low: 1, medium: 1.5, high: 2 },
  brand: { new: 1, growing: 1.3, known: 1.8, established: 2.5 },
  selling: { direct: 0, platform: 0.1, gallery: 0.3 },
};

function calculateValue(form) {
  const base = form.timeSpent * form.hourlyRate + form.materialCost;
  const skillM = MULTIPLIERS.skill[form.skillLevel] || 1;
  const storyM = 1 + form.storyValue * 0.2;
  const rarityM = MULTIPLIERS.rarity[form.rarity] || 1;
  const demandM = MULTIPLIERS.demand[form.demand] || 1;
  const brandM = MULTIPLIERS.brand[form.brandValue] || 1;
  const commRate = MULTIPLIERS.selling[form.sellingMode] || 0;
  const afterSkill = base * skillM;
  const afterStory = afterSkill * storyM;
  const afterRarity = afterStory * rarityM;
  const afterDemand = afterRarity * demandM;
  const afterBrand = afterDemand * brandM;
  const comm = afterBrand * commRate;
  const final = afterBrand + comm;
  return {
    base_price: Math.round(base),
    final_price: Math.round(final),
    breakdown: {
      base: Math.round(base),
      skill: { multiplier: skillM, impact: Math.round(afterSkill - base) },
      story: { multiplier: Math.round(storyM * 100) / 100, impact: Math.round(afterStory - afterSkill) },
      rarity: { multiplier: rarityM, impact: Math.round(afterRarity - afterStory) },
      demand: { multiplier: demandM, impact: Math.round(afterDemand - afterRarity) },
      brand: { multiplier: brandM, impact: Math.round(afterBrand - afterDemand) },
      commission: { rate: commRate, amount: Math.round(comm) },
    },
  };
}

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

// ── Reusable components ───────────────────────────────────────────────────────
const Label = ({ children, hint }) => (
  <div style={{ marginBottom: 8 }}>
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: G.greyLight }}>
      {children}
    </span>
    {hint && <span style={{ fontSize: 10, color: G.greyText, marginLeft: 8, fontFamily: "'JetBrains Mono', monospace" }}>{hint}</span>}
  </div>
);

const NumberInput = ({ value, onChange, placeholder, prefix }) => (
  <div style={{ position: "relative" }}>
    {prefix && (
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: G.red, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 15, zIndex: 1 }}>
        {prefix}
      </span>
    )}
    <input
      type="number"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      placeholder={placeholder}
      style={{
        width: "100%", background: G.grey, border: `1px solid ${G.greyMid}`, borderRadius: 10, padding: prefix ? "13px 14px 13px 30px" : "13px 14px",
        color: G.white, fontSize: 15, fontFamily: "'Syne', sans-serif", fontWeight: 600, outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onFocus={e => { e.target.style.borderColor = G.red; e.target.style.boxShadow = `0 0 0 3px ${G.redGlow}`; }}
      onBlur={e => { e.target.style.borderColor = G.greyMid; e.target.style.boxShadow = "none"; }}
    />
  </div>
);

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: "100%", background: G.grey, border: `1px solid ${G.greyMid}`, borderRadius: 10, padding: "13px 40px 13px 14px",
      color: G.white, fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, outline: "none",
      cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23E50914' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
    }}
    onFocus={e => { e.target.style.borderColor = G.red; e.target.style.boxShadow = `0 0 0 3px ${G.redGlow}`; }}
    onBlur={e => { e.target.style.borderColor = G.greyMid; e.target.style.boxShadow = "none"; }}
  >
    {options.map(o => <option key={o.value} value={o.value} style={{ background: G.grey }}>{o.label}</option>)}
  </select>
);

const BreakdownBar = ({ label, value, maxValue, color = G.red, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const pct = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  useEffect(() => { const t = setTimeout(() => setWidth(pct), delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: G.greyLight }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color, fontWeight: 600 }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 6, background: G.greyMid, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(90deg, ${G.redDim}, ${color})`, borderRadius: 3, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────
export default function ArtValueCalculator() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("landing"); // landing | calculator | result | history
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("artCalcHistory") || "[]"); } catch { return []; }
  });
  const resultRef = useRef(null);

  const [form, setForm] = useState({
    timeSpent: 10, hourlyRate: 200, materialCost: 500,
    skillLevel: "intermediate", storyValue: 3,
    rarity: "unique", demand: "medium",
    brandValue: "growing", sellingMode: "direct",
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleCalculate = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const res = calculateValue(form);
      setResult(res);
      const entry = { ...res, form, id: Date.now() };
      setHistory(h => {
        const updated = [entry, ...h].slice(0, 10);
        localStorage.setItem("artCalcHistory", JSON.stringify(updated));
        return updated;
      });
      setLoading(false);
      setScreen("result");
    }, 1400);
  }, [form]);

  const handleExport = useCallback(() => {
    if (!resultRef.current) return;
    const el = resultRef.current;
    const original = el.style.transform;
    el.style.transform = "none";
    import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
      .then(() => {
        window.html2canvas(el, { backgroundColor: G.bg, scale: 2, useCORS: true }).then(canvas => {
          const link = document.createElement("a");
          link.download = `artvalue-${Date.now()}.png`;
          link.href = canvas.toDataURL();
          link.click();
          el.style.transform = original;
        });
      })
      .catch(() => {
        const msg = `🎨 My Art Value: ${fmt(result.final_price)}\nCalculated on ArtArtist · artartist.in`;
        navigator.clipboard?.writeText(msg);
        alert("Copied to clipboard! (html2canvas not available in this env)");
        el.style.transform = original;
      });
  }, [result]);

  const handleShare = useCallback(() => {
    const text = `🎨 My artwork is valued at ${fmt(result.final_price)}!\n\nCalculate yours at artartist.in\n\n#ArtArtist #ArtValue #IndianArt`;
    if (navigator.share) {
      navigator.share({ title: "Art Value Calculator", text });
    } else {
      navigator.clipboard?.writeText(text);
      alert("Value copied to clipboard!");
    }
  }, [result]);

  // ── LANDING ──
  if (screen === "landing") return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "120px 20px 40px", position: "relative", overflow: "hidden" }}>
      <style>{globalStyles}</style>
      {/* Noise texture overlay */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.6, pointerEvents: "none", zIndex: 0 }} />
      {/* Red glow sphere */}
      <div style={{ position: "absolute", top: "15%", right: "10%", width: 400, height: 400, background: `radial-gradient(circle, ${G.redGlow} 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 300, height: 300, background: `radial-gradient(circle, rgba(229,9,20,0.08) 0%, transparent 70%)`, pointerEvents: "none", zIndex: 0 }} />

      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ position: "absolute", top: 20, left: 20, background: "transparent", border: "none", color: G.greyText, cursor: "pointer", fontSize: 14, fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s", zIndex: 10 }}
        onMouseEnter={e => e.currentTarget.style.color = G.white}
        onMouseLeave={e => e.currentTarget.style.color = G.greyText}
      >
        ← Back
      </button>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 700 }}>
        {/* Brand badge */}
        <div className="fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G.grey, border: `1px solid ${G.greyMid}`, borderRadius: 40, padding: "6px 16px", marginBottom: 40 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.red, boxShadow: `0 0 8px ${G.red}` }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: G.greyLight }}>ArtArtist · India's Artist Ecosystem</span>
        </div>

        {/* Main headline */}
        <h1 className="fade-up-2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px, 10vw, 100px)", lineHeight: 0.92, letterSpacing: "0.02em", marginBottom: 28, background: `linear-gradient(135deg, #fff 30%, ${G.red} 80%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Art is an Asset,<br />Not a Liability
        </h1>

        <p className="fade-up-3" style={{ fontSize: "clamp(15px, 2.5vw, 19px)", color: G.greyLight, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 48px", fontWeight: 400 }}>
          Discover the <em style={{ color: G.white, fontStyle: "normal", fontWeight: 700 }}>true market value</em> of your artwork. Powered by real market logic — not guesswork.
        </p>

        {/* CTA */}
        <div className="fade-up-4" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setScreen("calculator")}
            style={{ background: `linear-gradient(135deg, ${G.red}, ${G.redDim})`, border: "none", borderRadius: 12, padding: "18px 48px", color: G.white, fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: "0.06em", cursor: "pointer", textTransform: "uppercase", boxShadow: `0 8px 32px ${G.redGlow}, 0 2px 8px rgba(0,0,0,0.4)`, transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = `0 16px 48px ${G.redGlow}, 0 4px 16px rgba(0,0,0,0.5)`; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 8px 32px ${G.redGlow}, 0 2px 8px rgba(0,0,0,0.4)`; }}
          >
            Calculate Your Art Value →
          </button>
          {history.length > 0 && (
            <button onClick={() => setScreen("history")} style={{ background: "transparent", border: `1px solid ${G.greyMid}`, borderRadius: 10, padding: "10px 24px", color: G.greyLight, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.06em" }}
              onMouseEnter={e => { e.target.style.borderColor = G.red; e.target.style.color = G.white; }}
              onMouseLeave={e => { e.target.style.borderColor = G.greyMid; e.target.style.color = G.greyLight; }}>
              View History ({history.length})
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="fade-up-4" style={{ display: "flex", justifyContent: "center", gap: "clamp(24px, 6vw, 60px)", marginTop: 64, paddingTop: 40, borderTop: `1px solid ${G.greyMid}` }}>
          {[["8", "Value Factors"], ["100%", "Free to Use"], ["A2C", "Zero Commission"]].map(([val, lab]) => (
            <div key={lab} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, color: G.red, letterSpacing: "0.05em" }}>{val}</div>
              <div style={{ fontSize: 11, color: G.greyText, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginTop: 4 }}>{lab}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── CALCULATOR ──
  if (screen === "calculator") return (
    <div style={{ minHeight: "100vh", background: G.bg, padding: "30px 16px 60px" }}>
      <style>{globalStyles}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <button onClick={() => setScreen("landing")} style={{ background: "transparent", border: "none", color: G.greyText, cursor: "pointer", fontSize: 13, fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.white}
            onMouseLeave={e => e.currentTarget.style.color = G.greyText}>
            ← Back
          </button>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: G.red, letterSpacing: "0.1em" }}>ArtArtist</div>
          <div style={{ fontSize: 11, color: G.greyText, textTransform: "uppercase", letterSpacing: "0.1em" }}>Value Calc</div>
        </div>

        <h2 className="fade-up-2" style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(32px, 7vw, 52px)", lineHeight: 1, marginBottom: 8, letterSpacing: "0.02em" }}>
          Price Your Art<br /><span style={{ color: G.red }}>With Confidence</span>
        </h2>
        <p className="fade-up-3" style={{ color: G.greyText, fontSize: 14, marginBottom: 36, fontStyle: "italic" }}>"Art is more than time. It's meaning."</p>

        {/* Section: Cost Inputs */}
        <div className="fade-up-3" style={{ background: G.grey, borderRadius: 20, padding: "24px 24px", marginBottom: 16, border: `1px solid ${G.greyMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: G.red, marginBottom: 20 }}>01 · Cost Foundation</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <Label hint="hrs">Time Spent</Label>
              <NumberInput value={form.timeSpent} onChange={set("timeSpent")} placeholder="0" />
            </div>
            <div>
              <Label hint="₹/hr">Hourly Rate</Label>
              <NumberInput value={form.hourlyRate} onChange={set("hourlyRate")} placeholder="0" prefix="₹" />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Label hint="₹">Material Cost</Label>
            <NumberInput value={form.materialCost} onChange={set("materialCost")} placeholder="0" prefix="₹" />
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: `rgba(229,9,20,0.06)`, borderRadius: 8, border: `1px solid rgba(229,9,20,0.15)` }}>
            <span style={{ fontSize: 12, color: G.greyText }}>Base Price → </span>
            <span style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: G.red, fontWeight: 600 }}>
              {fmt(form.timeSpent * form.hourlyRate + form.materialCost)}
            </span>
          </div>
        </div>

        {/* Section: Value Multipliers */}
        <div className="fade-up-4" style={{ background: G.grey, borderRadius: 20, padding: "24px 24px", marginBottom: 16, border: `1px solid ${G.greyMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: G.red, marginBottom: 20 }}>02 · Value Multipliers</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <Label>Skill Level</Label>
              <Select value={form.skillLevel} onChange={set("skillLevel")} options={[
                { value: "beginner", label: "Beginner (1×)" },
                { value: "intermediate", label: "Intermediate (1.5×)" },
                { value: "professional", label: "Professional (2.5×)" },
                { value: "master", label: "Master (4×)" },
              ]} />
            </div>
            <div>
              <Label>Rarity</Label>
              <Select value={form.rarity} onChange={set("rarity")} options={[
                { value: "print", label: "Print (1×)" },
                { value: "limited", label: "Limited (1.5×)" },
                { value: "unique", label: "Unique (2×)" },
              ]} />
            </div>
            <div>
              <Label>Demand</Label>
              <Select value={form.demand} onChange={set("demand")} options={[
                { value: "low", label: "Low (1×)" },
                { value: "medium", label: "Medium (1.5×)" },
                { value: "high", label: "High (2×)" },
              ]} />
            </div>
            <div>
              <Label>Brand Value</Label>
              <Select value={form.brandValue} onChange={set("brandValue")} options={[
                { value: "new", label: "New (1×)" },
                { value: "growing", label: "Growing (1.3×)" },
                { value: "known", label: "Known (1.8×)" },
                { value: "established", label: "Established (2.5×)" },
              ]} />
            </div>
          </div>
          {/* Story slider */}
          <div style={{ marginTop: 16 }}>
            <Label>Story Value <span style={{ fontFamily: "'JetBrains Mono', monospace", color: G.red }}>{form.storyValue}/5</span></Label>
            <input type="range" min={1} max={5} step={1} value={form.storyValue}
              onChange={e => set("storyValue")(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: G.red }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {["Minimal", "Some", "Notable", "Strong", "Legendary"].map((l, i) => (
                <span key={l} style={{ fontSize: 10, color: form.storyValue === i + 1 ? G.red : G.greyText, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", transition: "color 0.2s" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Selling Mode */}
        <div className="fade-up-4" style={{ background: G.grey, borderRadius: 20, padding: "24px 24px", marginBottom: 28, border: `1px solid ${G.greyMid}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: G.red, marginBottom: 20 }}>03 · Selling Mode</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ value: "direct", label: "Direct", sub: "0% commission" }, { value: "platform", label: "Platform", sub: "10% commission" }, { value: "gallery", label: "Gallery", sub: "30% commission" }].map(o => (
              <button key={o.value} onClick={() => set("sellingMode")(o.value)}
                style={{ background: form.sellingMode === o.value ? `rgba(229,9,20,0.12)` : G.greyMid, border: `2px solid ${form.sellingMode === o.value ? G.red : "transparent"}`, borderRadius: 12, padding: "14px 10px", cursor: "pointer", transition: "all 0.2s", textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: form.sellingMode === o.value ? G.white : G.greyLight }}>{o.label}</div>
                <div style={{ fontSize: 10, color: form.sellingMode === o.value ? G.red : G.greyText, marginTop: 3 }}>{o.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{ width: "100%", background: loading ? G.greyMid : `linear-gradient(135deg, ${G.red}, ${G.redDim})`, border: "none", borderRadius: 14, padding: "20px", color: G.white, fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", boxShadow: loading ? "none" : `0 8px 32px ${G.redGlow}`, transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          {loading ? (
            <>
              <div style={{ width: 18, height: 18, border: `2px solid rgba(255,255,255,0.3)`, borderTopColor: G.white, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              Calculating Your Value...
            </>
          ) : "Calculate Art Value →"}
        </button>
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: G.greyText, fontStyle: "italic" }}>
          Every artist has a price. Let's find yours.
        </p>
      </div>
    </div>
  );

  // ── RESULT ──
  if (screen === "result" && result) return (
    <div style={{ minHeight: "100vh", background: G.bg, padding: "30px 16px 60px" }}>
      <style>{globalStyles}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <button onClick={() => setScreen("calculator")} style={{ background: "transparent", border: "none", color: G.greyText, cursor: "pointer", fontSize: 13, fontFamily: "'Syne', sans-serif", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.white}
            onMouseLeave={e => e.currentTarget.style.color = G.greyText}>
            ← Recalculate
          </button>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: G.red, letterSpacing: "0.1em" }}>ArtArtist</div>
          <button onClick={() => setScreen("history")} style={{ background: "transparent", border: "none", color: G.greyText, cursor: "pointer", fontSize: 13, fontFamily: "'Syne', sans-serif", transition: "color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.white}
            onMouseLeave={e => e.currentTarget.style.color = G.greyText}>
            History
          </button>
        </div>

        {/* Result card (exportable) */}
        <div ref={resultRef}>
          {/* Final Price Card */}
          <div className="fade-up-2" style={{ background: `linear-gradient(135deg, #111 0%, #1a0305 50%, #0f0f0f 100%)`, border: `1px solid rgba(229,9,20,0.3)`, borderRadius: 24, padding: "36px 28px", marginBottom: 20, position: "relative", overflow: "hidden", textAlign: "center" }}>
            {/* Glow bg */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, background: `radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: G.greyText, marginBottom: 12 }}>Your Art Value</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: "clamp(52px, 14vw, 80px)", color: G.red, lineHeight: 1, letterSpacing: "0.02em", animation: "countUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s both", textShadow: `0 0 40px ${G.redGlow}` }}>
                {fmt(result.final_price)}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 18 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: G.greyText, textTransform: "uppercase", letterSpacing: "0.1em" }}>Base Price</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: G.greyLight, fontWeight: 600 }}>{fmt(result.base_price)}</div>
                </div>
                <div style={{ width: 1, background: G.greyMid }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: G.greyText, textTransform: "uppercase", letterSpacing: "0.1em" }}>Value Added</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#4CAF50", fontWeight: 600 }}>+{fmt(result.final_price - result.base_price)}</div>
                </div>
                <div style={{ width: 1, background: G.greyMid }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: G.greyText, textTransform: "uppercase", letterSpacing: "0.1em" }}>Multiplier</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: G.white, fontWeight: 600 }}>{result.base_price > 0 ? (result.final_price / result.base_price).toFixed(1) : "—"}×</div>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="fade-up-3" style={{ background: G.grey, borderRadius: 20, padding: "24px 24px", marginBottom: 20, border: `1px solid ${G.greyMid}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: G.red, marginBottom: 20 }}>Value Breakdown</div>
            {[
              { label: "Base Price (time + materials)", value: result.breakdown.base },
              { label: `Skill Impact (${result.breakdown.skill.multiplier}×)`, value: result.breakdown.skill.impact },
              { label: `Story Impact (${result.breakdown.story.multiplier}×)`, value: result.breakdown.story.impact },
              { label: `Rarity Boost (${result.breakdown.rarity.multiplier}×)`, value: result.breakdown.rarity.impact },
              { label: `Demand Boost (${result.breakdown.demand.multiplier}×)`, value: result.breakdown.demand.impact },
              { label: `Brand Multiplier (${result.breakdown.brand.multiplier}×)`, value: result.breakdown.brand.impact },
              { label: `Commission (${(result.breakdown.commission.rate * 100).toFixed(0)}%)`, value: result.breakdown.commission.amount, color: "#FF6B6B" },
            ].map((item, i) => (
              <BreakdownBar key={item.label} label={item.label} value={item.value} maxValue={result.final_price} color={item.color || G.red} delay={i * 80} />
            ))}
          </div>

          {/* Powered by badge */}
          <div style={{ textAlign: "center", padding: "12px", borderTop: `1px solid ${G.greyMid}` }}>
            <span style={{ fontSize: 11, color: G.greyText, letterSpacing: "0.1em" }}>POWERED BY </span>
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 14, color: G.red, letterSpacing: "0.15em" }}>ARTARTIST</span>
            <span style={{ fontSize: 11, color: G.greyText }}> · artartist.in</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="fade-up-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
          <button onClick={handleShare}
            style={{ background: G.grey, border: `1px solid ${G.greyMid}`, borderRadius: 12, padding: "14px", color: G.white, fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = G.red; e.currentTarget.style.background = `rgba(229,9,20,0.08)`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = G.greyMid; e.currentTarget.style.background = G.grey; }}>
            ↗ Share Value
          </button>
          <button onClick={handleExport}
            style={{ background: `linear-gradient(135deg, ${G.red}, ${G.redDim})`, border: "none", borderRadius: 12, padding: "14px", color: G.white, fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", boxShadow: `0 4px 16px ${G.redGlow}`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
            ↓ Export for Instagram
          </button>
        </div>

        {/* Microcopy */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: G.greyText, fontStyle: "italic", lineHeight: 1.6 }}>
          "Art is more than time. It's meaning, identity, and legacy.<br />Price it like it matters — because it does."
        </p>
        <p style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: G.greyText }}>
          Join ArtArtist · India's zero-commission artist ecosystem
        </p>
      </div>
    </div>
  );

  // ── HISTORY ──
  if (screen === "history") return (
    <div style={{ minHeight: "100vh", background: G.bg, padding: "30px 16px 60px" }}>
      <style>{globalStyles}</style>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <button onClick={() => setScreen("landing")} style={{ background: "transparent", border: "none", color: G.greyText, cursor: "pointer", fontSize: 13, fontFamily: "'Syne', sans-serif" }}>← Back</button>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: G.red, letterSpacing: "0.1em" }}>ArtArtist</div>
          <button onClick={() => { setHistory([]); localStorage.removeItem("artCalcHistory"); }} style={{ background: "transparent", border: "none", color: G.greyText, cursor: "pointer", fontSize: 12, fontFamily: "'Syne', sans-serif" }}>Clear All</button>
        </div>

        <h2 className="fade-up-2" style={{ fontFamily: "'Bebas Neue'", fontSize: 42, marginBottom: 28, letterSpacing: "0.02em" }}>
          Calculation <span style={{ color: G.red }}>History</span>
        </h2>

        {history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: G.greyText }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎨</div>
            <p style={{ fontSize: 16 }}>No calculations yet.<br />Start by pricing your artwork!</p>
            <button onClick={() => setScreen("calculator")} style={{ marginTop: 24, background: `linear-gradient(135deg, ${G.red}, ${G.redDim})`, border: "none", borderRadius: 10, padding: "14px 32px", color: G.white, fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer" }}>
              Calculate Now →
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {history.map((item, i) => (
              <div key={item.id} className="fade-up" style={{ background: G.grey, borderRadius: 16, padding: "20px 22px", border: `1px solid ${G.greyMid}`, transition: "border-color 0.2s", animationDelay: `${i * 0.05}s`, cursor: "pointer" }}
                onClick={() => { setResult(item); setScreen("result"); }}
                onMouseEnter={e => e.currentTarget.style.borderColor = G.red}
                onMouseLeave={e => e.currentTarget.style.borderColor = G.greyMid}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 600, color: G.red }}>{fmt(item.final_price)}</div>
                    <div style={{ fontSize: 11, color: G.greyText, marginTop: 4 }}>Base: {fmt(item.base_price)} · {new Date(item.id).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: G.greyLight, textTransform: "capitalize" }}>{item.form?.skillLevel} · {item.form?.rarity}</div>
                    <div style={{ fontSize: 11, color: G.greyText, marginTop: 2 }}>{(item.final_price / item.base_price).toFixed(1)}× growth</div>
                  </div>
                </div>
                <div style={{ height: 3, background: G.greyMid, borderRadius: 2, marginTop: 14, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((item.final_price / 200000) * 100, 100)}%`, background: `linear-gradient(90deg, ${G.redDim}, ${G.red})`, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
