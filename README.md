# NeuralScope AI

AI-Powered Neural Network Analysis & Diagnostics Platform

NeuralScope AI is a full-stack tool for analyzing, visualizing, and diagnosing neural network architectures. Upload a model or pick a pretrained one and get an interactive report with architecture graphs, parameter breakdowns, health scores, and AI-generated insights.

## Screenshots

![Screenshot 1](https://github.com/Arash-Mansourpour/NeuralScope-AI/blob/main/Screenshot%20(766).png)
![Screenshot 2](https://github.com/Arash-Mansourpour/NeuralScope-AI/blob/main/Screenshot%20(767).png)
![Screenshot 3](https://github.com/Arash-Mansourpour/NeuralScope-AI/blob/main/Screenshot%20(768).png)

## Features

- **Model Library** — Browse and analyze pretrained models (ResNet, VGG, DenseNet, and more)
- **Custom Upload** — Upload your own `.pth`, `.pt`, or `.onnx` models for analysis
- **Architecture Analysis** — Layer-by-layer breakdown with type, shape, and connectivity
- **Parameter Diagnostics** — Distribution, sparsity, and statistics for every layer
- **Health Score** — Overall model health rating based on architecture and parameter analysis
- **Architecture Graph** — Interactive computational graph visualization
- **AI Report** — LLM-generated diagnostic report with recommendations (via Groq)
- **Model Comparison** — Side-by-side comparison of up to 3 models

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI, PyTorch, torchvision |
| Frontend | React, Vite, Tailwind CSS, Plotly.js |
| AI Engine | Groq (LLaMA) |
| Visualization | NetworkX, Matplotlib, Plotly |

## Project Structure

```
NeuralScope-AI/
├── backend/
│   ├── main.py              # FastAPI app & endpoints
│   ├── groq_engine.py      # Groq AI report generation
│   ├── models/
│   │   └── model_loader.py  # Model loading & registry
│   ├── analyzer/
│   │   ├── architecture.py  # Architecture analysis
│   │   ├── parameters.py    # Parameter diagnostics
│   │   └── health_score.py  # Health scoring
│   └── visualizer/
│       └── graph.py         # Architecture graph generation
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/      # React UI components
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Groq API key (for AI report generation)

### Backend Setup

```bash
cd backend
pip install -r ../requirements.txt

# Set your Groq API key
export GROQ_API_KEY="your-api-key-here"

# Run the server
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/models` | List available models |
| `POST` | `/analyze` | Analyze a model by key |
| `POST` | `/upload-model` | Upload and analyze a custom model |
| `POST` | `/compare` | Compare up to 3 models |

### Example: Analyze a Model

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"model_key": "resnet50"}'
```

## License

MIT
