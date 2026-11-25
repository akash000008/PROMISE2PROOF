import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { api } from "../api.js";

export default function History() {
  const nav = useNavigate();
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const load = () => api.list().then(setRows).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);

  const remove = async (r) => {
    if (!window.confirm(`Delete ${r.reference}? This removes its photos and report.`)) return;
    try { await api.remove(r.id); load(); } catch (e) { setErr(e.message); }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow plain">EVIDENCE TRAIL</p>
          <h1>Verification history</h1>
          <p>Revisit reports, export evidence, or remove a record you no longer need.</p>
        </div>
        <button className="btn primary lg" onClick={() => nav("/verify")}><Sparkles size={16} aria-hidden="true" />New verification</button>
      </div>
      {err && <div className="alert" role="alert">{err}</div>}
      {rows === null && !err && <p role="status">Loading history…</p>}
      {rows && rows.length === 0 && (
        <div className="empty"><h3>No verifications yet</h3><p>Start one to build your first evidence record.</p><Link to="/verify" className="btn primary">Start verification</Link></div>
      )}
      {rows && rows.length > 0 && (
        <div className="table" role="table" aria-label="Verification history">
          <div className="tr th" role="row"><span role="columnheader">PRODUCT</span><span role="columnheader">REFERENCE</span><span role="columnheader">DATE</span><span role="columnheader">STATUS</span><span role="columnheader">ACTIONS</span></div>
          {rows.map((r) => (
            <div className="tr" key={r.id} role="row">
              <span role="cell"><b>{r.product_name}</b><small>{[r.brand, r.model].filter(Boolean).join(" ")}</small></span>
              <span role="cell" className="mono">{r.reference}</span>
              <span role="cell"><time dateTime={r.created_at + "Z"}>{new Date(r.created_at + "Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time></span>
              <span role="cell"><i className={"status " + r.status.toLowerCase()}>{r.status}</i></span>
              <span className="acts" role="cell">
                <Link to={`/report/${r.id}`} className="open" aria-label={`Open report ${r.reference} for ${r.product_name}`}>Open <ArrowRight size={14} aria-hidden="true" /></Link>
                <button aria-label={`Delete ${r.reference} for ${r.product_name}`} onClick={() => remove(r)}><Trash2 size={18} aria-hidden="true" /></button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
