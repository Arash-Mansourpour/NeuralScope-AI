from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import tempfile
import os

from models.model_loader import load_model, get_available_models
from analyzer.architecture import analyze_architecture
from analyzer.parameters import analyze_parameters
from analyzer.health_score import calculate_health_score
from visualizer.graph import generate_architecture_graph
from groq_engine import generate_ai_report

app = FastAPI(title="NeuralScope AI", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    model_key: str

class CompareRequest(BaseModel):
    model_key_1: str
    model_key_2: str
    model_key_3: Optional[str] = None

@app.get("/")
def root():
    return {"status": "NeuralScope AI is running", "version": "2.0.0"}

@app.get("/models")
def list_models():
    return get_available_models()

@app.post("/analyze")
def analyze_model(request: AnalyzeRequest):
    try:
        model_data = load_model(request.model_key)
        model = model_data["model"]

        arch_data = analyze_architecture(model, request.model_key)
        param_data = analyze_parameters(model)
        health_data = calculate_health_score(arch_data, param_data, model_data)
        graph_b64 = generate_architecture_graph(model, model_data["meta"]["name"])
        ai_report = generate_ai_report(
            model_data["meta"]["name"],
            arch_data,
            param_data,
            health_data,
            model_data["meta"]
        )

        return {
            "model_info": {
                "key": model_data["key"],
                "name": model_data["meta"]["name"],
                "description": model_data["meta"]["description"],
                "family": model_data["meta"]["family"],
                "total_params": model_data["total_params"],
                "memory_mb": model_data["memory_mb"]
            },
            "architecture": arch_data,
            "parameters": param_data,
            "health": health_data,
            "graph": graph_b64,
            "ai_report": ai_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(('.pth', '.pt', '.onnx')):
            raise HTTPException(status_code=400, detail="Only .pth, .pt, or .onnx files are supported")

        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        import torch
        try:
            if file.filename.endswith('.onnx'):
                import onnx
                model = onnx.load(tmp_path)
                os.unlink(tmp_path)
                return {
                    "success": True,
                    "filename": file.filename,
                    "message": "ONNX model loaded successfully. Full analysis requires PyTorch model."
                }
            else:
                model = torch.load(tmp_path, map_location='cpu', weights_only=False)
                if isinstance(model, dict) and 'model' in model:
                    model = model['model']
                elif isinstance(model, dict) and 'state_dict' in model:
                    from torchvision.models import resnet18
                    model = resnet18()
                    model.load_state_dict(model['state_dict'])

                model.eval()
                total_params = sum(p.numel() for p in model.parameters())
                memory_mb = round(total_params * 4 / (1024 * 1024), 2)

                arch_data = analyze_architecture(model, "custom")
                param_data = analyze_parameters(model)
                health_data = calculate_health_score(arch_data, param_data, {
                    "total_params": total_params,
                    "memory_mb": memory_mb,
                    "meta": {"name": file.filename, "description": "Custom uploaded model", "family": "Custom"}
                })
                graph_b64 = generate_architecture_graph(model, file.filename)
                ai_report = generate_ai_report(
                    file.filename,
                    arch_data,
                    param_data,
                    health_data,
                    {"name": file.filename, "description": "Custom uploaded model", "family": "Custom"}
                )

                os.unlink(tmp_path)

                return {
                    "success": True,
                    "model_info": {
                        "key": "custom",
                        "name": file.filename,
                        "description": "Custom uploaded model",
                        "family": "Custom",
                        "total_params": total_params,
                        "memory_mb": memory_mb
                    },
                    "architecture": arch_data,
                    "parameters": param_data,
                    "health": health_data,
                    "graph": graph_b64,
                    "ai_report": ai_report
                }
        except Exception as e:
            os.unlink(tmp_path)
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare")
def compare_models(request: CompareRequest):
    try:
        data1 = load_model(request.model_key_1)
        data2 = load_model(request.model_key_2)

        result = {
            "model_1": {
                "name": data1["meta"]["name"],
                "params": data1["total_params"],
                "memory_mb": data1["memory_mb"]
            },
            "model_2": {
                "name": data2["meta"]["name"],
                "params": data2["total_params"],
                "memory_mb": data2["memory_mb"]
            }
        }

        if request.model_key_3:
            data3 = load_model(request.model_key_3)
            result["model_3"] = {
                "name": data3["meta"]["name"],
                "params": data3["total_params"],
                "memory_mb": data3["memory_mb"]
            }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
