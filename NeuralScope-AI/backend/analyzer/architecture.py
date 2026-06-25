import torch
import torch.nn as nn
from typing import Dict, List, Any

def analyze_architecture(model: nn.Module, model_key: str) -> Dict[str, Any]:
    layers = []
    layer_counts = {}
    total_depth = 0

    for name, module in model.named_modules():
        if len(list(module.children())) == 0:
            layer_type = type(module).__name__
            layer_counts[layer_type] = layer_counts.get(layer_type, 0) + 1
            params = sum(p.numel() for p in module.parameters())
            total_depth += 1
            layers.append({
                "name": name,
                "type": layer_type,
                "params": params
            })

    architecture_type = detect_architecture_type(layer_counts)

    return {
        "layers": layers,
        "layer_counts": layer_counts,
        "total_depth": total_depth,
        "architecture_type": architecture_type,
        "has_batch_norm": "BatchNorm2d" in layer_counts,
        "has_dropout": "Dropout" in layer_counts,
        "has_residual": model_key in ["resnet18"]
    }

def detect_architecture_type(layer_counts: Dict) -> str:
    if "MultiheadAttention" in layer_counts:
        return "Transformer"
    elif "Conv2d" in layer_counts and "Linear" in layer_counts:
        return "CNN"
    elif "LSTM" in layer_counts:
        return "LSTM"
    elif "Linear" in layer_counts:
        return "MLP"
    return "Unknown"
