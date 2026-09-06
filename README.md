# MoSPI AI-Enabled Adaptive Learning & Assessment Platform
### Problem Statement: SIH26101 | Ministry of Statistics and Programme Implementation (MoSPI)
**Smart India Hackathon (SIH) 2026**

---

## 📌 Executive Summary

India's Official Statistical System spans thousands of officers across Central (NSSO, CSO), State (DES), and District tiers. This platform replaces traditional one-size-fits-all training with an **AI-driven, continuous capacity-building ecosystem**.

### Key Innovations:
1. **Psychometric Adaptive Diagnostic Engine (CAT & 2PL IRT)**: Dynamic question difficulty adjustment based on **2-Parameter Logistic Item Response Theory** and **Fisher Information maximization**, delivering accurate ability ($\theta$) estimation in under 15 minutes.
2. **Grounded Document-to-Assessment RAG Pipeline**: Ingests official statistical circulars and handbooks (NSS 78th Round, PLFS, ASI, CPI), extracting structured questions with verbatim citations and confidence scoring ($S_{\text{conf}}$).
3. **Human-in-the-Loop SME Review Queue**: Split-screen verification interface comparing generated questions against source text before publishing to the active question bank.
4. **iGOT Karmayogi Personalized Course Recommender**: Maps competency deficit vectors ($\Delta C_m = \max(0, T_{R, m} - P_{i, m})$) into ranked training roadmaps with xAPI/SCORM completion triggers.
5. **Multi-Tier Institutional Analytics**: Real-time state readiness heatmaps across India, cadre deficit matrices, and executive training ROI KPIs.
6. **Bilingual & Accessible UI**: Full English $\leftrightarrow$ Hindi localization with clean, flat design per WCAG 2.1 AA guidelines.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               USER ACCESS & PRESENTATION TIER                          │
│                                                                                        │
│   ┌───────────────────────┐   ┌───────────────────────┐   ┌────────────────────────┐   │
│   │  Statistical Officer  │   │  Training Coordinator │   │  SME Citation Reviewer │   │
│   │  (Learner Portal)     │   │  (Division Console)   │   │  (Split-Screen UI)     │   │
│   └───────────┬───────────┘   └───────────┬───────────┘   └────────────┬───────────┘   │
│               │                           │                            │               │
│               └───────────────────────────┴─────────────┬──────────────┘               │
│                                                         │ React 18 + Vite (Inter)      │
│                                                         │ Bilingual (English / Hindi)  │
└─────────────────────────────────────────────────────────┼──────────────────────────────┘
                                                          │ HTTPS / REST API
┌─────────────────────────────────────────────────────────▼──────────────────────────────┐
│                                    CORE BACKEND MICROSERVICES                          │
│                                                                                        │
│   ┌──────────────────────────────┐   ┌──────────────────────────────┐                  │
│   │ Document Ingestion & RAG     │   │ Psychometric Diagnostic      │                  │
│   │ Service (LangChain / Llama)  │   │ Engine (CAT / 2PL IRT)       │                  │
│   └──────────────┬───────────────┘   └──────────────┬───────────────┘                  │
│                  │                                  │                                  │
│   ┌──────────────┴───────────────┐   ┌──────────────┴───────────────┐                  │
│   │ SME Review & Q-Bank Lifecycle│   │ iGOT Karmayogi Recommender   │                  │
│   │ State Machine                │   │ & Multi-Tier Analytics Svc   │                  │
│   └──────────────────────────────┘   └──────────────────────────────┘                  │
└──────────────────────────────┬──────────────────────────────┬──────────────────────────┘
                               │                              │
                ┌──────────────▼──────────────┐ ┌─────────────▼──────────────┐
                │ Data Persistence & Bank     │ │ Vector Embeddings Store    │
                │ SQLite / PostgreSQL         │ │ In-Memory / ChromaDB       │
                │ (Users, Competencies, IRT)  │ │ (Manual Chunks & Citations)│
                └─────────────────────────────┘ └────────────────────────────┘
```

---

## 👥 Supported Operational Personas

| Persona | Role | Key Capabilities |
|---|---|---|
| **Statistical Officer** | End Learner | CAT Adaptive Test Runner, 5-Axis Competency Radar Chart, Skill Deficit Vector, iGOT Learning Roadmap |
| **Training Coordinator** | Regional Unit | Division Cohort Progress, Incomplete Test Alerts, Manual Training Mandates, 1-Click RAG Authoring |
| **SME Reviewer** | Subject Matter Expert | Split-Screen Source Citation Inspector, Grounding Confidence Badge ($S_{\text{conf}}$), Approve/Edit/Reject |
| **MoSPI HQ Admin** | Directorate | State-Wise Statistical Readiness Heatmap, Cadre Deficit Matrix (JSO vs SSO vs Director), JSON/PDF Export |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas/SVG Charts, Bilingual i18n
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLite / PostgreSQL
- **Psychometrics**: 2-Parameter Logistic (2PL) IRT, Maximum Likelihood Estimation (MLE), Fisher Information
- **AI & RAG**: Semantic chunking, cosine vector similarity, grounding verification, distractor calibration
- **Deployment**: Vercel Serverless (`vercel.json` + `api/index.py`), Docker-ready

---

## 🚀 Quick Start (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/ssolanke22562/SIH-2k26.git
cd SIH-2k26
```

### 2. Start the Backend API
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### 3. Start the Frontend Client
```bash
cd ../frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🌐 Deploy to Vercel (Step-by-Step)

This repository includes pre-configured `vercel.json` and `api/index.py` files for instant full-stack deployment on Vercel.

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete platform architecture"
   git push origin main
   ```
2. Go to **[Vercel Dashboard](https://vercel.com/dashboard)** $\to$ **Add New Project**.
3. Import `ssolanke22562/SIH-2k26`.
4. Keep the default settings (Vite / Root `./`).
5. Set Environment Variable:
   ```env
   VITE_API_BASE=/api/v1
   ```
6. Click **Deploy**.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/auth/users` | List pre-seeded demo personas for 1-click login |
| `POST` | `/api/v1/diagnostic/start` | Initialize CAT test session ($\theta_0 = 0.0$) |
| `GET` | `/api/v1/diagnostic/{id}/next-item` | Retrieve next item maximizing Fisher Information |
| `POST` | `/api/v1/diagnostic/submit-item` | Submit response, update $\theta$ ability via MLE |
| `GET` | `/api/v1/diagnostic/{id}/report` | Retrieve radar proficiency & skill gap report |
| `GET` | `/api/v1/recommendations/user/{id}` | Retrieve ranked iGOT courses for gap closure |
| `POST` | `/api/v1/recommendations/enroll` | Enroll officer in iGOT module |
| `POST` | `/api/v1/recommendations/xapi-complete` | Simulate xAPI completion webhook & trigger re-test |
| `POST` | `/api/v1/documents/generate-assessment` | Trigger grounded RAG question authoring |
| `GET` | `/api/v1/sme/review-queue` | Fetch unverified questions with citations |
| `POST` | `/api/v1/sme/questions/{id}/approve` | Approve question into active test bank |
| `GET` | `/api/v1/analytics/institutional` | State readiness heatmap & training ROI metrics |
| `GET` | `/api/v1/analytics/coordinator` | Division cohort statistics & at-risk list |

---

## 📜 License & Acknowledgements

Developed for the **Smart India Hackathon (SIH) 2026** under the **Ministry of Statistics and Programme Implementation (MoSPI)** Problem Statement **SIH26101**.
