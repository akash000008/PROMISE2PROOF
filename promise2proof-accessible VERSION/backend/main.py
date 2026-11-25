"""Promise2Proof API - compares a seller's promise with what was delivered, using Gemini vision."""
import base64, datetime, json, os, sqlite3, uuid
from pathlib import Path
from typing import List

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles

load_dotenv()
BASE = Path(__file__).parent
UPLOADS = BASE / "uploads"
UPLOADS.mkdir(exist_ok=True)
DB_PATH = BASE / "p2p.db"
MAX_BYTES = 8 * 1024 * 1024
ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
FIELDS = ["product_name", "brand", "model", "listing_url", "description", "advertised_specs",
          "included_accessories", "warranty", "received_description", "observed_specs",
          "missing_accessories", "damage_notes"]

# Models are tried in order. A 404 means Google retired/renamed a model, so we move to the next one.
# Override the first choice with GEMINI_MODEL in backend/.env; the others stay as safety nets.
FALLBACK_MODELS = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"]


def clean_key() -> str:
    """Read the key from the environment and tolerate common paste mistakes (quotes, spaces, 'KEY=' prefix)."""
    k = (os.getenv("GEMINI_API_KEY") or "").strip().strip("\"'").strip()
    if k.upper().startswith("GEMINI_API_KEY="):
        k = k.split("=", 1)[1].strip().strip("\"'")
    return k


def key_problem(k: str):
    if not k:
        return "No Gemini API key is set. Add GEMINI_API_KEY to backend/.env and restart the server."
    if k.lower().startswith(("http://", "https://")) or "aistudio.google.com" in k.lower():
        return "GEMINI_API_KEY contains a web link. Paste the key itself (it starts with AIza), not the link."
    if any(ch.isspace() for ch in k):
        return "GEMINI_API_KEY contains spaces or line breaks. Paste only the key on a single line."
    if len(k) < 20:
        return "GEMINI_API_KEY looks too short. Copy the full key from aistudio.google.com/apikey."
    return None


def model_candidates():
    first = (os.getenv("GEMINI_MODEL") or "").strip()
    retired = {"gemini-2.0-flash", "gemini-2.0-flash-001", "gemini-2.0-flash-lite", "gemini-2.0-flash-lite-001"}
    order = ([first] if first and first not in retired else []) + FALLBACK_MODELS
    seen, out_ = set(), []
    for m in order:
        if m not in seen:
            seen.add(m)
            out_.append(m)
    return out_


app = FastAPI(title="Promise2Proof API")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
                   allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory=UPLOADS), name="uploads")


def db():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    return c


with db() as c:
    c.execute("""CREATE TABLE IF NOT EXISTS verifications (
        id TEXT PRIMARY KEY, reference TEXT, created_at TEXT, status TEXT,
        data TEXT, images TEXT, report TEXT)""")


def out(r):
    d = json.loads(r["data"])
    return {"id": r["id"], "reference": r["reference"], "created_at": r["created_at"], "status": r["status"],
            **d, "images": json.loads(r["images"]), "report": json.loads(r["report"]) if r["report"] else None}


def get_or_404(vid):
    with db() as c:
        r = c.execute("SELECT * FROM verifications WHERE id=?", (vid,)).fetchone()
    if not r:
        raise HTTPException(404, "Verification not found")
    return r


@app.get("/api/health")
def health():
    k = clean_key()
    problem = key_problem(k)
    return {"ok": True, "gemini": problem is None, "gemini_message": problem or "Gemini engine ready",
            "model": model_candidates()[0]}


@app.post("/api/verifications")
async def create(
    product_name: str = Form(...), brand: str = Form(""), model: str = Form(""), listing_url: str = Form(""),
    description: str = Form(""), advertised_specs: str = Form(""), included_accessories: str = Form(""),
    warranty: str = Form(""), received_description: str = Form(""), observed_specs: str = Form(""),
    missing_accessories: str = Form(""), damage_notes: str = Form(""), images: List[UploadFile] = File(default=[]),
):
    if not product_name.strip():
        raise HTTPException(422, "Product name is required")
    vid = uuid.uuid4().hex
    saved = []
    for f in images:
        if not f.filename:
            continue
        if f.content_type not in ALLOWED:
            raise HTTPException(415, f"{f.filename}: use JPEG, PNG or WEBP images")
        raw = await f.read()
        if len(raw) > MAX_BYTES:
            raise HTTPException(413, f"{f.filename} is larger than 8MB")
        name = f"{vid}-{uuid.uuid4().hex[:8]}{ALLOWED[f.content_type]}"
        (UPLOADS / name).write_bytes(raw)
        saved.append(name)
    if not saved and not received_description.strip():
        raise HTTPException(422, "Add at least one photo or describe what you received")
    local = locals()
    data = {k: local[k].strip() for k in FIELDS}
    ref = "P2P-" + vid[:8].upper()
    now = datetime.datetime.utcnow().isoformat()
    with db() as c:
        c.execute("INSERT INTO verifications VALUES (?,?,?,?,?,?,NULL)",
                  (vid, ref, now, "Draft", json.dumps(data), json.dumps(saved)))
    return out(get_or_404(vid))


