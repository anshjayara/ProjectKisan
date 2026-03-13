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
uvicorn app.main:app --reload
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
$env:VITE_API_BASE_URL="http://127.0.0.1:8000"
npm run dev
```

## Future Expansion Hooks

- Weather-based disease prediction: `backend/app/api/routes/weather.py`
- Crop damage assessment: `backend/app/api/routes/damage.py`
- Replace placeholder model logic in `backend/app/services/disease_model.py` with a trained CNN pipeline.