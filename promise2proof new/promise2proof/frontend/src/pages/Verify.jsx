import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CloudUpload, ShieldCheck, Sparkles, X } from "lucide-react";
import { api } from "../api.js";

const empty = {
  product_name: "", brand: "", model: "", listing_url: "", description: "", advertised_specs: "",
  included_accessories: "", warranty: "", received_description: "", observed_specs: "",
  missing_accessories: "", damage_notes: "",
};
const OK = ["image/jpeg", "image/png", "image/webp"];

export default function Verify() {
  const nav = useNavigate();
  const [f, setF] = useState(empty);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

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

  const Field = ({ label, k, ph, area, req }) => (
    <label className="field">
      <span>{label}{req && <em>*</em>}</span>
      {area ? <textarea rows={3} value={f[k]} onChange={set(k)} placeholder={ph} /> : <input value={f[k]} onChange={set(k)} placeholder={ph} />}
    </label>
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow plain">NEW VERIFICATION</div>
          <h1>Compare promise to delivery</h1>
          <p>Add the seller’s claim, then show us what arrived. We’ll keep uncertainty visible.</p>
        </div>
        <span className="private"><ShieldCheck size={15} />Private evidence workspace</span>
      </div>

      <div className="two">
        <section className="panel blue">
          <div className="panel-h"><b className="num dark">01</b><div><h2>What was promised?</h2><small>Seller listing &amp; advertised details</small></div></div>
          <Field label="Product name" k="product_name" ph="e.g. Wireless headphones" req />
          <div className="pair"><Field label="Brand" k="brand" ph="DemoTech" /><Field label="Model" k="model" ph="DT-500" /></div>
          <Field label="Listing URL" k="listing_url" ph="https://store.example/product" />
          <Field label="Description" k="description" ph="Paste the seller’s product description" area />
          <Field label="Advertised specifications" k="advertised_specs" ph="Colour: Black · Battery: 40 hours · Bluetooth 5.3" area />
          <Field label="Included accessories" k="included_accessories" ph="Headphones, charging cable, carrying case" />
          <Field label="Warranty" k="warranty" ph="1 year manufacturer warranty" />
        </section>

        <section className="panel green">
          <div className="panel-h"><b className="num">02</b><div><h2>What was received?</h2><small>Your photos &amp; delivery notes</small></div></div>
          <div className={"drop" + (drag ? " drag" : "")}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
            <CloudUpload size={22} />
            <strong>Drop evidence photos here</strong>
            <small>Product, label, packaging · JPEG, PNG or WEBP · 8MB max</small>
            <button type="button" className="btn primary" onClick={() => input.current.click()}>Choose images</button>
            <input ref={input} type="file" accept={OK.join(",")} multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>
          {files.length > 0 && (
            <div className="thumbs">
              {files.map((x, i) => (
                <div key={i} className="thumb">
                  <img src={URL.createObjectURL(x)} alt={x.name} />
                  <button type="button" aria-label={`Remove ${x.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <Field label="What did you receive?" k="received_description" ph="Describe the product that arrived" area />
          <Field label="Observed specifications" k="observed_specs" ph="Any details you can read from the product or label" area />
          <Field label="Missing accessories" k="missing_accessories" ph="e.g. Carrying case was not in the box" />
          <Field label="Damage or visible differences" k="damage_notes" ph="Scratches, colour, packaging damage…" area />
        </section>
      </div>

      {err && <div className="alert" role="alert">{err}</div>}
      <div className="ready">
        <div><h3>Ready to compare?</h3><small>AI will only report what text and evidence can support.</small></div>
        <button className="btn primary lg" disabled={!!busy} onClick={submit}>
          <Sparkles size={18} />{busy || "Analyse product with AI"}
        </button>
      </div>
    </div>
  );
}