PROMPT = """You are an evidence-first product verification analyst. Compare the SELLER'S PROMISE with what the
buyer RECEIVED, using the buyer's photos and notes. Rules:
- Only report what the images or text actually support. Never invent claims.
- Read visible label text, model numbers, colours, accessories and packaging damage from the photos.
- If something cannot be verified from the evidence, mark it "unverified" and explain why.
- Confidence is a number from 0 to 100 reflecting evidence strength.
Return ONLY JSON with this shape:
{"verdict":"match|partial|mismatch|inconclusive","confidence":0-100,"headline":"short title",
 "summary":"2-3 plain sentences",
 "comparisons":[{"attribute":"","promised":"","observed":"","status":"match|mismatch|unverified|missing","confidence":0-100,"evidence":""}],
 "missing_accessories":[""],"damage_or_differences":[""],"uncertainty":[""],"suggested_next_steps":[""]}"""


@app.post("/api/verifications/{vid}/analyze")
async def analyze(vid: str):
    key = clean_key()
    problem = key_problem(key)
    if problem:
        raise HTTPException(503, problem)
    rec = out(get_or_404(vid))
    text = PROMPT + "\n\nSELLER'S PROMISE\n" + "\n".join(
        f"{k}: {rec[k]}" for k in ["product_name", "brand", "model", "listing_url", "description",
                                    "advertised_specs", "included_accessories", "warranty"] if rec[k]) + \
        "\n\nBUYER'S DELIVERY NOTES\n" + "\n".join(
        f"{k}: {rec[k]}" for k in ["received_description", "observed_specs", "missing_accessories",
                                    "damage_notes"] if rec[k])
    parts = [{"text": text}]
    for name in rec["images"]:
        p = UPLOADS / name
        if not p.exists():
            continue
        mime = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}[p.suffix]
        parts.append({"inline_data": {"mime_type": mime, "data": base64.b64encode(p.read_bytes()).decode()}})
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}}

    report, last_error = None, "Gemini could not analyse this record. Please try again."
    async with httpx.AsyncClient(timeout=120) as cl:
        for model in model_candidates():
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            try:
                r = await cl.post(url, headers={"x-goog-api-key": key}, json=body)
            except httpx.HTTPError:
                raise HTTPException(502, "Could not reach Gemini. Check your internet connection and try again.")
            if r.status_code == 404:  # model retired or renamed -> try the next one
                last_error = "None of the configured Gemini models are available. Set GEMINI_MODEL in backend/.env to a current model."
                continue
            if r.status_code in (400, 401, 403):
                try:
                    detail = r.json().get("error", {}).get("message", "")
                except ValueError:
                    detail = ""
                if "API key" in detail or r.status_code in (401, 403):
                    raise HTTPException(502, "Google rejected the API key. Create a new key at aistudio.google.com/apikey and paste the key only (no link).")
                raise HTTPException(502, "Gemini could not read this request. Try smaller or different photos.")
            if r.status_code == 429:
                raise HTTPException(502, "Gemini rate limit reached. Wait a minute and run the analysis again.")
            if r.status_code >= 500:
                last_error = "Gemini is temporarily unavailable. Please try again shortly."
                continue
            try:
                raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                raw = raw.strip()
                if raw.startswith("```"):
                    raw = raw.strip("`").removeprefix("json").strip()
                report = json.loads(raw)
                break
            except (KeyError, IndexError, ValueError):
                last_error = "Gemini returned an unreadable response. Please try again."
                continue
    if report is None:
        raise HTTPException(502, last_error)
    report["notes"] = ""
    with db() as c:
        c.execute("UPDATE verifications SET report=?, status='Analysed' WHERE id=?", (json.dumps(report), vid))
    return out(get_or_404(vid))


@app.get("/api/verifications")
def list_all():
    with db() as c:
        rows = c.execute("SELECT * FROM verifications ORDER BY created_at DESC").fetchall()
    return [out(r) for r in rows]


@app.get("/api/verifications/{vid}")
def one(vid: str):
    return out(get_or_404(vid))


@app.patch("/api/verifications/{vid}/report")
def edit_report(vid: str, body: dict):
    rec = out(get_or_404(vid))
    if not rec["report"]:
        raise HTTPException(409, "Run the analysis first")
    for k in ("summary", "notes"):
        if k in body:
            rec["report"][k] = str(body[k])
    with db() as c:
        c.execute("UPDATE verifications SET report=? WHERE id=?", (json.dumps(rec["report"]), vid))
    return out(get_or_404(vid))


@app.get("/api/verifications/{vid}/export")
def export(vid: str):
    rec = out(get_or_404(vid))
    return Response(json.dumps(rec, indent=2), media_type="application/json",
                    headers={"Content-Disposition": f'attachment; filename="{rec["reference"]}.json"'})


@app.delete("/api/verifications/{vid}", status_code=204)
def delete(vid: str):
    rec = out(get_or_404(vid))
    for n in rec["images"]:
        (UPLOADS / n).unlink(missing_ok=True)
    with db() as c:
        c.execute("DELETE FROM verifications WHERE id=?", (vid,))
