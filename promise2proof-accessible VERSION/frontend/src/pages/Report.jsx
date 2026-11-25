import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Download, Printer, Sparkles } from "lucide-react";
import { api, exportUrl, imageUrl } from "../api.js";

const VERDICT = { match: "Matches the promise", partial: "Partly matches", mismatch: "Does not match", inconclusive: "Inconclusive" };
const List = ({ title, items }) => items?.filter(Boolean).length ? (
  <div className="rcard"><h3>{title}</h3><ul>{items.filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}</ul></div>
) : null;

export default function Report() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");

  const apply = (r) => { setRec(r); setSummary(r.report?.summary || ""); setNotes(r.report?.notes || ""); };
  useEffect(() => { api.get(id).then(apply).catch((e) => setErr(e.message)); }, [id]);

  const run = async () => {
    setBusy(true); setErr("");
    try { apply(await api.analyze(id)); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const save = async () => {
    try { apply(await api.saveReport(id, { summary, notes })); setSaved("Saved"); setTimeout(() => setSaved(""), 2000); }
    catch (e) { setErr(e.message); }
  };

  if (err && !rec) return <div className="page"><div className="alert" role="alert">{err}</div><p><Link to="/history">Back to history</Link></p></div>;
  if (!rec) return <div className="page"><p role="status">Loading report…</p></div>;
  const r = rec.report;

  return (
    <div className="page report">
      <div className="page-head">
        <div>
          <p className="eyebrow plain">{rec.reference}</p>
          <h1>{rec.product_name}</h1>
          <p>{[rec.brand, rec.model].filter(Boolean).join(" · ") || "Verification report"}</p>
        </div>
        <div className="btns noprint"><span className="sr-only" role="status" aria-live="polite">{busy ? "Analysing, please wait" : ""}</span>
          {r && <a className="btn ghost" href={exportUrl(rec.id)}><Download size={16} aria-hidden="true" />Export JSON</a>}
          {r && <button className="btn ghost" onClick={() => window.print()}><Printer size={16} aria-hidden="true" />Print</button>}
          <button className="btn primary" aria-disabled={busy} onClick={() => !busy && run()}><Sparkles size={16} aria-hidden="true" />{busy ? "Analysing…" : r ? "Re-run analysis" : "Analyse with AI"}</button>
        </div>
      </div>
      {err && <div className="alert" role="alert">{err}</div>}

      {rec.images.length > 0 && <ul className="thumbs big" aria-label="Evidence photos">{rec.images.map((n, i) => <li key={n}><a href={imageUrl(n)} target="_blank" rel="noreferrer" aria-label={`Open evidence photo ${i + 1} of ${rec.images.length} in a new tab`}><img src={imageUrl(n)} alt={`Delivery evidence photo ${i + 1}`} /></a></li>)}</ul>}

      {!r ? (
        <div className="empty"><h3>This record is a draft</h3><p>Your evidence is saved. Run the analysis to see how the delivery compares with the promise.</p></div>
      ) : (
        <>
          <div className={"verdict " + r.verdict} role="region" aria-label="Verdict">
            <div><small>{VERDICT[r.verdict] || r.verdict}</small><h2>{r.headline}</h2></div>
            <div className="conf"><b>{Math.round(r.confidence)}%</b><small>confidence</small></div>
          </div>
          <div className="rcard"><h3><label htmlFor="summary">Summary <small>(editable)</small></label></h3>
            <textarea id="summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
            <h3><label htmlFor="notes">Your notes</label></h3>
            <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add order number, seller messages, dates…" />
            <div className="noprint"><button className="btn primary sm" onClick={save}>Save changes</button> <span className="ok-txt" role="status" aria-live="polite">{saved}</span></div>
          </div>
          <div className="table cmp" role="table" aria-label="Promise versus delivery comparison">
            <div className="tr th" role="row"><span role="columnheader">ATTRIBUTE</span><span role="columnheader">PROMISED</span><span role="columnheader">OBSERVED</span><span role="columnheader">STATUS</span><span role="columnheader">EVIDENCE</span></div>
            {r.comparisons?.map((c, i) => (
              <div className="tr" key={i} role="row">
                <span role="cell"><b>{c.attribute}</b></span><span role="cell">{c.promised || "Not stated"}</span><span role="cell">{c.observed || "Not observed"}</span>
                <span role="cell"><i className={"status s-" + c.status}>{c.status} · {Math.round(c.confidence)}% confidence</i></span><span role="cell">{c.evidence}</span>
              </div>
            ))}
          </div>
          <div className="cols">
            <List title="Missing accessories" items={r.missing_accessories} />
            <List title="Damage or differences" items={r.damage_or_differences} />
            <List title="What can’t be verified" items={r.uncertainty} />
            <List title="Suggested next steps" items={r.suggested_next_steps} />
          </div>
          <p className="fine">AI analysis is assistive, not legal proof. <Link to="/history">Back to history</Link></p>
        </>
      )}
    </div>
  );
}
