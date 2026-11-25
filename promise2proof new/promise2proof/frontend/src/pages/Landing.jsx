import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, BarChart3, Check, ClipboardCheck, CloudUpload, FileText, Headphones,
  ImagePlus, ShieldCheck, Sparkles } from "lucide-react";

export function Logo({ light }) {
  return (
    <Link to="/" className="logo">
      <span className="logo-mark"><ShieldCheck size={18} /></span>
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
        <nav>
          <a href="#how">How it works</a>
          <a href="#why">Why Promise2Proof</a>
          <Link to="/verify" className="btn primary">Open workspace <ArrowRight size={16} /></Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><i />CONSUMER EVIDENCE INTELLIGENCE</div>
          <h1>Did you receive<br /><span>what you were promised?</span></h1>
          <p>Compare the seller’s promise with what arrived at your door — using image evidence, model reading, and uncertainty-aware AI.</p>
          <div className="hero-cta">
            <Link to="/verify" className="btn primary lg">Verify your product <ArrowRight size={18} /></Link>
            <a href="#how" className="link-cta">Explore the demo <ArrowRight size={14} /></a>
          </div>
          <div className="trust">
            <span><ShieldCheck size={16} />Evidence-first</span>
            <span><Check size={16} />No invented claims</span>
            <span><Sparkles size={16} />Gemini vision</span>
          </div>
        </div>

        <div className="hero-art">
          <div className="grid-bg" />
          <div className="demo-card">
            <div className="live"><i />LIVE COMPARISON</div>
            <div className="demo-row">
              <div className="tile a"><Headphones size={88} strokeWidth={2.4} /></div>
              <span className="arrow-circle"><ArrowRight size={18} /></span>
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

      <section id="how" className="how">
        <div className="eyebrow plain">A CLEARER PATH TO A FAIRER OUTCOME</div>
        <h2>From unboxing to<br /><span>evidence in minutes.</span></h2>
        <div className="steps">
          {steps.map((s, i) => (
            <div key={s.t} className="step">
              <small>0{i + 1}</small>
              <s.icon size={22} />
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="why">
        <div>
          <div className="eyebrow plain">BUILT FOR CLARITY</div>
          <h2>Make every detail<br /><span>count.</span></h2>
        </div>
        <div className="feat-grid">
          {features.map((f) => (
            <div key={f.t} className="feat"><f.icon size={22} /><h4>{f.t}</h4><p>{f.d}</p></div>
          ))}
        </div>
      </section>

      <footer className="l-foot">
        <Logo light />
        <span>What you order should be what you receive.</span>
        <span>© {new Date().getFullYear()} Promise2Proof</span>
      </footer>
    </div>
  );
}
