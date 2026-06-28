import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any
from scipy.stats import kurtosis, skew

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
                "shape": list(module.weight.shape),
                "num_params": int(module.weight.numel()),
                "mean": round(float(np.mean(w)), 6),
                "std": round(float(np.std(w)), 6),
                "min": round(float(np.min(w)), 6),
                "max": round(float(np.max(w)), 6),
                "dead_count": dead,
                "sparsity": round(dead / len(w) * 100, 2),
                "kurtosis": round(float(kurtosis(w)), 4),
                "skewness": round(float(skew(w)), 4),
                "p5": round(float(np.percentile(w, 5)), 6),
                "p25": round(float(np.percentile(w, 25)), 6),
                "p50": round(float(np.percentile(w, 50)), 6),
                "p75": round(float(np.percentile(w, 75)), 6),
                "p95": round(float(np.percentile(w, 95)), 6)
            })

    all_weights_np = np.array(all_weights)

    overall_kurtosis = float(kurtosis(all_weights_np)) if len(all_weights_np) > 3 else 0.0
    overall_skew = float(skew(all_weights_np)) if len(all_weights_np) > 2 else 0.0

    total_param_count = sum(p.numel() for p in model.parameters())
    trainable_param_count = sum(p.numel() for p in model.parameters() if p.requires_grad)
    non_trainable_param_count = total_param_count - trainable_param_count

    return {
        "global_mean": round(float(np.mean(all_weights_np)), 6),
        "global_std": round(float(np.std(all_weights_np)), 6),
        "global_kurtosis": round(overall_kurtosis, 4),
        "global_skewness": round(overall_skew, 4),
        "dead_neurons": dead_neurons,
        "dead_percentage": round(dead_neurons / total_neurons * 100, 2) if total_neurons > 0 else 0,
        "sparsity": round(dead_neurons / total_neurons * 100, 2) if total_neurons > 0 else 0,
        "total_param_count": total_param_count,
        "trainable_params": trainable_param_count,
        "non_trainable_params": non_trainable_param_count,
        "trainable_ratio": round(trainable_param_count / total_param_count, 4) if total_param_count > 0 else 0,
        "layer_stats": layer_stats
    }
