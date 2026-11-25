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
          <div className="eyebrow plain">EVIDENCE TRAIL</div>
          <h1>Verification history</h1>
          <p>Revisit reports, export evidence, or remove a record you no longer need.</p>
        </div>
        <button className="btn primary lg" onClick={() => nav("/verify")}><Sparkles size={16} />New verification</button>
      </div>
      {err && <div className="alert">{err}</div>}
      {rows && rows.length === 0 && (
        <div className="empty"><h3>No verifications yet</h3><p>Start one to build your first evidence record.</p><Link to="/verify" className="btn primary">Start verification</Link></div>
      )}
      {rows && rows.length > 0 && (
        <div className="table">
          <div className="tr th"><span>PRODUCT</span><span>REFERENCE</span><span>DATE</span><span>STATUS</span><span>ACTIONS</span></div>
          {rows.map((r) => (
            <div className="tr" key={r.id}>
              <span><b>{r.product_name.toUpperCase()}</b><small>{[r.brand, r.model].filter(Boolean).join(" ").toUpperCase()}</small></span>
              <span className="mono">{r.reference}</span>
              <span>{new Date(r.created_at + "Z").toLocaleDateString("en-GB")}</span>
              <span><i className={"status " + r.status.toLowerCase()}>{r.status}</i></span>
              <span className="acts">
                <Link to={`/report/${r.id}`} className="open">Open <ArrowRight size={14} /></Link>
                <button aria-label={`Delete ${r.reference}`} onClick={() => remove(r)}><Trash2 size={16} /></button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
