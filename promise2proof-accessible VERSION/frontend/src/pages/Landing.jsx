import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, BarChart3, Check, ClipboardCheck, CloudUpload, FileText, Headphones,
  ImagePlus, ShieldCheck, Sparkles } from "lucide-react";

export function Logo({ light }) {
  return (
    <Link to="/" className="logo" aria-label="Promise2Proof home">
      <span className="logo-mark" aria-hidden="true"><ShieldCheck size={18} /></span>
      <span className={light ? "logo-text light" : "logo-text"}>PROMISE<b>2</b>PROOF</span>
    </Link>
  );
}

const steps = [
  { icon: CloudUpload, t: "Bring the promise", d: "Paste the listing details or add a screenshot of what the seller advertised." },
  { icon: ImagePlus, t: "Show what arrived", d: "Upload product, label, packaging, and accessory photos from your delivery." },
  { icon: ClipboardCheck, t: "See the proof", d: "Review every comparison with supporting evidence, confidence, and uncertainty." },
];
const features = [
  { icon: ShieldCheck, t: "Evidence before opinion", d: "AI separates what an image shows from what cannot be verified." },
  { icon: FileText, t: "Complaint-ready reports", d: "Download a structured record you can edit, preserve, and share." },
  { icon: Sparkles, t: "Made for real unboxings", d: "Read labels, compare colours, and surface accessory gaps." },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="l-nav">
        <Logo />
        <nav aria-label="Main">
          <a href="#how">How it works</a>
          <a href="#why">Why Promise2Proof</a>
          <Link to="/verify" className="btn primary">Open workspace <ArrowRight size={16} aria-hidden="true" /></Link>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow"><i aria-hidden="true" />CONSUMER EVIDENCE INTELLIGENCE</div>
          <h1 id="hero-title">Did you receive <span>what you were promised?</span></h1>
          <p>Compare the seller’s promise with what arrived at your door — using image evidence, model reading, and uncertainty-aware AI.</p>
          <div className="hero-cta">
            <Link to="/verify" className="btn primary lg">Verify your product <ArrowRight size={18} aria-hidden="true" /></Link>
            <a href="#how" className="link-cta">See how it works <ArrowRight size={14} aria-hidden="true" /></a>
          </div>
          <div className="trust">
            <span><ShieldCheck size={16} aria-hidden="true" />Evidence-first</span>
            <span><Check size={16} aria-hidden="true" />No invented claims</span>
            <span><Sparkles size={16} aria-hidden="true" />Gemini vision</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="grid-bg" />
          <div className="demo-card">
            <div className="live"><i />LIVE COMPARISON</div>
            <div className="demo-row">
              <div className="tile a"><Headphones size={88} strokeWidth={2.4} /></div>
              <span className="arrow-circle"><ArrowRight size={18} aria-hidden="true" /></span>
              <div className="tile b"><div className="label-box"><small>DT</small>400</div></div>
            </div>
            <div className="demo-result">
              <AlertTriangle size={22} />
              <div><strong>Possible model mismatch</strong><small>Label evidence · 82% confidence</small></div>
              <span className="chip">REVIEW</span>
            </div>
            <div className="float f1"><Check size={14} /> Label text detected</div>
            <div className="float f2"><BarChart3 size={14} /> 7 attributes compared</div>
          </div>
        </div>
      </section>

      <section id="how" className="how" aria-labelledby="how-title">
        <div className="eyebrow plain">A CLEARER PATH TO A FAIRER OUTCOME</div>
        <h2 id="how-title">From unboxing to <span>evidence in minutes.</span></h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.t} className="step">
              <small aria-hidden="true">0{i + 1}</small>
              <s.icon size={22} aria-hidden="true" />
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="why" className="why" aria-labelledby="why-title">
        <div>
          <div className="eyebrow plain">BUILT FOR CLARITY</div>
          <h2 id="why-title">Make every detail <span>count.</span></h2>
        </div>
        <div className="feat-grid">
          {features.map((f) => (
            <div key={f.t} className="feat"><f.icon size={22} /><h4>{f.t}</h4><p>{f.d}</p></div>
          ))}
        </div>
      </section>
      </main>

      <footer className="l-foot">
        <Logo light />
        <span>What you order should be what you receive.</span>
        <span>© {new Date().getFullYear()} Promise2Proof</span>
      </footer>
    </div>
  );
}
