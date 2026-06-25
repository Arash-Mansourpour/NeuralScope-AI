<div align="center">

<img src="https://raw.githubusercontent.com/Arash-Mansourpour/NeuralScope-AI/main/Screenshot%20(766).png" width="80" height="80" style="border-radius: 12px;" alt="NeuralScope AI Logo" />

# NeuralScope AI

**AI-Powered Neural Network Analysis & Diagnostics Platform**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA-FF6B35)](https://groq.com/)

Upload any neural network model and instantly get an interactive diagnostic report — architecture graphs, parameter health scores, layer-by-layer breakdowns, and AI-generated recommendations powered by Groq LLaMA.

[📦 Installation](#-getting-started) · [📖 API Reference](#-api-reference) · [🖼️ Screenshots](#%EF%B8%8F-screenshots) · [🤝 Contributing](#-contributing)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Screenshots](#%EF%B8%8F-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

**NeuralScope AI** is a full-stack diagnostic platform for PyTorch neural networks. Whether you're debugging a custom model or benchmarking a well-known architecture, NeuralScope gives you a structured, visual, and AI-augmented report in seconds.

**Core workflow:**

```
Upload Model (.pth / .pt / .onnx)  ──►  Architecture Analysis
                                   ──►  Parameter Diagnostics
                                   ──►  Health Score Computation
                                   ──►  Interactive Graph Visualization
                                   ──►  AI-Generated Report (Groq LLaMA)
```

---

## 🖼️ Screenshots

<div align="center">

| Dashboard & Model Library | Architecture Analysis | Parameter Diagnostics |
|:-:|:-:|:-:|
| ![Screenshot 1](https://raw.githubusercontent.com/Arash-Mansourpour/NeuralScope-AI/main/Screenshot%20(766).png) | ![Screenshot 2](https://raw.githubusercontent.com/Arash-Mansourpour/NeuralScope-AI/main/Screenshot%20(767).png) | ![Screenshot 3](https://raw.githubusercontent.com/Arash-Mansourpour/NeuralScope-AI/main/Screenshot%20(768).png) |

</div>

---

## ✨ Features

### 🗂️ Model Management
- **Model Library** — Browse and instantly analyze pretrained architectures (ResNet, VGG, DenseNet, EfficientNet, and more)
- **Custom Upload** — Upload your own `.pth`, `.pt`, or `.onnx` files for on-demand analysis
- **Model Comparison** — Side-by-side comparison of up to 3 models across all diagnostic dimensions

### 🔬 Diagnostics & Analysis
- **Architecture Analysis** — Full layer-by-layer breakdown including type, shape, input/output dimensions, and connectivity
- **Parameter Diagnostics** — Distribution histograms, sparsity ratios, gradient norms, and per-layer statistics
- **Health Score** — Composite model health rating based on parameter quality, architecture soundness, and layer balance

### 📊 Visualization
- **Architecture Graph** — Interactive computational graph rendered with NetworkX and Plotly — zoomable and explorable
- **Parameter Distribution Charts** — Visual layer-wise weight and bias distributions via Plotly.js

### 🤖 AI Report
- **LLM-Powered Insights** — Groq (LLaMA) generates a full diagnostic report with identified issues and concrete recommendations
- **Structured Output** — Reports include summary, per-section findings, and prioritized action items

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Python 3.10+, FastAPI | REST API & async request handling |
| **ML Engine** | PyTorch, torchvision | Model loading, layer introspection |
| **AI Report** | Groq API (LLaMA) | Natural language diagnostic generation |
| **Graph Analysis** | NetworkX, Matplotlib | Computational graph construction |
| **Frontend** | React 18, Vite | SPA interface |
| **UI Styling** | Tailwind CSS | Utility-first styling |
| **Charts** | Plotly.js | Interactive data visualization |

---

## 📂 Project Structure

```
NeuralScope-AI/
│
├── backend/
│   ├── main.py                  # FastAPI application & endpoint definitions
│   ├── groq_engine.py           # Groq LLaMA AI report generation
│   │
│   ├── models/
│   │   └── model_loader.py      # Model loading, registry & format handling
│   │
│   ├── analyzer/
│   │   ├── architecture.py      # Layer-by-layer architecture extraction
│   │   ├── parameters.py        # Parameter statistics & distribution analysis
│   │   └── health_score.py      # Composite health scoring algorithm
│   │
│   └── visualizer/
│       └── graph.py             # NetworkX + Plotly graph generation
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root application component
│   │   └── components/          # Modular React UI components
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| Groq API Key | [Get one here](https://console.groq.com/) |

### 1. Clone the Repository

```bash
git clone https://github.com/Arash-Mansourpour/NeuralScope-AI.git
cd NeuralScope-AI
```

### 2. Backend Setup

```bash
cd backend
pip install -r ../requirements.txt
```

Set your API key (see [Environment Variables](#-environment-variables)) then start the server:

```bash
uvicorn main:app --reload --port 8000
```

> Backend API available at: `http://localhost:8000`  
> Interactive docs (Swagger UI): `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend available at: `http://localhost:5173`

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Required — Groq API key for AI report generation
GROQ_API_KEY=your_groq_api_key_here

# Optional
HOST=0.0.0.0
PORT=8000
```

Or export inline:

```bash
export GROQ_API_KEY="your_groq_api_key_here"
```

---

## 📖 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check — confirms the server is running |
| `GET` | `/models` | List all available pretrained models |
| `POST` | `/analyze` | Analyze a model by its registry key |
| `POST` | `/upload-model` | Upload and analyze a custom model file |
| `POST` | `/compare` | Compare up to 3 models side by side |

### Examples

**Analyze a pretrained model:**

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"model_key": "resnet50"}'
```

**Upload a custom model:**

```bash
curl -X POST http://localhost:8000/upload-model \
  -F "file=@/path/to/your/model.pth"
```

**Compare models:**

```bash
curl -X POST http://localhost:8000/compare \
  -H "Content-Type: application/json" \
  -d '{"model_keys": ["resnet50", "vgg16", "densenet121"]}'
```

Full interactive API documentation is available at `http://localhost:8000/docs` once the backend is running.

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and includes relevant tests where applicable.

---

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE).

```
Copyright 2024 Arash Mansourpour

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

<div align="center">

Built by [Arash Mansourpour](https://github.com/Arash-Mansourpour) · Give it a ⭐ if you find it useful!

</div>
