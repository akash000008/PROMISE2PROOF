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

  if (err && !rec) return <div className="page"><div className="alert">{err}</div></div>;
  if (!rec) return <div className="page"><p>Loading report…</p></div>;
  const r = rec.report;

  return (
    <div className="page report">
      <div className="page-head">
        <div>
          <div className="eyebrow plain">{rec.reference}</div>
          <h1>{rec.product_name}</h1>
          <p>{[rec.brand, rec.model].filter(Boolean).join(" · ") || "Verification report"}</p>
        </div>
        <div className="btns noprint">
          {r && <a className="btn ghost" href={exportUrl(rec.id)}><Download size={16} />Export JSON</a>}
          {r && <button className="btn ghost" onClick={() => window.print()}><Printer size={16} />Print</button>}
          <button className="btn primary" disabled={busy} onClick={run}><Sparkles size={16} />{busy ? "Analysing…" : r ? "Re-run analysis" : "Analyse with AI"}</button>
        </div>
      </div>
      {err && <div className="alert" role="alert">{err}</div>}

      {rec.images.length > 0 && <div className="thumbs big">{rec.images.map((n) => <a key={n} href={imageUrl(n)} target="_blank" rel="noreferrer"><img src={imageUrl(n)} alt="Delivery evidence" /></a>)}</div>}

      {!r ? (
        <div className="empty"><h3>This record is a draft</h3><p>Your evidence is saved. Run the analysis to see how the delivery compares with the promise.</p></div>
      ) : (
        <>
          <div className={"verdict " + r.verdict}>
            <div><small>{VERDICT[r.verdict] || r.verdict}</small><h2>{r.headline}</h2></div>
            <div className="conf"><b>{Math.round(r.confidence)}%</b><small>confidence</small></div>
          </div>
          <div className="rcard"><h3>Summary <small>(editable)</small></h3>
            <textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
            <h3>Your notes</h3>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add order number, seller messages, dates…" />
            <div className="noprint"><button className="btn primary sm" onClick={save}>Save changes</button> <span className="ok-txt">{saved}</span></div>
          </div>
          <div className="table cmp">
            <div className="tr th"><span>ATTRIBUTE</span><span>PROMISED</span><span>OBSERVED</span><span>STATUS</span><span>EVIDENCE</span></div>
            {r.comparisons?.map((c, i) => (
              <div className="tr" key={i}>
                <span><b>{c.attribute}</b></span><span>{c.promised || "—"}</span><span>{c.observed || "—"}</span>
                <span><i className={"status s-" + c.status}>{c.status} · {Math.round(c.confidence)}%</i></span><span>{c.evidence}</span>
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
