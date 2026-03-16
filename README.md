# 🌾 AgroAid – AI-Powered Crop Monitoring Platform

🔗 **Live Demo:** https://project-kisan-pearl.vercel.app/

AgroAid is an **AI-powered crop health monitoring platform** that helps farmers detect plant diseases, pests, and environmental risks using **computer vision, IoT-based environmental insights, and voice-assisted interaction**.

Farmers can upload crop images, receive AI-based diagnosis, and get preventive recommendations to reduce crop losses.

---

# 🚜 Problem

Crop destruction is a major issue in agriculture.

Crops can be damaged due to:

* Soil pH imbalance
* Climate changes
* Pest infestations
* Bacterial and viral infections

Around **20–30% of global crop yield is lost annually due to pests and diseases**. Many farmers detect these problems **only after significant damage occurs**.

With **4.5+ crore smartphone-using farmers in India**, there is a strong opportunity for **affordable AI-driven crop monitoring solutions**.

---

# 💡 Solution

AgroAid enables farmers to:

* 📸 Upload crop images for **AI-based disease detection**
* 🐛 Identify pests affecting crops
* 🌦 Monitor environmental conditions using **IoT datasets**
* 🔔 Receive **early risk alerts** when environmental conditions threaten crops
* 📄 Generate crop damage reports for **insurance verification**

---

# ✨ Key Features

### 🌱 Crop Disease Detection

AI models analyze crop images using **computer vision and deep learning** to identify plant diseases.

### 🐛 Pest Detection

Detects pests affecting crops and recommends treatment.

### 🎙 Voice Support

Farmers can **describe crop issues using voice**, and results are provided in **text and audio format in Hindi and English**.

### 🌍 IoT-Based Environmental Monitoring

AgroAid integrates regional environmental data such as **temperature and humidity**.

Example:
If a tomato crop requires specific conditions and those conditions **have not been met for 2–3 days**, AgroAid predicts possible damage and **sends a notification to the farmer**.

### 📄 Crop Damage Assessment

Generates structured reports for **insurance claim verification**.

To prevent misuse, AgroAid **cross-validates environmental data from the region** to ensure reported damage matches real conditions.

---

# 🧠 Machine Learning

AgroAid uses **deep learning models** to analyze crop images and detect both **plant diseases and pests**.

**Pipeline**

Crop Image → Image Processing → CNN Model → Disease & Pest Detection → Recommendations

### Datasets Used

* **PlantVillage Dataset**

  * ~54,000 plant images
  * 38 disease classes
  * Used for **crop disease detection**

* **Pest Detection Dataset**

  * Contains labeled pest images
  * Used for **pest identification and classification**


---

# 🏗 Tech Stack

**Frontend**

* React
* Next.js
* Tailwind CSS

**Backend**

* FastAPI (Python)

**Authentication**

* JWT Authentication

**Machine Learning**

* PyTorch
* TensorFlow
* CNN / MobileNet / ResNet

**Image Processing**

* OpenCV

**Deployment**

* Vercel

---

# 🧩 System Flow

Upload Crop Image
↓
Image Processing
↓
AI Model Detection
↓
Environmental Data Validation
↓
Disease Diagnosis + Recommendations

---

# 🚀 Future Scope

* Multilingual AI assistant for farmers
* Mobile application support
* Satellite and remote sensing crop monitoring
* Integration with agricultural research institutions
* Advanced crop stress detection using optical filters

---

# 👨‍💻 Team

**Team Classic**

---

# 📜 License

For educational and research purposes.
