import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { api } from "../api.js";

export default function Overview() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.list().then(setRows).catch(() => {}); }, []);
  const done = rows.filter((r) => r.report);
  const flagged = done.filter((r) => ["mismatch", "partial"].includes(r.report.verdict)).length;
  const stats = [["Verifications", rows.length], ["Analysed", done.length], ["Drafts", rows.length - done.length], ["Need review", flagged]];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow plain">OVERVIEW</div>
          <h1>Your evidence workspace</h1>
          <p>Track every order you’ve compared and what the evidence showed.</p>
        </div>
        <Link to="/verify" className="btn primary lg"><Sparkles size={16} aria-hidden="true" />New verification</Link>
      </div>
      <ul className="stats" aria-label="Summary">{stats.map(([l, n]) => <li key={l} className="stat"><b>{n}</b><span>{l}</span></li>)}</ul>
      <h2 className="sec">Recent verifications</h2>
      {rows.length === 0 ? (
        <div className="empty"><h3>Nothing here yet</h3><p>Compare your first delivery to its listing.</p><Link to="/verify" className="btn primary">Start verification</Link></div>
      ) : (
        <div className="table" role="table" aria-label="Recent verifications">
          {rows.slice(0, 5).map((r) => (
            <Link to={`/report/${r.id}`} className="tr row-link" key={r.id} role="row" aria-label={`${r.product_name}, ${r.status}. Open report`}>
              <span role="cell"><b>{r.product_name}</b><small>{r.reference}</small></span>
              <span role="cell">{r.report ? r.report.headline || r.report.verdict : "Draft — not analysed"}</span>
              <span role="cell"><i className={"status " + r.status.toLowerCase()}>{r.status}</i></span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
