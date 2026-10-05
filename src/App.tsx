import { useState, type FormEvent, type ReactNode } from "react";
import { ApiError, predictIrrigation } from "./api";
import { CROPS, CROP_MAPPING, SOIL_TYPES } from "./config";
import { useLocalStorage } from "./storage";
import { DEFAULT_FARM, formatDateTime, levelOf, type FarmProfile, type HistoryRecord, type ScheduleStatus } from "./types";

type Page =
  | "welcome"
  | "setup"
  | "dashboard"
  | "advisor"
  | "explain"
  | "weather"
  | "schedule"
  | "history"
  | "responsible";

type IconName =
  | "sprout"
  | "grid"
  | "farm"
  | "spark"
  | "cloud"
  | "calendar"
  | "history"
  | "shield"
  | "menu"
  | "close"
  | "arrow"
  | "droplet"
  | "thermometer"
  | "humidity"
  | "soil"
  | "check"
  | "info"
  | "clock"
  | "trend"
  | "leaf"
  | "lock"
  | "eye"
  | "balance"
  | "usercheck"
  | "heart"
  | "globe";

const iconPaths: Record<IconName, ReactNode> = {
  sprout: <><path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12C8 12 5 9 5 5c4 0 7 2 7 7Z"/><path d="M12 15c0-4 3-7 7-7 0 4-3 7-7 7Z"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  farm: <><path d="M3 21V10l9-6 9 6v11"/><path d="M9 21v-7h6v7"/><path d="M3 10h18"/></>,
  spark: <><path d="m12 3-1.2 3.8a5 5 0 0 1-3.2 3.2L4 11.2l3.6 1.2a5 5 0 0 1 3.2 3.2L12 20l1.2-4.4a5 5 0 0 1 3.2-3.2l3.6-1.2-3.6-1.2a5 5 0 0 1-3.2-3.2Z"/></>,
  cloud: <><path d="M17.5 19H6a4 4 0 1 1 1-7.9A6 6 0 0 1 18.7 10 4.5 4.5 0 0 1 17.5 19Z"/><path d="M8 22l1-2M13 22l1-2M18 22l1-2"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="m9 16 2 2 4-5"/></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
  shield: <><path d="M12 3 4 6v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6Z"/><path d="m9 12 2 2 4-5"/></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  droplet: <path d="M12 3s6 6.2 6 11a6 6 0 1 1-12 0c0-4.8 6-11 6-11Z"/>,
  thermometer: <><path d="M14 14.8V5a3 3 0 0 0-6 0v9.8a5 5 0 1 0 6 0Z"/><path d="M11 6v11"/></>,
  humidity: <><path d="M8 4s-4 4.2-4 7.5a4 4 0 0 0 8 0C12 8.2 8 4 8 4ZM17 12s-3 3.2-3 5.5a3 3 0 0 0 6 0C20 15.2 17 12 17 12Z"/></>,
  soil: <><path d="M3 8c3-2 6-2 9 0s6 2 9 0M3 13c3-2 6-2 9 0s6 2 9 0M3 18c3-2 6-2 9 0s6 2 9 0"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  trend: <><path d="M4 18 9 13l4 3 7-9"/><path d="M15 7h5v5"/></>,
  leaf: <><path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-6 10-15Z"/><path d="M4 21c2-5 6-9 12-12"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  balance: <><path d="M12 3v18M5 6h14M5 6l-3 6h6L5 6ZM19 6l-3 6h6l-3-6ZM8 21h8"/></>,
  usercheck: <><circle cx="9" cy="8" r="4"/><path d="M2 21v-2a6 6 0 0 1 6-6h2"/><path d="m15 17 2 2 4-5"/></>,
  heart: <path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z"/>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

function Button({ children, variant = "primary", onClick, type = "button", full = false }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost"; onClick?: () => void; type?: "button" | "submit"; full?: boolean }) {
  return <button className={`button button-${variant}${full ? " button-full" : ""}`} onClick={onClick} type={type}>{children}</button>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <header className="page-heading"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</header>;
}

function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "gray" | "amber" | "blue" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Field({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return <label className="field"><span>{label}</span>{children}{note && <small>{note}</small>}</label>;
}

function MetricCard({ icon, label, value, caption, tone = "" }: { icon: IconName; label: string; value: string; caption?: string; tone?: string }) {
  return <Card className={`metric-card ${tone}`}><div className="metric-icon"><Icon name={icon}/></div><div><p className="metric-label">{label}</p><strong className="metric-value">{value}</strong>{caption && <p className="metric-caption">{caption}</p>}</div></Card>;
}

const navItems: { page: Page; label: string; icon: IconName }[] = [
  { page: "dashboard", label: "Dashboard", icon: "grid" },
  { page: "setup", label: "Farm Setup", icon: "farm" },
  { page: "advisor", label: "AI Advisor", icon: "spark" },
  { page: "weather", label: "Weather & Environment", icon: "cloud" },
  { page: "schedule", label: "Irrigation Schedule", icon: "calendar" },
  { page: "history", label: "History", icon: "history" },
  { page: "responsible", label: "Responsible AI", icon: "shield" },
];

function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? "brand-light" : ""}`}><span className="brand-mark"><Icon name="sprout" size={24}/></span><span><strong>AgriFlow AI</strong><small>Smart Irrigation Advisor</small></span></div>;
}

function AppShell({ page, setPage, children }: { page: Page; setPage: (page: Page) => void; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="app-shell">
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-head"><Brand light/><button className="icon-button close-menu" aria-label="Close menu" onClick={() => setOpen(false)}><Icon name="close"/></button></div>
      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map((item) => <button key={item.page} className={`nav-item ${page === item.page || (page === "explain" && item.page === "advisor") ? "active" : ""}`} onClick={() => { setPage(item.page); setOpen(false); }}><Icon name={item.icon}/><span>{item.label}</span></button>)}
      </nav>
      <div className="sidebar-note"><div className="note-icon"><Icon name="leaf"/></div><strong>Grow smarter</strong><p>Thoughtful irrigation starts with better information.</p></div>
    </aside>
    {open && <button className="scrim" aria-label="Close menu" onClick={() => setOpen(false)}/>}
    <div className="app-main">
      <div className="mobile-bar"><Brand/><button className="icon-button" aria-label="Open menu" onClick={() => setOpen(true)}><Icon name="menu"/></button></div>
      <main className="content">{children}</main>
    </div>
  </div>;
}

function Welcome({ setPage }: { setPage: (page: Page) => void }) {
  return <div className="welcome">
    <header className="welcome-nav"><Brand/><Badge tone="green">AI for Social Good</Badge></header>
    <main className="welcome-main">
      <div className="welcome-copy">
        <div className="eyebrow"><Icon name="spark" size={17}/> Responsible, farmer-first AI</div>
        <h1>Smarter irrigation.<br/><span>Healthier harvests.</span></h1>
        <p className="welcome-subtitle">Smart irrigation guidance for better water management</p>
        <p className="welcome-body">Use AI-powered recommendations to make informed irrigation decisions and reduce unnecessary water usage.</p>
        <div className="welcome-actions"><Button onClick={() => setPage("setup")}>Get Started <Icon name="arrow" size={18}/></Button><Button variant="secondary" onClick={() => setPage("dashboard")}>View Demo</Button></div>
        <div className="trust-row"><span><Icon name="check" size={16}/> Simple guidance</span><span><Icon name="shield" size={16}/> Farmer stays in control</span></div>
      </div>
      <div className="hero-visual" aria-label="Illustration of a smart, irrigated farm">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <div className="hero-ai"><Icon name="spark" size={28}/><strong>AI</strong><small>Analyzing conditions</small></div>
        <div className="sun"></div><div className="cloud-shape cloud-one"></div><div className="cloud-shape cloud-two"></div>
        <div className="field-card">
          <div className="field-sky"></div><div className="field-hill hill-one"></div><div className="field-hill hill-two"></div>
          <div className="field-lines">{[1,2,3,4,5].map((n) => <span key={n}></span>)}</div>
          <div className="water-line"><span></span><span></span><span></span><span></span></div>
        </div>
        <div className="floating-stat moisture-stat"><Icon name="droplet"/><span><small>Soil moisture</small><strong>30%</strong></span></div>
        <div className="floating-stat temp-stat"><Icon name="thermometer"/><span><small>Temperature</small><strong>30°C</strong></span></div>
      </div>
    </main>
    <footer className="welcome-footer"><span>Built for small farmers</span><span>•</span><span>Transparent recommendations</span><span>•</span><span>Responsible water use</span></footer>
  </div>;
}

function FarmSetup({ farm, setFarm, setPage }: { farm: FarmProfile; setFarm: (f: FarmProfile) => void; setPage: (page: Page) => void }) {
  const [draft, setDraft] = useState<FarmProfile>(farm);
  const set = (key: keyof FarmProfile) => (e: { target: { value: string } }) => setDraft({ ...draft, [key]: e.target.value });
  return <div className="narrow-page">
    <PageTitle title="Set Up Your Farm" subtitle="Tell us about your farm to personalize your experience."/>
    <Card className="form-card">
      <div className="form-card-head"><div className="section-icon"><Icon name="farm"/></div><div><h2>Farm profile</h2><p>This information helps us tailor your experience.</p></div></div>
      <form className="form-grid" onSubmit={(e) => { e.preventDefault(); setFarm({ ...draft, name: draft.name.trim() || "Farmer" }); setPage("dashboard"); }}>
        <Field label="Farmer Name"><input value={draft.name} onChange={set("name")} placeholder="Enter your name"/></Field>
        <Field label="Location"><input value={draft.location} onChange={set("location")} placeholder="Village, district or city"/></Field>
        <Field label="Farm Size" note="Profile information — not used by the current ML model"><div className="input-with-unit"><input value={draft.size} onChange={set("size")}/><span>Acres</span></div></Field>
        <Field label="Crop Type"><select value={draft.crop} onChange={set("crop")}>{CROPS.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Soil Type" note="Profile information — not used by the current ML model"><select value={draft.soilType} onChange={set("soilType")}>{SOIL_TYPES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <div className="form-footer"><div className="privacy-note"><Icon name="lock" size={18}/><span>Your farm information is stored only in this browser and is never sent to the AI model.</span></div><Button type="submit">Save Farm & Continue <Icon name="arrow" size={18}/></Button></div>
      </form>
    </Card>
  </div>;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
}

function Dashboard({ farm, latest, setPage }: { farm: FarmProfile; latest?: HistoryRecord; setPage: (page: Page) => void }) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const irrigate = latest?.prediction === 1;
  return <>
    <div className="dashboard-top"><PageTitle title={`${greeting()}, ${farm.name} 👋`} subtitle="Here is what is happening on your farm today."/><div className="date-chip"><Icon name="calendar" size={18}/><span>{today}</span></div></div>
    <Card className="farm-summary">
      <div className="farm-summary-title"><div className="section-icon"><Icon name="farm"/></div><div><p>FARM OVERVIEW</p><h2>{farm.crop} Field</h2></div></div>
      <div className="summary-detail"><small>Crop</small><strong>{farm.crop}</strong></div><div className="summary-detail"><small>Farm Size</small><strong>{farm.size} Acres</strong></div><div className="summary-detail"><small>Soil Type</small><strong>{farm.soilType}</strong></div>
      <button className="text-button" onClick={() => setPage("setup")}>Edit setup <Icon name="arrow" size={16}/></button>
    </Card>
    <div className="section-heading"><div><h2>Current conditions</h2><p>{latest ? "Values from your latest AI Advisor check" : "Enter readings in the AI Advisor to see them here"}</p></div><Badge tone={latest ? "green" : "gray"}>{latest && <span className="live-dot"></span>} {latest ? formatDateTime(latest.timestamp) : "No readings yet"}</Badge></div>
    <div className="metric-grid">
      <MetricCard icon="droplet" label="Soil Moisture" value={latest ? `${latest.soilMoisture}%` : "—"} caption={latest ? levelOf(latest.soilMoisture, 40, 70) : "No reading yet"} tone="metric-blue"/>
      <MetricCard icon="thermometer" label="Temperature" value={latest ? `${latest.temperature}°C` : "—"} caption={latest ? levelOf(latest.temperature, 15, 30) : "No reading yet"} tone="metric-orange"/>
      <MetricCard icon="humidity" label="Humidity" value={latest ? `${latest.humidity}%` : "—"} caption={latest ? levelOf(latest.humidity, 50, 70) : "No reading yet"} tone="metric-teal"/>
      <MetricCard icon="soil" label="Soil Temperature" value={latest ? `${latest.soilTemperature}°C` : "—"} caption={latest ? levelOf(latest.soilTemperature, 15, 30, "Normal") : "No reading yet"} tone="metric-brown"/>
    </div>
    <Card className="ai-status-card">
      <div className="ai-status-graphic"><div className="status-ring"><Icon name={irrigate ? "droplet" : "check"} size={36}/></div><span className="plant-line"></span></div>
      <div className="ai-status-copy"><div className="eyebrow"><Icon name="spark" size={16}/> AI Irrigation Status</div>
        <h2>{latest ? latest.status : "No assessment yet"}</h2>
        <p>{latest ? (irrigate ? `Suggested duration: ${latest.duration}. ${latest.reason}` : latest.reason) : "Enter your current farm conditions in the AI Advisor to get an AI-based irrigation recommendation."}</p>
        <div className="status-meta"><span><Icon name="clock" size={17}/> {latest ? `Assessed ${formatDateTime(latest.timestamp)}` : "Waiting for first assessment"}</span><span><Icon name="leaf" size={17}/> {latest ? latest.crop : farm.crop} crop</span></div></div>
      <Button onClick={() => setPage("advisor")}>Open AI Advisor <Icon name="arrow" size={18}/></Button>
    </Card>
    <div className="responsible-strip"><Icon name="shield"/><div><strong>Responsible AI notice</strong><p>AI recommendations are advisory. The farmer makes the final irrigation decision.</p></div><button className="text-button" onClick={() => setPage("responsible")}>Learn more</button></div>
  </>;
}

const RANGES = {
  temperature: { label: "Temperature", min: -10, max: 60, unit: "°C" },
  humidity: { label: "Humidity", min: 0, max: 100, unit: "%" },
  soilMoisture: { label: "Soil Moisture", min: 0, max: 100, unit: "%" },
  soilTemperature: { label: "Soil Temperature", min: -10, max: 60, unit: "°C" },
} as const;

function Advisor({ farm, latest, onResult, setPage }: { farm: FarmProfile; latest?: HistoryRecord; onResult: (r: HistoryRecord) => void; setPage: (page: Page) => void }) {
  const [form, setForm] = useState({
    crop: latest?.crop ?? farm.crop,
    temperature: String(latest?.temperature ?? 30),
    humidity: String(latest?.humidity ?? 50),
    soilMoisture: String(latest?.soilMoisture ?? 30),
    soilTemperature: String(latest?.soilTemperature ?? 25),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const values = {} as Record<keyof typeof RANGES, number>;
    for (const key of Object.keys(RANGES) as (keyof typeof RANGES)[]) {
      const r = RANGES[key];
      const raw = form[key].trim();
      const n = Number(raw);
      if (raw === "" || !Number.isFinite(n)) return setError(`Please enter a number for ${r.label}.`);
      if (n < r.min || n > r.max) return setError(`${r.label} should be between ${r.min} and ${r.max}${r.unit}.`);
      values[key] = n;
    }
    const cropType = CROP_MAPPING[form.crop];
    if (cropType === undefined) return setError("Please choose a crop type.");

    setLoading(true);
    try {
      const res = await predictIrrigation({ crop_type: cropType, temperature: values.temperature, humidity: values.humidity, soil_moisture: values.soilMoisture, soil_temperature: values.soilTemperature });
      onResult({
        id: `${Date.now()}`,
        timestamp: new Date().toISOString(),
        crop: form.crop,
        cropType: res.inputs.crop_type,
        temperature: res.inputs.temperature,
        humidity: res.inputs.humidity,
        soilMoisture: res.inputs.soil_moisture,
        soilTemperature: res.inputs.soil_temperature,
        prediction: res.prediction,
        status: res.status,
        duration: res.duration,
        durationMinutes: parseInt(res.duration, 10) || 0,
        reason: res.reason,
        scheduleStatus: res.prediction === 1 ? "Recommended" : "No irrigation",
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong while getting the recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const irrigate = latest?.prediction === 1;
  return <>
    <PageTitle title="AI Irrigation Advisor" subtitle="Enter current farm conditions to receive an AI-based irrigation recommendation."/>
    <div className="advisor-layout">
      <Card className="advisor-form">
        <div className="form-card-head"><div className="section-icon"><Icon name="spark"/></div><div><h2>Current farm conditions</h2><p>Use your latest available readings.</p></div></div>
        <form className="stack-form" onSubmit={submit} noValidate>
          <Field label="Crop Type"><select value={form.crop} onChange={set("crop")}>{CROPS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <div className="two-fields"><Field label="Temperature"><div className="input-with-unit"><input type="number" value={form.temperature} onChange={set("temperature")}/><span>°C</span></div></Field><Field label="Humidity"><div className="input-with-unit"><input type="number" value={form.humidity} onChange={set("humidity")}/><span>%</span></div></Field></div>
          <div className="two-fields"><Field label="Soil Moisture"><div className="input-with-unit"><input type="number" value={form.soilMoisture} onChange={set("soilMoisture")}/><span>%</span></div></Field><Field label="Soil Temperature"><div className="input-with-unit"><input type="number" value={form.soilTemperature} onChange={set("soilTemperature")}/><span>°C</span></div></Field></div>
          <div className="model-note"><Icon name="info" size={18}/><span>These are the five inputs used by the current Random Forest model.</span></div>
          {error && <div className="form-error" role="alert"><Icon name="info" size={18}/><span>{error}</span></div>}
          <button className="button button-primary button-full" type="submit" disabled={loading}><Icon name="spark" size={18}/> {loading ? "Analyzing conditions…" : "Get AI Recommendation"}</button>
        </form>
      </Card>
      <div className="result-area">
        {!latest ? <Card className="result-placeholder"><div className="placeholder-icon"><Icon name="sprout" size={34}/></div><h2>Your recommendation will appear here</h2><p>Complete the farm conditions form, then let AgriFlow AI assess the need for irrigation.</p><div className="mini-flow"><span>Inputs</span><Icon name="arrow" size={15}/><span>AI model</span><Icon name="arrow" size={15}/><span>Guidance</span></div></Card> :
        <Card className="result-card">
          <div className="result-top"><div className="result-icon"><Icon name={irrigate ? "droplet" : "sprout"} size={32}/></div><Badge tone={irrigate ? "green" : "gray"}>{irrigate ? "Recommended" : "Not required"}</Badge></div>
          <p className="result-kicker">AI RECOMMENDATION</p><h2>{latest.status}</h2>
          <div className="duration-block"><Icon name="clock" size={24}/><span><small>Suggested duration</small><strong>{latest.duration}</strong></span></div>
          <div className="reason-block"><strong>Why?</strong><p>{latest.reason}</p><p><strong>Random Forest prediction:</strong> {latest.prediction} — {latest.prediction === 1 ? "Irrigation Required" : "Irrigation Not Required"}. Duration and explanation come from a separate rule-based layer.</p></div>
          <Button variant="secondary" full onClick={() => setPage("explain")}><Icon name="eye" size={18}/> Why did AI recommend this?</Button>
          <p className="model-credit"><Icon name="shield" size={15}/> AI-based advisory recommendation · Assessed {formatDateTime(latest.timestamp)} · The farmer makes the final decision.</p>
        </Card>}
      </div>
    </div>
  </>;
}

function Explain({ latest, setPage }: { latest?: HistoryRecord; setPage: (page: Page) => void }) {
  if (!latest) return <>
    <PageTitle title="Why Did AI Make This Recommendation?" subtitle="A clear look at the factors and steps behind your irrigation guidance."/>
    <Card className="result-placeholder"><div className="placeholder-icon"><Icon name="eye" size={34}/></div><h2>No recommendation to explain yet</h2><p>Get an AI recommendation first, then come back to see exactly which inputs were used and how the result was produced.</p><Button onClick={() => setPage("advisor")}>Open AI Advisor <Icon name="arrow" size={18}/></Button></Card>
  </>;
  const factors = [
    { icon: "droplet" as IconName, label: "Soil Moisture", value: `${latest.soilMoisture}%`, status: levelOf(latest.soilMoisture, 40, 70), tone: latest.soilMoisture < 40 ? "amber" as const : "blue" as const },
    { icon: "thermometer" as IconName, label: "Temperature", value: `${latest.temperature}°C`, status: levelOf(latest.temperature, 15, 30), tone: latest.temperature > 30 ? "amber" as const : "blue" as const },
    { icon: "humidity" as IconName, label: "Humidity", value: `${latest.humidity}%`, status: levelOf(latest.humidity, 50, 70), tone: latest.humidity < 50 ? "amber" as const : "blue" as const },
    { icon: "soil" as IconName, label: "Soil Temperature", value: `${latest.soilTemperature}°C`, status: levelOf(latest.soilTemperature, 15, 30, "Normal"), tone: "green" as const },
    { icon: "sprout" as IconName, label: "Crop Type", value: latest.crop, status: `Code ${latest.cropType}`, tone: "green" as const },
  ];
  const flow = [{ icon: "farm" as IconName, label: "Farm Conditions" }, { icon: "spark" as IconName, label: "Random Forest Model" }, { icon: "trend" as IconName, label: "Irrigation Prediction" }, { icon: "grid" as IconName, label: "Rule-Based Reasoning" }, { icon: "sprout" as IconName, label: "Final Recommendation" }];
  return <>
    <PageTitle title="Why Did AI Make This Recommendation?" subtitle="A clear look at the factors and steps behind your irrigation guidance."/>
    <div className="section-heading"><div><h2>Factors considered</h2><p>Only these five inputs were sent to the model (entered {formatDateTime(latest.timestamp)}).</p></div><Badge tone="green">4 readings + crop type</Badge></div>
    <div className="factor-grid">{factors.map((factor) => <Card className={`factor-card ${factor.label === "Crop Type" ? "factor-wide" : ""}`} key={factor.label}><div className="metric-icon"><Icon name={factor.icon}/></div><div><p>{factor.label}</p><strong>{factor.value}</strong></div><Badge tone={factor.tone}>{factor.status}</Badge></Card>)}</div>
    <Card className="flow-card"><div className="flow-head"><h2>How the recommendation was created</h2><p>A transparent path from your inputs to practical guidance.</p></div><div className="reasoning-flow">{flow.map((step, i) => <div className="flow-group" key={step.label}><div className={`flow-step ${i === flow.length - 1 ? "flow-final" : ""}`}><span><Icon name={step.icon}/></span><strong>{step.label}</strong></div>{i < flow.length - 1 && <Icon name="arrow" size={20}/>}</div>)}</div></Card>
    <Card className="decision-card"><div className="decision-title"><span><Icon name="spark"/></span><div><p>AI DECISION</p><h2>{latest.status}</h2></div></div>
      <p><strong>Random Forest prediction:</strong> {latest.prediction} — {latest.prediction === 1 ? "Irrigation Required" : "Irrigation Not Required"}.<br/><strong>Rule-based reasoning:</strong> {latest.reason}<br/><strong>Suggested duration:</strong> {latest.duration}</p></Card>
    <div className="section-heading"><div><h2>Responsible AI</h2><p>Designed to keep recommendations understandable and people in control.</p></div></div>
    <div className="principle-grid">
      <Card className="principle-card"><Icon name="eye"/><div><h3>Transparent</h3><p>The system shows the five factors used by the model.</p></div></Card>
      <Card className="principle-card"><Icon name="spark"/><div><h3>Explainable</h3><p>The prediction comes from the Random Forest; the duration and reason come from simple rules, kept separate on purpose.</p></div></Card>
      <Card className="principle-card"><Icon name="usercheck"/><div><h3>Accountable</h3><p>The recommendation is advisory and the farmer makes the final decision.</p></div></Card>
    </div>
  </>;
}

function MoistureChart({ records }: { records: HistoryRecord[] }) {
  const pts = records.slice(0, 7).reverse();
  if (pts.length < 2) return <div className="line-chart chart-empty" aria-label="Soil moisture trend chart"><p>Run the AI Advisor at least twice to see your soil moisture readings over time.</p></div>;
  const xy = pts.map((p, i) => [(i / (pts.length - 1)) * 640, 170 - (Math.min(Math.max(p.soilMoisture, 0), 100) / 100) * 160] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = xy[xy.length - 1];
  const labelIdx = pts.length <= 5 ? pts.map((_, i) => i) : [0, 1, 2, 3, 4].map((k) => Math.round((k * (pts.length - 1)) / 4));
  return <div className="line-chart" aria-label="Soil moisture trend chart"><div className="chart-grid"><span></span><span></span><span></span><span></span></div><svg viewBox="0 0 640 180" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green-400)" stopOpacity=".25"/><stop offset="100%" stopColor="var(--green-400)" stopOpacity="0"/></linearGradient></defs><path className="area-path" d={`${line} L640 180 L0 180Z`}/><path className="line-path" d={line}/><circle cx={last[0]} cy={last[1]} r="6"/></svg><div className="chart-labels">{labelIdx.map((i) => <span key={i}>{formatDateTime(pts[i].timestamp)}</span>)}</div></div>;
}

function DurationChart({ records }: { records: HistoryRecord[] }) {
  const pts = records.slice(0, 7).reverse();
  if (pts.length === 0) return <div className="bar-chart chart-empty" aria-label="Irrigation activity chart"><p>Recommended durations will appear here.</p></div>;
  return <div className="bar-chart" aria-label="Irrigation activity chart">{pts.map((p) => <div className="bar-column" key={p.id}><div className={`bar ${p.durationMinutes === 0 ? "bar-empty" : ""}`} style={{ height: `${Math.max(p.durationMinutes * 2.3, 8)}px` }}><span>{p.durationMinutes > 0 ? `${p.durationMinutes}m` : ""}</span></div><small>{new Date(p.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "numeric" })}</small></div>)}</div>;
}

function Weather({ history }: { history: HistoryRecord[] }) {
  const latest = history[0];
  return <>
    <div className="dashboard-top"><PageTitle title="Weather & Environment" subtitle="Conditions you entered in the AI Advisor. AgriFlow AI does not fetch live weather data."/><Badge tone="gray">{latest ? `Entered ${formatDateTime(latest.timestamp)}` : "No readings yet"}</Badge></div>
    <div className="metric-grid">
      <MetricCard icon="thermometer" label="Temperature" value={latest ? `${latest.temperature}°C` : "—"} caption={latest ? levelOf(latest.temperature, 15, 30) : "No reading yet"} tone="metric-orange"/>
      <MetricCard icon="humidity" label="Humidity" value={latest ? `${latest.humidity}%` : "—"} caption={latest ? levelOf(latest.humidity, 50, 70) : "No reading yet"} tone="metric-teal"/>
      <MetricCard icon="soil" label="Soil Temperature" value={latest ? `${latest.soilTemperature}°C` : "—"} caption={latest ? levelOf(latest.soilTemperature, 15, 30, "Normal") : "No reading yet"} tone="metric-brown"/>
      <MetricCard icon="droplet" label="Soil Moisture" value={latest ? `${latest.soilMoisture}%` : "—"} caption={latest ? levelOf(latest.soilMoisture, 40, 70) : "No reading yet"} tone="metric-blue"/>
    </div>
    <Card className="chart-card"><div className="chart-head"><div><h2>Soil moisture readings</h2><p>Your most recent entered values</p></div><div className="chart-current"><small>Latest</small><strong>{latest ? `${latest.soilMoisture}%` : "—"}</strong></div></div><MoistureChart records={history}/></Card>
    <Card className="future-card"><div className="future-illustration"><Icon name="cloud" size={34}/><span><Icon name="spark" size={17}/></span></div><div><Badge tone="blue">Future Enhancement</Badge><h2>Live weather and rainfall forecasts</h2><p>Live weather and rainfall forecasts can be integrated in a future version to further improve irrigation scheduling.</p><small>Rainfall is not used by the current Random Forest model.</small></div></Card>
  </>;
}

const STATUS_TONE: Record<ScheduleStatus, "green" | "gray" | "blue" | "amber"> = { Recommended: "green", Completed: "blue", Skipped: "amber", "No irrigation": "gray" };
const NEXT_STATUS: Record<ScheduleStatus, ScheduleStatus> = { Recommended: "Completed", Completed: "Skipped", Skipped: "Recommended", "No irrigation": "No irrigation" };

function Schedule({ history, setStatus, setPage }: { history: HistoryRecord[]; setStatus: (id: string, s: ScheduleStatus) => void; setPage: (page: Page) => void }) {
  const latest = history[0];
  const rows = history.slice(0, 7);
  if (!latest) return <>
    <PageTitle title="Irrigation Schedule" subtitle="A simple view of your AI-guided irrigation plan."/>
    <Card className="result-placeholder"><div className="placeholder-icon"><Icon name="calendar" size={34}/></div><h2>No recommendations yet</h2><p>Get an AI recommendation and it will appear here so you can mark it as completed or skipped.</p><Button onClick={() => setPage("advisor")}>Open AI Advisor <Icon name="arrow" size={18}/></Button></Card>
  </>;
  const irrigate = latest.prediction === 1;
  return <>
    <PageTitle title="Irrigation Schedule" subtitle="A simple view of your AI-guided irrigation plan. This is an advisory log only."/>
    <Card className="today-card"><div className="today-icon"><Icon name={irrigate ? "droplet" : "leaf"} size={30}/></div><div className="today-copy"><p>LATEST RECOMMENDATION</p><h2>{irrigate ? latest.duration : "No irrigation"}</h2><span><Icon name="spark" size={16}/> AI-based recommendation · {formatDateTime(latest.timestamp)}</span></div>
      <div className="today-actions"><Badge tone={STATUS_TONE[latest.scheduleStatus]}>{latest.scheduleStatus}</Badge>
        {irrigate && <><Button variant="secondary" onClick={() => setStatus(latest.id, "Completed")}>Mark completed</Button><Button variant="secondary" onClick={() => setStatus(latest.id, "Skipped")}>Mark skipped</Button></>}</div></Card>
    <div className="schedule-heading"><div><h2>Recent recommendations</h2><p>Latest {rows.length} saved on this device</p></div><div className="schedule-legend"><Badge tone="green">Recommended</Badge><Badge tone="gray">No irrigation</Badge></div></div>
    <Card className="schedule-list">{rows.map((item, i) => { const d = new Date(item.timestamp); const isIrr = item.prediction === 1; return <div className={`schedule-row ${i === 0 ? "schedule-today" : ""}`} key={item.id}><div className="day-date"><span>{d.getDate()}</span><div><strong>{d.toLocaleDateString("en-IN", { weekday: "long" })}</strong><small>{i === 0 ? "Latest · " : ""}{d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</small></div></div><div className="schedule-duration"><Icon name={isIrr ? "droplet" : "leaf"} size={19}/><strong>{isIrr ? item.duration : "No irrigation"}</strong></div><Badge tone={STATUS_TONE[item.scheduleStatus]}>{item.scheduleStatus}</Badge><button className="row-action" disabled={!isIrr} title={isIrr ? "Change status: Recommended → Completed → Skipped" : "Nothing to record"} aria-label={`Change status for ${d.toLocaleDateString("en-IN", { weekday: "long" })}`} onClick={() => setStatus(item.id, NEXT_STATUS[item.scheduleStatus])}><Icon name="arrow" size={18}/></button></div>; })}</Card>
    <div className="status-guide"><strong>Status guide</strong><span><Badge tone="green">Recommended</Badge> AI suggests irrigation</span><span><Badge tone="blue">Completed</Badge> You marked it as done</span><span><Badge tone="amber">Skipped</Badge> Farmer chose not to irrigate</span></div>
    <p className="schedule-note">These statuses are only notes you record. AgriFlow AI does not control any irrigation equipment.</p>
  </>;
}

function HistoryPage({ history, clear }: { history: HistoryRecord[]; clear: () => void }) {
  const irrigations = history.filter((h) => h.prediction === 1);
  const totalMin = history.reduce((s, h) => s + h.durationMinutes, 0);
  const avgMoisture = history.length ? Math.round((history.reduce((s, h) => s + h.soilMoisture, 0) / history.length) * 10) / 10 : null;
  return <>
    <PageTitle title="Irrigation History" subtitle="Review past recommendations and understand irrigation activity over time."/>
    <div className="metric-grid history-metrics">
      <MetricCard icon="leaf" label="Recommendations Recorded" value={String(history.length)} caption="Saved on this device"/>
      <MetricCard icon="droplet" label="Irrigation Recommended" value={String(irrigations.length)} caption="Times AI advised irrigation"/>
      <MetricCard icon="clock" label="Total Suggested Duration" value={`${totalMin} min`} caption="Sum of recommendations"/>
      <MetricCard icon="trend" label="Avg. Soil Moisture" value={avgMoisture === null ? "—" : `${avgMoisture}%`} caption="Across entered readings"/>
    </div>
    <div className="history-layout">
      <Card className="history-card"><div className="chart-head"><div><h2>Recent activity</h2><p>Recorded AI recommendations</p></div>{history.length > 0 && <button className="text-button" onClick={() => { if (window.confirm("Clear all saved history on this device?")) clear(); }}>Clear history</button>}</div>
        {history.length === 0 ? <p className="history-empty">No history yet. Your recommendations will be saved here after you use the AI Advisor.</p> :
        <div className="history-table"><div className="history-row history-header"><span>Date & conditions</span><span>Status</span><span>Duration</span></div>{history.slice(0, 20).map((h) => <div className="history-row" key={h.id}><span>{formatDateTime(h.timestamp)}<small className="history-detail">{h.crop} · Moisture {h.soilMoisture}% · Temp {h.temperature}°C · Humidity {h.humidity}% · Soil temp {h.soilTemperature}°C</small><small className="history-detail">{h.reason}</small></span><span><Badge tone={h.prediction === 1 ? "green" : "gray"}>{h.status}</Badge></span><strong>{h.durationMinutes} min</strong></div>)}</div>}
      </Card>
      <Card className="activity-card"><div className="chart-head"><div><h2>Irrigation activity</h2><p>Suggested duration per recommendation</p></div></div><DurationChart records={history}/></Card>
    </div>
    <Card className="insight-card"><div className="insight-icon"><Icon name="spark" size={24}/></div><div><h2>AI Insight</h2><p>Monitoring irrigation decisions over time can help identify unnecessary watering and support more efficient water management.</p><small>This is general guidance, not a measured water-saving result.</small></div></Card>
  </>;
}

function ResponsibleAI() {
  const principles = [
    ["balance" as IconName, "Fairness", "The model should be evaluated across different crops and farming conditions. Fairness is not claimed as solved."],
    ["eye" as IconName, "Transparency", "The app clearly shows the five factors used by the model: crop type, temperature, humidity, soil moisture and soil temperature."],
    ["spark" as IconName, "Explainability", "Every recommendation includes a human-readable reason from a simple rule-based layer."],
    ["usercheck" as IconName, "Accountability", "AI provides advice only; the farmer remains responsible for the final irrigation decision."],
    ["lock" as IconName, "Privacy", "Farm profile details (name, location, farm size, soil type) stay in your browser and are not sent to the model."],
    ["shield" as IconName, "Safety", "The system gives recommendations only and never automatically controls irrigation equipment."],
    ["globe" as IconName, "Sustainability", "The goal is to reduce unnecessary irrigation and support responsible water use."],
  ];
  return <>
    <div className="responsible-hero"><div><div className="eyebrow"><Icon name="shield" size={17}/> HUMAN-CENTERED BY DESIGN</div><h1>Responsible AI</h1><p>AgriFlow AI is designed to support informed decisions—not replace farmer knowledge, experience, or judgment.</p></div><div className="responsible-shield"><Icon name="shield" size={58}/><span><Icon name="sprout" size={23}/></span></div></div>
    <div className="principles-intro"><div><h2>Our seven principles</h2><p>The values guiding how this project is designed and communicated.</p></div><Badge tone="green">AI for Social Good</Badge></div>
    <div className="responsible-grid">{principles.map(([icon, title, text], i) => <Card className={`responsible-card responsible-${i + 1}`} key={title as string}><span className="principle-number">0{i + 1}</span><div className="responsible-icon"><Icon name={icon as IconName}/></div><h2>{title}</h2><p>{text}</p></Card>)}</div>
    <Card className="human-card"><div><Icon name="usercheck" size={32}/></div><span><strong>The farmer always makes the final decision</strong><p>Recommendations are advisory and do not automatically control irrigation equipment.</p></span></Card>
    <Card className="human-card model-limits"><div><Icon name="info" size={32}/></div><span><strong>About the model&apos;s limits</strong><p>The Random Forest was trained on one dataset and scored about 99.58% on our own held-out test split during development. That is not a guarantee of accuracy on every farm. Before real-world use it should be evaluated across different crops, soil conditions and regions.</p></span></Card>
  </>;
}

export default function App() {
  const [page, setPage] = useState<Page>("welcome");
  const [farm, setFarm] = useLocalStorage<FarmProfile>("agriflow.farm", DEFAULT_FARM);
  const [history, setHistory] = useLocalStorage<HistoryRecord[]>("agriflow.history", []);
  const latest: HistoryRecord | undefined = history[0];

  const addRecord = (r: HistoryRecord) => setHistory((prev) => [r, ...prev].slice(0, 100));
  const setStatus = (id: string, s: ScheduleStatus) => setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, scheduleStatus: s } : h)));

  if (page === "welcome") return <Welcome setPage={setPage}/>;
  const pages: Record<Exclude<Page, "welcome">, ReactNode> = {
    setup: <FarmSetup farm={farm} setFarm={setFarm} setPage={setPage}/>,
    dashboard: <Dashboard farm={farm} latest={latest} setPage={setPage}/>,
    advisor: <Advisor farm={farm} latest={latest} onResult={addRecord} setPage={setPage}/>,
    explain: <Explain latest={latest} setPage={setPage}/>,
    weather: <Weather history={history}/>,
    schedule: <Schedule history={history} setStatus={setStatus} setPage={setPage}/>,
    history: <HistoryPage history={history} clear={() => setHistory([])}/>,
    responsible: <ResponsibleAI/>,
  };
  return <AppShell page={page} setPage={setPage}>{pages[page]}</AppShell>;
}
