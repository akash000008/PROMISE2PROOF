[README.md](https://github.com/user-attachments/files/35402853/README.md)
# Promise2Proof

Compare what a seller promised with what actually arrived. Upload the listing details and your delivery photos;
Gemini vision reads labels, compares attributes, and reports confidence and uncertainty.

**Stack:** React 18 + Vite · FastAPI · SQLite · Google Gemini API

## Features
- Landing page, workspace (Overview / New verification / History) and editable, printable reports
- Multi-image upload (JPEG/PNG/WEBP, 8MB each) with drag and drop
- Gemini-powered promise-vs-delivery comparison with per-attribute status and confidence
- Export a report as JSON, delete records (photos are deleted too)

## Run locally
Backend (port 8000):
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```
Frontend (port 5173):
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. The dev server proxies `/api` and `/uploads` to the backend.

## Gemini API key (read this if analysis fails)
1. Create a free key at https://aistudio.google.com/apikey
2. In `backend/.env` set `GEMINI_API_KEY=AIza...` — paste **only the key** (no link, quotes or spaces) and restart the backend.
3. The top bar shows **Gemini engine ready** when the key looks valid, or says what is wrong with it.

The backend tries `gemini-3.5-flash`, then `gemini-flash-latest`, then `gemini-3.1-flash-lite`, so a retired model
(`404`) no longer breaks analysis. `gemini-2.0-flash` was shut down by Google and is ignored if left in `.env`.
Keep the key on the server only; never commit `.env`.

| Message | Meaning |
|---|---|
| Google rejected the API key | Wrong, revoked or restricted key — create a new one |
| Gemini rate limit reached | Free-tier limit; wait a minute |
| None of the configured Gemini models are available | Set `GEMINI_MODEL` in `.env` to a current model |

## Accessibility
Built toward WCAG 2.2 AA: skip link, landmarks, labelled form fields with required-state announcements, keyboard-operable
upload and delete controls, live-region status and error messages, page titles and focus moved to the main content on
navigation, table semantics for history and reports, descriptive image alternatives, AA colour contrast, 44px tap targets,
visible focus rings, reduced-motion, forced-colours and print support.

## Deploy
Build the frontend with `npm run build` and host `frontend/dist` (set `VITE_API_URL` to your API URL before building).
Run the API with `uvicorn main:app --host 0.0.0.0 --port 8000` and set `CORS_ORIGINS` to your frontend URL.

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Engine status |
| POST | `/api/verifications` | Create draft (multipart form + images) |
| POST | `/api/verifications/{id}/analyze` | Run Gemini analysis |
| GET | `/api/verifications` / `/{id}` | List / fetch |
| PATCH | `/api/verifications/{id}/report` | Edit summary and notes |
| GET | `/api/verifications/{id}/export` | Download JSON |
| DELETE | `/api/verifications/{id}` | Delete record and photos |

AI analysis is assistive, not legal proof.
