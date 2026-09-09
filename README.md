# MedEase AI 🩺✨

> **"MedEase AI doesn't replace your doctor. It helps you understand your report before you meet one."**

MedEase AI is a full-stack educational medical lab report explainer that translates complex diagnostic test reports into plain, easy-to-understand language (with multi-language support in English, Tamil தமிழ், and more).

---

## 🏛 The Core Architectural Rule

> **The LLM never decides medical status. A deterministic backend rule engine does.**

1. **Deterministic Rule Engine (`rule_engine.py`)**: Takes `(value, reference_low, reference_high)` & inequalities (`< 5`, `> 10`, `≤ 5`, `≥ 10`) → `WITHIN_PROVIDED_RANGE | OUTSIDE_PROVIDED_RANGE | UNABLE_TO_DETERMINE`. Pure Python, zero LLM calls, 100% unit-tested.
2. **Report's Own Printed Range Always Wins**: Generic/internet ranges are never used. If no reliable range is found in the report, status is strictly `UNABLE_TO_DETERMINE`.
3. **The LLM's Sole Scope**: Explaining what the biomarker measures in simple terms, restating status neutrally, translating, and structuring doctor discussion notes. The LLM is strictly prohibited from diagnosing, predicting diseases, or prescribing treatments.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM, Canvas-Confetti.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Uvicorn.
- **Document Parsing**: PyMuPDF (`fitz`) for direct text extraction, Pillow + Tesseract for OCR fallbacks.
- **AI & Translation**: LLM abstraction (Gemini / OpenAI) with built-in offline **Deterministic Demo Provider** (zero API key required).
- **Testing**: Pytest & FastAPI TestClient.

---

## 📁 Project Structure

```
MedEase_AI/
├── backend/
│   ├── app/
│   │   ├── config.py              # App & Demo settings
│   │   ├── main.py                # FastAPI app initialization & CORS
│   │   ├── schemas/report.py      # Pydantic schemas
│   │   ├── services/
│   │   │   ├── pdf_parser.py      # PyMuPDF text extractor
│   │   │   ├── ocr_service.py     # Tesseract/Pillow OCR fallback
│   │   │   ├── medical_extractor.py # Regex/heuristics for tests & ranges
│   │   │   ├── rule_engine.py     # Deterministic status classifier
│   │   │   ├── ai_service.py      # AI explanation & Demo/Mock provider
│   │   │   └── report_store.py    # Report session storage
│   │   └── routes/
│   │       ├── health.py          # /api/health endpoint
│   │       └── reports.py         # Upload, Sample, Analyze, Translate, Summary
│   ├── tests/                     # Comprehensive pytest test suite
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, StatusBadge, ResultDetailModal, etc.
│   │   ├── pages/                 # Home, Upload, Processing, Dashboard, DoctorSummary, About
│   │   ├── services/api.ts        # REST client
│   │   ├── types/report.ts        # TypeScript contracts
│   │   ├── App.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── sample_reports/
│   ├── demo_report.pdf            # Synthetic test lab report
│   └── generate_demo_pdf.py       # PDF generator script
├── .env.example
├── pytest.ini
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend and install dependencies
pip install -r backend/requirements.txt

# (Optional) Copy .env.example to .env
cp .env.example .env

# Run FastAPI backend (starts on http://localhost:8000)
python backend/run.py
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm packages
npm install

# Start development server (starts on http://localhost:5173)
npm run dev
```

---

## 🏆 Hackathon 3-Minute Demo Walkthrough

Judges and evaluators can verify the entire pipeline with **zero manual file setup**:

1. Open `http://localhost:5173`.
2. Click **"Try Sample Report (1-Click Demo)"**.
3. Watch the staged progress checklist (*Reading document → Extracting text → Identifying parameters → Reading reference ranges → Comparing values → Generating explanations → Translating*).
4. Arrive at the **Dashboard** displaying exactly:
   - **3 Within Provided Range** (Hemoglobin, WBC, Platelets)
   - **2 Outside Provided Range** (Example Test A, Example Test B)
   - **1 Unable to Determine** (Example Test C)
5. Click on any row to open the **Parameter Detail Modal** with simple explanations.
6. Switch the language selector from **English to தமிழ் (Tamil)** to see instant multilingual translations.
7. Click **"Generate Doctor Summary"** to review the doctor discussion points with **Copy** and **Print** capabilities.

---

## 🧪 Running the Test Suite

Run the full automated test suite covering the deterministic rule engine, range format variations, and API endpoints:

```bash
# Run pytest from the root directory
python -m pytest -v
```

**Verified Test Cases Include:**
- `13.5` vs `12–16` → `within_provided_range`
- `20` vs `12–16` → `outside_provided_range`
- `10` vs `12–16` → `outside_provided_range`
- `Reference unavailable` → `unable_to_determine`
- Single-sided ranges: `< 5`, `> 10`, `≤ 5`, `≥ 10`
- Sample report end-to-end extraction and classification
- Health check and translation endpoints

---

## 🔒 Safety & Medical Disclaimer

- **Informational Only**: MedEase AI provides informational educational explanations only. It does not diagnose medical conditions, prescribe treatment, or replace professional medical advice.
- **Allowed Status Vocabulary**: `Within Provided Range`, `Outside Provided Range`, `Unable to Determine`.
- **Privacy Guarantees**: Uploaded reports are processed in-memory for the user session without permanent personally identifiable record storage.
