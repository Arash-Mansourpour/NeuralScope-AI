import torch
import torchvision.models as models
from typing import Dict, Any

AVAILABLE_MODELS = {
    "resnet18": {
        "name": "ResNet-18",
        "description": "Classic deep residual network, 18 layers",
        "family": "CNN"
    },
    "mobilenet_v2": {
        "name": "MobileNetV2",
        "description": "Lightweight CNN for mobile and edge devices",
        "family": "CNN"
    },
    "efficientnet_b0": {
        "name": "EfficientNet-B0",
        "description": "Compound scaled efficient CNN architecture",
        "family": "CNN"
    }
}

def load_model(model_key: str) -> Dict[str, Any]:
    model_map = {
        "resnet18": models.resnet18,
        "mobilenet_v2": models.mobilenet_v2,
        "efficientnet_b0": models.efficientnet_b0
    }

    if model_key not in model_map:
        raise ValueError(f"Model {model_key} not found")

    model = model_map[model_key](weights="DEFAULT")
    model.eval()

    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    memory_mb = total_params * 4 / (1024 * 1024)

    return {
        "model": model,
        "key": model_key,
        "meta": AVAILABLE_MODELS[model_key],
        "total_params": total_params,
        "trainable_params": trainable_params,
        "memory_mb": round(memory_mb, 2)
    }

def get_available_models():
    return AVAILABLE_MODELS
