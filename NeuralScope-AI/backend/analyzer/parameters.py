import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any

def analyze_parameters(model: nn.Module) -> Dict[str, Any]:
    all_weights = []
    dead_neurons = 0
    total_neurons = 0
    layer_stats = []

    for name, module in model.named_modules():
        if hasattr(module, 'weight') and module.weight is not None:
            w = module.weight.data.numpy().flatten()
            all_weights.extend(w.tolist())
            total_neurons += len(w)
            dead = int(np.sum(np.abs(w) < 1e-6))
            dead_neurons += dead

            layer_stats.append({
                "layer": name,
                "type": type(module).__name__,
                "mean": round(float(np.mean(w)), 6),
                "std": round(float(np.std(w)), 6),
                "min": round(float(np.min(w)), 6),
                "max": round(float(np.max(w)), 6),
                "dead_count": dead,
                "sparsity": round(dead / len(w) * 100, 2)
            })

    all_weights = np.array(all_weights)

    return {
        "global_mean": round(float(np.mean(all_weights)), 6),
        "global_std": round(float(np.std(all_weights)), 6),
        "dead_neurons": dead_neurons,
        "dead_percentage": round(dead_neurons / total_neurons * 100, 2) if total_neurons > 0 else 0,
        "sparsity": round(dead_neurons / total_neurons * 100, 2) if total_neurons > 0 else 0,
        "layer_stats": layer_stats[:20]
    }
