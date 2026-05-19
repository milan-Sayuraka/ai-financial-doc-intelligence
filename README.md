# 🧠 AI Financial Document Intelligence System

> A comprehensive AI-powered financial intelligence platform combining document processing, machine learning, and multi-agent workflows for automated financial analysis and decision-making.

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0-red?logo=pytorch)](https://pytorch.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [ML Models](#-ml-models)
- [Testing](#-testing)
- [Roadmap](#️-roadmap)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│               Frontend  ·  React + TypeScript  ·  Port 3000   │
│                                                              │
│   ┌─────────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐  │
│   │  Dashboard  │  │ AI Chat  │  │ Documents │  │ML/Ops  │  │
│   └─────────────┘  └──────────┘  └───────────┘  └────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │  HTTP / REST
                           ▼
┌──────────────────────────────────────────────────────────────┐
│               Backend  ·  FastAPI + Python  ·  Port 8000      │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                    AI Services Layer                  │   │
│   │  ┌──────────┐  ┌──────────┐  ┌───────┐  ┌────────┐  │   │
│   │  │  Chat    │  │  Doc AI  │  │  RAG  │  │Agents  │  │   │
│   │  │(Groq /   │  │(OCR /    │  │(Chroma│  │(Lang-  │  │   │
│   │  │ Gemini)  │  │ PyMuPDF) │  │  DB)  │  │ Graph) │  │   │
│   │  └──────────┘  └──────────┘  └───────┘  └────────┘  │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                  ML Models  ·  PyTorch                │   │
│   │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│   │  │ Credit Risk │  │    Fraud     │  │  Repayment  │  │   │
│   │  │    Model    │  │  Detection   │  │  Predictor  │  │   │
│   │  └─────────────┘  └──────────────┘  └─────────────┘  │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas  ·  Cloud Database            │
│      ┌──────────┐       ┌───────────┐       ┌────────────┐   │
│      │  Users   │       │ Documents │       │    Chat    │   │
│      └──────────┘       └───────────┘       └────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🤖 AI Chat Assistant
- Smart financial advisor powered by **Groq (Llama3-8B)** or **Google Gemini**
- Context-aware conversations with financial domain knowledge
- Quick-info lookups for loans, repayments, documents, and credit scores
- Conversation history persisted in MongoDB

### 📄 Document AI
- **OCR extraction** via Tesseract for images
- **PDF processing** via PyMuPDF
- Structured data extraction from NICs, salary slips, and bank statements
- Confidence scoring and document validation workflow

### 🔍 RAG System *(Retrieval-Augmented Generation)*
- Semantic search over financial documents with **ChromaDB**
- Vector embeddings via Sentence Transformers (`all-MiniLM-L6-v2`)
- RAG-enhanced chat combining the knowledge base with the LLM
- Pre-loaded knowledge base covering loan policies, repayment rules, and credit criteria

### 🤝 Multi-Agent AI System *(LangGraph)*
| Agent | Responsibility |
|-------|---------------|
| Loan Agent | Application processing & validation |
| Risk Agent | Credit risk assessment & scoring |
| Verification Agent | Document cross-validation |
| Collection Agent | Repayment monitoring & collection actions |

All agents are orchestrated in a coordinated pipeline.

### 🧠 Machine Learning Models *(PyTorch)*
- **Credit Risk Model** — Neural network (128 → 64 → 32)
- **Fraud Detection** — Autoencoder + Classifier for anomaly detection
- **Repayment Predictor** — Multi-task NN for payment behaviour prediction
- Real-time predictions with detailed factor analysis

### 🔐 Security
- JWT token-based authentication
- Role-based access control (Admin, Analyst, Manager)
- Password hashing with SHA-256 + salt

### 🎨 Modern UI
- React 18 + TypeScript, Ant Design 5, Redux Toolkit
- Responsive layout with collapsible sidebar
- Interactive dashboards with live statistics

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.12 | Core language |
| FastAPI | Web framework |
| MongoDB Atlas | Cloud database |
| Beanie ODM + Motor | Async MongoDB ORM |
| LangChain + LangGraph | LLM framework & multi-agent workflows |
| PyTorch | Deep learning models |
| ChromaDB | Vector database |
| Sentence Transformers | Text embeddings |
| Tesseract OCR | Image text extraction |
| PyMuPDF | PDF processing |
| python-jose | JWT authentication |
| Pydantic | Data validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type safety |
| Ant Design 5 | Component library |
| Redux Toolkit | State management |
| React Router 6 | Client-side routing |
| Axios | HTTP client |
| Recharts | Data visualisation |

### AI / ML Models
| Model | Architecture | Framework |
|-------|-------------|-----------|
| Credit Risk | Neural Network (128→64→32) | PyTorch |
| Fraud Detection | Autoencoder + Classifier | PyTorch |
| Repayment Predictor | Multi-task Neural Network | PyTorch |
| Text Embeddings | all-MiniLM-L6-v2 | Sentence Transformers |
| LLM | Llama3-8B / Gemini Pro | Groq / Google |

---

## 📁 Project Structure

```
ai-financial-doc-intelligence/
├── backend/
│   ├── app/
│   │   ├── agents/                  # Multi-agent system
│   │   │   ├── base_agent.py
│   │   │   ├── loan_agent.py
│   │   │   ├── risk_agent.py
│   │   │   ├── verification_agent.py
│   │   │   ├── collection_agent.py
│   │   │   ├── workflow.py          # Agent orchestrator
│   │   │   └── state.py
│   │   ├── ai/                      # AI services
│   │   ├── config/
│   │   │   ├── settings.py
│   │   │   ├── database.py
│   │   │   └── logging.py
│   │   ├── core/
│   │   │   └── security.py          # JWT & password hashing
│   │   ├── middleware/
│   │   │   └── auth.py
│   │   ├── ml/
│   │   │   ├── models/
│   │   │   │   └── credit_risk_model.py
│   │   │   ├── training/
│   │   │   │   └── trainer.py
│   │   │   ├── data_processor.py
│   │   │   └── ml_service.py
│   │   ├── models/                  # Database models
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   └── chat.py
│   │   ├── routes/                  # API endpoints
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── rag.py
│   │   │   ├── rag_chat.py
│   │   │   ├── agents.py
│   │   │   ├── ml.py
│   │   │   └── health.py
│   │   ├── services/                # Business logic
│   │   │   ├── ai_chat_service.py
│   │   │   ├── document_service.py
│   │   │   ├── ocr_service.py
│   │   │   └── rag_service.py
│   │   ├── utils/
│   │   │   └── file_handler.py
│   │   └── main.py
│   ├── uploads/
│   ├── logs/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── AppLayout.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── RAGPage.tsx
│   │   │   ├── AgentsPage.tsx
│   │   │   └── MLPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   └── slices/
│   │   │       ├── authSlice.ts
│   │   │       ├── chatSlice.ts
│   │   │       ├── documentSlice.ts
│   │   │       ├── ragSlice.ts
│   │   │       ├── agentSlice.ts
│   │   │       └── mlSlice.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 16+**
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas))
- **Groq API key** ([free](https://console.groq.com/keys)) or **Gemini API key** ([free](https://makersuite.google.com/app/apikey))
- **Tesseract OCR** installed locally

---

### 1 · Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-financial-doc-intelligence.git
cd ai-financial-doc-intelligence
```

### 2 · Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net
MONGODB_DB=financial_intelligence_db

# AI keys
GROQ_API_KEY=gsk_your_groq_key
GEMINI_API_KEY=your_gemini_key

# Security
JWT_SECRET_KEY=your-random-secret-key
```

### 3 · Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

`.env` defaults:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 4 · Run the Application

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 — Frontend
cd frontend && npm start
```

### 5 · Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/api/docs |
| Health Check | http://localhost:8000/api/v1/health |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login — returns JWT |
| `GET` | `/api/v1/health` | Health check |

### AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat/send` | Send message |
| `GET` | `/api/v1/chat/conversations` | List conversations |
| `GET` | `/api/v1/chat/conversations/{id}/messages` | Get messages |
| `GET` | `/api/v1/chat/quick-info/{topic}` | Quick financial info |

### Document AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/documents/upload` | Upload document |
| `GET` | `/api/v1/documents/` | List documents |
| `GET` | `/api/v1/documents/{id}` | Get document |
| `PUT` | `/api/v1/documents/{id}/validate` | Validate document |

### RAG System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/rag/search` | Semantic search |
| `POST` | `/api/v1/rag/documents` | Add to knowledge base |
| `GET` | `/api/v1/rag/stats` | RAG statistics |
| `POST` | `/api/v1/rag-chat/send` | RAG-enhanced chat |

### AI Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/agents/process-loan` | Run loan pipeline |
| `POST` | `/api/v1/agents/quick-risk-check` | Quick risk check |
| `GET` | `/api/v1/agents/agents/status` | Agent status |

### ML Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ml/credit-risk` | Credit risk score |
| `POST` | `/api/v1/ml/fraud-detection` | Fraud detection |
| `POST` | `/api/v1/ml/repayment-prediction` | Repayment forecast |
| `POST` | `/api/v1/ml/train` | Train / retrain models |
| `GET` | `/api/v1/ml/models/status` | Model status |

---

## 🧠 ML Models

All three models are built with PyTorch and exposed via the `/api/v1/ml` endpoints.

**Credit Risk Model** — Fully-connected network (128→64→32→1). Accepts income, loan amount, credit score, and repayment history to output a risk score.

**Fraud Detection** — Two-stage: an autoencoder learns a compressed representation of legitimate transactions, then a classifier flags anomalies based on reconstruction error.

**Repayment Predictor** — Multi-task network that outputs both a probability of on-time repayment and an estimated monthly instalment, sharing lower-layer representations.

---

## 🧪 Testing

Quick smoke-tests using `curl`:

```bash
# 1. Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"Admin@123","full_name":"Admin","role":"admin"}'

# 2. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# 3. Chat
curl -X POST http://localhost:8000/api/v1/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message":"What are personal loan requirements?"}'

# 4. Credit risk prediction
curl -X POST http://localhost:8000/api/v1/ml/credit-risk \
  -H "Content-Type: application/json" \
  -d '{"monthly_income":150000,"loan_amount":1000000,"credit_score":720}'
```

---

## 🗺️ Roadmap

### Completed ✅
- FastAPI backend with MongoDB Atlas
- JWT authentication & role-based access control
- AI Chat (Groq / Gemini)
- Document AI with OCR extraction
- RAG system with ChromaDB
- Multi-agent system with LangGraph
- PyTorch ML models
- React + TypeScript frontend with Ant Design & Redux

### Upcoming 🔮
- [ ] Real-time WebSocket chat
- [ ] Advanced analytics dashboard (charts)
- [ ] Model explainability (SHAP / LIME)
- [ ] CI/CD with GitHub Actions
- [ ] Docker + Kubernetes deployment
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Sinhala / Tamil)
- [ ] Sri Lankan CRIB integration
- [ ] Automated government API document verification

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Financial Intelligence System |
| `DEBUG` | Debug mode | `True` |
| `MONGODB_URL` | Atlas connection string | — |
| `MONGODB_DB` | Database name | `financial_intelligence_db` |
| `JWT_SECRET_KEY` | JWT signing key | — |
| `GROQ_API_KEY` | Groq API key | — |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `MAX_UPLOAD_SIZE` | Max upload size (bytes) | `10485760` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## 🔧 Troubleshooting

**MongoDB connection fails**
Ensure your IP is whitelisted in MongoDB Atlas under *Network Access*, and verify the connection string in `.env`.

**Tesseract not found**
Install from the [official Windows build](https://github.com/UB-Mannheim/tesseract/wiki) or via your package manager (`brew install tesseract` / `apt install tesseract-ocr`), then verify with `tesseract --version`.

**Frontend build errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Backend import errors**
```bash
pip install -r requirements.txt --force-reinstall
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add your feature'`
4. Push — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Your Name** · [GitHub](https://github.com/yourusername) · [LinkedIn](https://linkedin.com/in/yourprofile)

---

## 🙏 Acknowledgements

[FastAPI](https://fastapi.tiangolo.com) · [LangChain](https://www.langchain.com) · [Groq](https://groq.com) · [Ant Design](https://ant.design) · [MongoDB Atlas](https://www.mongodb.com/atlas) · [PyTorch](https://pytorch.org) · [ChromaDB](https://www.trychroma.com)
