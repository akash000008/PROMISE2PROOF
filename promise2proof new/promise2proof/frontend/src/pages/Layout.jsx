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
  const [ready, setReady] = useState(null);
  useEffect(() => { api.health().then((h) => setReady(h.gemini)).catch(() => setReady(false)); }, []);

  return (
    <div className="shell">
      <aside className="side">
        <Logo light />
        <div className="side-label">WORKSPACE</div>
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => "side-link" + (isActive ? " on" : "")}>
            <n.icon size={18} /><span>{n.label}</span><ChevronRight size={14} />
          </NavLink>
        ))}
        <div className="side-foot"><strong>Evidence stays private</strong><span>AI analysis is assistive, not legal proof.</span></div>
      </aside>
      <div className="main">
        <div className="topbar">
          <span className={"engine" + (ready ? " ok" : "")}><i />{ready === null ? "Checking engine…" : ready ? "Gemini engine ready" : "Gemini key missing"}</span>
          <Link to="/verify" className="btn primary sm">Start verification →</Link>
        </div>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
