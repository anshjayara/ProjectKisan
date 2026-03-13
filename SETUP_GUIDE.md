# Quick Start Guide - Upload & Prediction Feature

## Prerequisites

- Python 3.8+
- Node.js 14+
- Backend dependencies (see `backend/requirements.txt`)
- Frontend dependencies (see `frontend/package.json`)

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload

# Server will run at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# App will open at: http://localhost:5173
```

## Testing the Feature

### Via UI (Recommended)

1. **Open the app**
   - Frontend: http://localhost:5173
   - Backend: Running on port 8000

2. **Login**
   - Enter any 10-digit phone number (e.g., 9876543210)

3. **Upload Photo**
   - Home tab → Click "Upload Crop Photo for AI Confirmation" button
   - Or Upload tab → Click "Select Crop Photo" button

4. **Select Image**
   - Choose an image from your device
   - See preview in modal
   - Click "Analyze Image"

5. **View Results**
   - Wait for processing spinner
   - See prediction results with:
     - Disease name
     - Confidence %
     - Health status
     - Urgency level
     - Treatment recommendation

### Via API (Testing)

**Upload and predict:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -F "file=@/path/to/image.jpg"

# Response:
{
  "disease": "Leaf Spot",
  "confidence": 78.5,
  "treatment": "Prune affected areas...",
  "urgency_level": "medium",
  "is_healthy": false
}
```

**View API docs:**
- Open http://localhost:8000/docs
- Try the /api/predict endpoint interactively

## Directory Structure

```
ProjectKisan/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/routes/
│   │   │   ├── predict.py ✏️ [Updated]
│   │   │   ├── damage.py
│   │   │   └── weather.py
│   │   ├── schemas/
│   │   │   └── prediction.py ✏️ [Updated]
│   │   └── services/
│   │       └── disease_model.py ✏️ [Updated]
│   ├── models/
│   │   └── crop_disease_model.pth
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx ✏️ [Updated]
│   │   ├── api/
│   │   │   └── prediction.js 🆕 [New]
│   │   ├── components/
│   │   │   ├── UploadPhotoModal.jsx 🆕 [New]
│   │   │   └── PredictionResultCard.jsx 🆕 [New]
│   │   └── styles.css ✏️ [Updated]
│   └── package.json
│
├── IMPLEMENTATION_GUIDE.md 🆕 [This file]
└── README.md
```

## API Endpoints

### Prediction Endpoint

**POST** `/api/predict`

**Request:**
```
Content-Type: multipart/form-data
Body: file (image file)
```

**Success (200):**
```json
{
  "disease": "Healthy" | "Bacterial Blight" | "Leaf Spot",
  "confidence": 0-100,
  "treatment": "string",
  "urgency_level": "low" | "medium" | "high",
  "is_healthy": true | false
}
```

**Error (400):**
```json
{
  "detail": "Error message"
}
```

## Troubleshooting

### Frontend won't connect to backend?
- Check CORS is enabled in `backend/app/main.py` (it is by default)
- Check API_BASE URL in `frontend/src/api/prediction.js`
- Ensure backend is running on port 8000

### Image upload fails?
- Check file is a valid image (JPEG, PNG, etc.)
- Check file isn't empty
- Check backend logs for detailed error

### No prediction results?
- Check browser network tab for API response
- Check backend logs for errors
- Verify `disease_model.py` is correctly processing the image

### Modal won't open?
- Check browser console for JavaScript errors
- Verify component imports are correct
- Check CSS is loaded

## Development Notes

### Adding CSS
All modal and prediction card styles are in `frontend/src/styles.css` at the end of the file.

### Modifying Prediction Logic
Update `predict_disease()` in `backend/app/services/disease_model.py`

### Changing Disease Names
Update `DISEASE_METADATA` dict in `backend/app/services/disease_model.py`

### Adding More Urgency Levels
1. Update schema in `backend/app/schemas/prediction.py`
2. Update response mapping in `backend/app/api/routes/predict.py`
3. Update CSS classes (add to `.urgency-chip` and `.metric-value`)

## Performance Tips

1. **Image Compression**: Consider resizing large images client-side before upload
2. **Loading Time**: Currently set to show results instantly (heuristic model)
3. **Network**: For large images, consider chunked uploads

## Next Steps for Production

1. Replace heuristic model with trained PyTorch/TensorFlow model
2. Add image size validation (max file size)
3. Add rate limiting to API
4. Add authentication to API
5. Add database to store prediction history
6. Add confidence threshold warnings
7. Implement image caching
8. Add telemetry/analytics

---

**Status**: ✅ Ready to Use  
**Last Updated**: 2026-03-13
