import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CloudUpload, ShieldCheck, Sparkles, X } from "lucide-react";
import { api } from "../api.js";

const empty = {
  product_name: "", brand: "", model: "", listing_url: "", description: "", advertised_specs: "",
  included_accessories: "", warranty: "", received_description: "", observed_specs: "",
  missing_accessories: "", damage_notes: "",
};
const OK = ["image/jpeg", "image/png", "image/webp"];

// Defined outside the page component so it keeps its identity between renders.
// (Defining it inside made the input lose focus after every keystroke.)
function Field({ label, value, onChange, ph, area, req, name, autoComplete }) {
  const id = useId();
  const Tag = area ? "textarea" : "input";
  return (
    <div className="field">
      <label htmlFor={id}>{label}{req && <><em aria-hidden="true">*</em><span className="sr-only"> (required)</span></>}</label>
      <Tag id={id} name={name} value={value} onChange={onChange} placeholder={ph} aria-required={req || undefined}
        autoComplete={autoComplete} {...(area ? { rows: 3 } : { type: "text" })} />
    </div>
  );
}

export default function Verify() {
  const nav = useNavigate();
  const [f, setF] = useState(empty);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef();
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const previews = useMemo(() => files.map((x) => URL.createObjectURL(x)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const errRef = useRef();
  useEffect(() => { if (err && errRef.current) errRef.current.focus(); }, [err]);

  const addFiles = (list) => {
    const next = [];
    for (const file of list) {
      if (!OK.includes(file.type)) { setErr(`${file.name}: use JPEG, PNG or WEBP images.`); continue; }
      if (file.size > 8 * 1024 * 1024) { setErr(`${file.name} is larger than 8MB.`); continue; }
      next.push(file);
    }
    setFiles((p) => [...p, ...next]);
  };

  const submit = async () => {
    setErr("");
    if (!f.product_name.trim()) return setErr("Enter the product name to continue.");
    if (!files.length && !f.received_description.trim()) return setErr("Add at least one photo or describe what you received.");
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    files.forEach((x) => fd.append("images", x));
    let rec;
    try {
      setBusy("Saving your evidence…");
      rec = await api.create(fd);
      setBusy("Comparing promise to delivery…");
      await api.analyze(rec.id);
    } catch (e) {
      setErr(e.message);
      setBusy("");
      if (rec) nav(`/report/${rec.id}`); // evidence is saved as a draft; open it so nothing is lost
      return;
    }
    nav(`/report/${rec.id}`);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow plain">NEW VERIFICATION</p>
          <h1>Compare promise to delivery</h1>
          <p>Add the seller’s claim, then show us what arrived. We’ll keep uncertainty visible.</p>
        </div>
        <span className="private"><ShieldCheck size={15} aria-hidden="true" />Private evidence workspace</span>
      </div>

      <div className="two">
        <section className="panel blue" aria-labelledby="promised-h">
          <div className="panel-h"><b className="num dark" aria-hidden="true">01</b><div><h2 id="promised-h">What was promised?</h2><small>Seller listing &amp; advertised details</small></div></div>
          <Field label="Product name" name="product_name" value={f.product_name} onChange={set("product_name")} ph="e.g. Wireless headphones" req />
          <div className="pair"><Field label="Brand" name="brand" value={f.brand} onChange={set("brand")} ph="DemoTech" /><Field label="Model" name="model" value={f.model} onChange={set("model")} ph="DT-500" /></div>
          <Field label="Listing URL" name="listing_url" value={f.listing_url} onChange={set("listing_url")} ph="https://store.example/product" />
          <Field label="Description" name="description" value={f.description} onChange={set("description")} ph="Paste the seller’s product description" area />
          <Field label="Advertised specifications" name="advertised_specs" value={f.advertised_specs} onChange={set("advertised_specs")} ph="Colour: Black · Battery: 40 hours · Bluetooth 5.3" area />
          <Field label="Included accessories" name="included_accessories" value={f.included_accessories} onChange={set("included_accessories")} ph="Headphones, charging cable, carrying case" />
          <Field label="Warranty" name="warranty" value={f.warranty} onChange={set("warranty")} ph="1 year manufacturer warranty" />
        </section>

        <section className="panel green" aria-labelledby="received-h">
          <div className="panel-h"><b className="num" aria-hidden="true">02</b><div><h2 id="received-h">What was received?</h2><small>Your photos &amp; delivery notes</small></div></div>
          <div className={"drop" + (drag ? " drag" : "")}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
            <CloudUpload size={22} aria-hidden="true" />
            <strong>Drop evidence photos here</strong>
            <small id="drop-hint">Product, label, packaging · JPEG, PNG or WEBP · 8MB max</small>
            <button type="button" className="btn primary" aria-describedby="drop-hint" onClick={() => input.current.click()}>Choose images</button>
            <input ref={input} type="file" accept={OK.join(",")} multiple hidden aria-label="Choose evidence images" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>
          {files.length > 0 && (
            <ul className="thumbs" aria-label={`${files.length} photo${files.length === 1 ? "" : "s"} selected`}>
              {files.map((x, i) => (
                <li key={x.name + i} className="thumb">
                  <img src={previews[i]} alt={`Selected photo: ${x.name}`} />
                  <button type="button" aria-label={`Remove ${x.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={14} aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
          <Field label="What did you receive?" name="received_description" value={f.received_description} onChange={set("received_description")} ph="Describe the product that arrived" area />
          <Field label="Observed specifications" name="observed_specs" value={f.observed_specs} onChange={set("observed_specs")} ph="Any details you can read from the product or label" area />
          <Field label="Missing accessories" name="missing_accessories" value={f.missing_accessories} onChange={set("missing_accessories")} ph="e.g. Carrying case was not in the box" />
          <Field label="Damage or visible differences" name="damage_notes" value={f.damage_notes} onChange={set("damage_notes")} ph="Scratches, colour, packaging damage…" area />
        </section>
      </div>

      {err && <div className="alert" role="alert" tabIndex={-1} ref={errRef}>{err}</div>}
      <div className="ready">
        <div><h2 className="h3">Ready to compare?</h2><small>AI will only report what text and evidence can support.</small></div>
        <button className="btn primary lg" aria-disabled={!!busy} onClick={() => !busy && submit()}>
          <Sparkles size={18} aria-hidden="true" />{busy || "Analyse product with AI"}
        </button>
        <span className="sr-only" role="status" aria-live="polite">{busy}</span>
      </div>
    </div>
  );
}
