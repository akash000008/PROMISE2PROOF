import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ChevronRight, ClipboardCheck, History, LayoutGrid } from "lucide-react";
import { api } from "../api.js";
import { Logo } from "./Landing.jsx";

const nav = [
  { to: "/overview", label: "Overview", icon: LayoutGrid },
  { to: "/verify", label: "New verification", icon: ClipboardCheck },
  { to: "/history", label: "History", icon: History },
];

export default function Layout() {
  const [engine, setEngine] = useState(null);
  useEffect(() => {
    api.health().then(setEngine).catch(() => setEngine({ gemini: false, gemini_message: "Cannot reach the server" }));
  }, []);

  const label = engine === null ? "Checking engine…" : engine.gemini ? "Gemini engine ready" : engine.gemini_message || "Gemini key missing";

  return (
    <div className="shell">
      <aside className="side">
        <Logo light />
        <nav aria-label="Workspace">
          <div className="side-label" aria-hidden="true">WORKSPACE</div>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => "side-link" + (isActive ? " on" : "")}>
              <n.icon size={18} aria-hidden="true" /><span>{n.label}</span><ChevronRight size={14} aria-hidden="true" />
            </NavLink>
          ))}
        </nav>
        <div className="side-foot"><strong>Evidence stays private</strong><span>AI analysis is assistive, not legal proof.</span></div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className={"engine" + (engine?.gemini ? " ok" : "")} role="status">
            <i aria-hidden="true" />{label}
          </span>
          <Link to="/verify" className="btn primary sm">Start verification<span aria-hidden="true"> →</span></Link>
        </header>
        <main id="main" tabIndex={-1} className="content"><Outlet /></main>
      </div>
    </div>
  );
}
