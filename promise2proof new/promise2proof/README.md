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
