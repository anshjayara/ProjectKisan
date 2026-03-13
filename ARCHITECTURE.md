# Architecture & System Design

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                       (React/Vite App)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App.jsx (Main)                        │  │
│  │  - State: isAuthenticated, activeTab, diagnosis         │  │
│  │  - Handlers: Login, Navigation, Prediction              │  │
│  └──────┬───────────────────────────────────────────┬───────┘  │
│         │                                           │           │
│    AUTHENTICATED                              NOT AUTHENTICATED│
│         │                                           │           │
│    ┌────▼──────────────┐                  ┌────────▼────────┐  │
│    │ DashboardScreen   │                  │  LoginScreen    │  │
│    │  - Home Tab       │                  │  - Phone input  │  │
│    │  - Sensors Tab    │                  │  - Validation   │  │
│    │  - Upload Tab     │                  │  - OTP info     │  │
│    │  - Alerts Tab     │                  └─────────────────┘  │
│    │  - Reports Tab    │                                        │
│    └────┬──────────────┘                                        │
│         │                                                       │
│    ┌────▼──────────────────────────────┐                       │
│    │  UploadPhotoModal (Component)      │                       │
│    │  ┌──────────────────────────────┐  │                       │
│    │  │ Modal Header + Close Button  │  │                       │
│    │  ├──────────────────────────────┤  │                       │
│    │  │ Modal Body:                  │  │                       │
│    │  │ ┌────────────────────────┐   │  │                       │
│    │  │ │  Upload Area           │   │  │                       │
│    │  │ │  (File Picker)   or    │   │  │ ◄─── FILE SELECT     │
│    │  │ │  Preview Image         │   │  │                       │
│    │  │ └────────────────────────┘   │  │                       │
│    │  ├──────────────────────────────┤  │                       │
│    │  │ Modal Footer:                │  │                       │
│    │  │ [Cancel] [Analyze Image]     │  │                       │
│    │  └──────────────────────────────┘  │                       │
│    │  ┌──────────────────────────────┐  │                       │
│    │  │ Loading Overlay (Optional)   │  │                       │
│    │  │ 🔄 Processing your image...  │  │                       │
│    │  └──────────────────────────────┘  │                       │
│    └────┬──────────────────────────────┘                        │
│         │                                                       │
│         │ onPredictionComplete(result)                          │
│         │                                                       │
│    ┌────▼────────────────────────────┐                         │
│    │ PredictionResultCard             │                         │
│    │ (Displayed in Upload Tab)        │                         │
│    │                                  │                         │
│    │ ┌──────────────────────────────┐ │                         │
│    │ │ 🏥 Leaf Spot    [Unhealthy]  │ │                         │
│    │ ├──────────────────────────────┤ │                         │
│    │ │ Confidence: 78.5%            │ │                         │
│    │ │ Status: Action recommended   │ │                         │
│    │ │ Urgency: [MEDIUM]            │ │                         │
│    │ └──────────────────────────────┘ │                         │
│    │ ┌──────────────────────────────┐ │                         │
│    │ │ Recommended Treatment:       │ │                         │
│    │ │ Prune affected areas...      │ │                         │
│    │ └──────────────────────────────┘ │                         │
│    └──────────────────────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         │  API: POST /api/predict
         │  Headers: multipart/form-data
         │  Body: { file: <image> }
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                        │
│                    (Python Server)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         predict_crop_disease() Route                     │  │
│  │         POST /api/predict                                │  │
│  │                                                          │  │
│  │  1. Validate file:                                       │  │
│  │     - Check Content-Type (must be image/*)              │  │
│  │     - Check file is not empty                           │  │
│  │                                                          │  │
│  │  2. Read image bytes                                     │  │
│  │                                                          │  │
│  │  3. Call predict_disease(bytes) ──────────────┐         │  │
│  │                                               │          │  │
│  └───────────────────────────────────────────────┼──────────┘  │
│                                                  │               │
│  ┌──────────────────────────────────────────────▼──────────┐  │
│  │          Disease Model Service                         │  │
│  │          disease_model.py                              │  │
│  │                                                         │  │
│  │  predict_disease(image_bytes):                          │  │
│  │    1. Preprocess image:                                │  │
│  │       - Open with PIL                                  │  │
│  │       - Convert to RGB                                 │  │
│  │       - Resize to 128x128                              │  │
│  │       - Normalize to [0,1]                             │  │
│  │                                                         │  │
│  │    2. Heuristic Model (Placeholder):                   │  │
│  │       - Analyze RGB channel averages                   │  │
│  │       - Determine disease class                        │  │
│  │       - Calculate confidence                           │  │
│  │       [REPLACE: Load trained model here]               │  │
│  │                                                         │  │
│  │    3. Lookup DISEASE_METADATA:                         │  │
│  │       "Leaf Spot" → {                                  │  │
│  │         treatment: "Prune affected areas...",          │  │
│  │         urgency_level: "medium",                       │  │
│  │         is_healthy: False                              │  │
│  │       }                                                 │  │
│  │                                                         │  │
│  │    4. Return tuple:                                    │  │
│  │       (disease, confidence, urgency_level, is_healthy) │  │
│  │                                                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │     Assemble PredictionResponse (Pydantic)           │  │
│  │                                                       │  │
│  │     return PredictionResponse(                       │  │
│  │       disease=disease,                              │  │
│  │       confidence=round(confidence * 100, 1),        │  │
│  │       treatment=metadata["treatment"],              │  │
│  │       urgency_level=urgency_level,                  │  │
│  │       is_healthy=is_healthy                         │  │
│  │     )                                               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
          Response: 200 OK (JSON)
          ┌─────────────────────────┐
          │ {                       │
          │   disease: "Leaf Spot"  │
          │   confidence: 78.5      │
          │   treatment: "Prune..." │
          │   urgency_level: "med"  │
          │   is_healthy: false     │
          │ }                       │
          └──┬──────────────────────┘
             │
             ▼
      API Response Handler
      (prediction.js)
             │
             ▼
      Store in React State
      (diagnosis)
             │
             ▼
      Render ResultCard Component
```

## Data Flow Sequence

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                            │
└──────────────────────────────────────────────────────────────────┘

1. Click "Upload Crop Photo"
   └─> setIsUploadModalOpen(true)

2. Modal Opens
   └─> Display upload area

3. Select Image File
   └─> handleFileSelect() 
   └─> Validate: file.type.startsWith("image/")
   └─> Create preview URL
   └─> Show preview in modal

4. Click "Analyze Image"
   └─> setIsLoading(true)
   └─> Call predictImage(file)
       └─> Create FormData
       └─> POST /api/predict
       └─> Backend processes
       └─> Return PredictionResponse

5. Receive Prediction Result
   └─> onPredictionComplete(result)
   └─> setDiagnosis(result)
   └─> setActiveTab("upload")
   └─> Close modal

6. Display Result
   └─> PredictionResultCard renders
   └─> Users sees:
       ✓ Disease Name
       ✓ Confidence %
       ✓ Health Status
       ✓ Urgency Level
       ✓ Treatment Recommendation
```

## Component Hierarchy

```
App
├── LoginScreen (Not authenticated)
│   └── Phone input form
│
└── DashboardScreen (Authenticated)
    ├── UploadPhotoModal
    │   ├── Modal Header
    │   ├── Modal Body
    │   │   ├── Upload Area (File Picker)
    │   │   ├── Preview Section (Conditional)
    │   │   └── Error Message (Conditional)
    │   ├── Modal Footer
    │   │   ├── Cancel Button
    │   │   └── Analyze Button
    │   └── Loading Overlay (Conditional)
    │
    ├── Home Tab
    │   ├── Welcome Row
    │   ├── Sensor Panel
    │   ├── HealthScoreCard
    │   ├── Smart Actions Grid
    │   └── Alert Feed
    │
    ├── Sensors Tab
    │   └── Full Sensor Panel
    │
    ├── Upload Tab
    │   ├── Upload Trigger Button
    │   └── PredictionResultCard (Conditional)
    │       ├── Disease Header
    │       ├── Metrics Grid
    │       ├── Treatment Section
    │       └── File Info
    │
    ├── Alerts Tab
    │   └── Full Alert Feed
    │
    ├── Reports Tab
    │   └── Empty State
    │
    └── BottomNavigation
```

## State Management

```
App Component State:
├── isAuthenticated: boolean
├── phoneNumber: string
├── phoneError: string
├── activeTab: string ("home" | "sensors" | "upload" | "alerts" | "reports")
├── isUploadModalOpen: boolean
└── diagnosis: PredictionResponse | null
    ├── disease: string
    ├── confidence: number
    ├── treatment: string
    ├── urgency_level: string
    ├── is_healthy: boolean
    └── fileName: string
```

## API Response Schema

```typescript
interface PredictionResponse {
  disease: "Healthy" | "Bacterial Blight" | "Leaf Spot" | string;
  confidence: number; // 0-100
  treatment: string; // User-readable treatment steps
  urgency_level: "low" | "medium" | "high";
  is_healthy: boolean; // true if healthy, false if disease present
}
```

## File Organization

```
ProjectKisan/
│
├── backend/
│   ├── app/
│   │   ├── main.py (FastAPI app setup)
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── predict.py (Prediction endpoint) ✓
│   │   ├── schemas/
│   │   │   └── prediction.py (PredictionResponse model) ✓
│   │   └── services/
│   │       └── disease_model.py (Model inference logic) ✓
│   ├── models/
│   │   └── crop_disease_model.pth (Trained model)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx (Main app component) ✓
│   │   ├── api/
│   │   │   └── prediction.js (API client) ✓ NEW
│   │   ├── components/
│   │   │   ├── UploadPhotoModal.jsx ✓ NEW
│   │   │   └── PredictionResultCard.jsx ✓ NEW
│   │   ├── styles.css (All styles) ✓
│   │   └── main.jsx
│   └── package.json
│
└── Documentation/
    ├── IMPLEMENTATION_COMPLETE.md
    ├── IMPLEMENTATION_GUIDE.md
    └── SETUP_GUIDE.md
```

## Communication Protocol

### Frontend → Backend
```
POST /api/predict HTTP/1.1
Host: localhost:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="crop.jpg"
Content-Type: image/jpeg

[binary image data]
------WebKitFormBoundary--
```

### Backend → Frontend
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "disease": "Leaf Spot",
  "confidence": 78.5,
  "treatment": "Prune affected areas, improve air circulation, and apply recommended fungicide.",
  "urgency_level": "medium",
  "is_healthy": false
}
```

## Error Handling Flow

```
Frontend Error Scenarios:
├── No file selected
│   └─> Display: "Please select an image first"
│
├── Invalid file type
│   └─> Display: "Please select a valid image file"
│
├── Network error
│   └─> Display: Error message from server
│
└── API returns 400+
    └─> Display: error.detail from response

Backend Error Scenarios:
├── Wrong Content-Type
│   └─> Return: 400 "Only image uploads are supported."
│
├── Empty file
│   └─> Return: 400 "Uploaded file is empty."
│
└── Image processing fails
    └─> Return: 400 "Unable to process image: {exception}"
```

## Scalability Considerations

1. **Model Replacement**: Easy swap of heuristic → trained model
2. **Batch Processing**: Extend API to accept multiple images
3. **Caching**: Add Redis for image processing cache
4. **Database**: Store predictions for history
5. **Auth**: Add JWT authentication
6. **Rate Limiting**: Prevent abuse with rate limiter
7. **CDN**: Serve frontend from CDN for speed
8. **Async Processing**: Use Celery for long-running predictions

---

**This architecture supports the current implementation and is designed for easy expansion.**
