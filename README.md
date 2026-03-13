# AgroAid Prototype

A basic full-stack prototype for an AI-powered agriculture platform that detects potential crop leaf diseases from uploaded images.

## Stack

- Frontend: React + Vite
- Backend: FastAPI
- AI model: placeholder image-based heuristic model (designed to be replaced by a CNN later)

## Project Structure

```text
ProjectKisan/
	backend/
		app/
			api/
				routes/
					predict.py
					weather.py      # placeholder for future weather risk module
					damage.py       # placeholder for future crop damage module
			schemas/
				prediction.py
			services/
				disease_model.py
			main.py
		requirements.txt
	frontend/
		src/
			App.jsx
			main.jsx
			styles.css
		index.html
		package.json
		vite.config.js
```

## Backend Setup (FastAPI)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs at `http://127.0.0.1:8000`.

Test endpoint docs: `http://127.0.0.1:8000/docs`

### Prediction API

- Method: `POST`
- URL: `http://127.0.0.1:8000/api/predict`
- Form field: `file` (image)
- Response:

```json
{
	"disease": "Leaf Spot",
	"confidence": 0.78,
	"treatment": "Prune affected areas, improve air circulation, and apply recommended fungicide."
}
```

## Frontend Setup (React)

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173`.

Optional API base URL override:

```powershell
$env:VITE_API_BASE_URL="http://127.0.0.1:8000/api"
npm run dev
```

## Deploy To Vercel

This repository is configured to deploy to Vercel as a single project:

- The React frontend is built from `frontend/`.
- The FastAPI backend is exposed as a Vercel Python Function through `api/index.py`.
- API requests use `/api/*` in production by default.

### One-time prerequisite

Install and authenticate the Vercel CLI:

```powershell
npm install -g vercel
vercel login
```

If `vercel whoami` returns an authentication error, run `vercel login` again before deploying.

### Deploy from this repository

From the repository root:

```powershell
vercel --prod --yes
```

Vercel will use the existing root configuration in `vercel.json`:

- Build command: `cd frontend && npm install && npm run build`
- Static output directory: `frontend/dist`
- Python API entrypoint: `api/index.py`

### What gets deployed

- Frontend site at `/`
- FastAPI routes at `/api/*`
- Swagger docs at `/docs`
- Root health response at `/`

Example production endpoint:

```text
https://your-project-name.vercel.app/api/predict
```

### Verify after deploy

Check these URLs after deployment:

```text
https://your-project-name.vercel.app/
https://your-project-name.vercel.app/docs
https://your-project-name.vercel.app/api/predict
```

### Notes

- Large local folders such as datasets and model artifacts are excluded from the Vercel Python bundle by `vercel.json`.
- The current backend uses a heuristic predictor, so deployment does not require loading the `.pth` model file yet.
- If you later switch to a trained model, make sure the required model file is available in the deployed environment and stays within Vercel function bundle limits.

## Future Expansion Hooks

- Weather-based disease prediction: `backend/app/api/routes/weather.py`
- Crop damage assessment: `backend/app/api/routes/damage.py`
- Replace placeholder model logic in `backend/app/services/disease_model.py` with a trained CNN pipeline.