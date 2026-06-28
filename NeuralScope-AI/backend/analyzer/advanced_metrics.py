import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List
from collections import OrderedDict


def compute_flops(model: nn.Module, input_size: tuple = (1, 3, 224, 224)) -> Dict[str, Any]:
    """Estimate FLOPs per layer and total for common layer types."""
    layer_flops = []
    total_flops = 0

    for name, module in model.named_modules():
        if len(list(module.children())) == 0:
            flops = 0
            if isinstance(module, nn.Conv2d):
                out_h = (input_size[2] + 2 * module.padding[0] - module.kernel_size[0]) // module.stride[0] + 1
                out_w = (input_size[3] + 2 * module.padding[1] - module.kernel_size[1]) // module.stride[1] + 1
                flops = (
                    module.in_channels * module.out_channels *
                    module.kernel_size[0] * module.kernel_size[1] *
                    out_h * out_w / module.groups
                )
            elif isinstance(module, nn.Linear):
                flops = module.in_features * module.out_features
            elif isinstance(module, (nn.BatchNorm2d, nn.BatchNorm1d)):
                flops = module.num_features * 4
            elif isinstance(module, (nn.MaxPool2d, nn.AvgPool2d)):
                flops = input_size[1] * input_size[2] * input_size[3]

            if flops > 0:
                layer_flops.append({
                    "layer": name,
                    "type": type(module).__name__,
                    "flops": int(flops),
                    "flops_human": _humanize_flops(flops)
                })
                total_flops += flops

    layer_flops_sorted = sorted(layer_flops, key=lambda x: x["flops"], reverse=True)

    return {
        "total_flops": int(total_flops),
        "total_flops_human": _humanize_flops(total_flops),
        "top_layers": layer_flops_sorted[:15],
        "layer_count": len(layer_flops)
    }


def _humanize_flops(flops: float) -> str:
    if flops >= 1e15:
        return f"{flops/1e15:.2f} PFLOPs"
    elif flops >= 1e12:
        return f"{flops/1e12:.2f} TFLOPs"
    elif flops >= 1e9:
        return f"{flops/1e9:.2f} GFLOPs"
    elif flops >= 1e6:
        return f"{flops/1e6:.2f} MFLOPs"
    elif flops >= 1e3:
        return f"{flops/1e3:.2f} KFLOPs"
    return f"{int(flops)} FLOPs"


def compute_gradient_flow(model: nn.Module) -> Dict[str, Any]:
    """Analyze gradient statistics per layer using a dummy forward/backward pass."""
    model.train()
    layer_gradients = []

    try:
        for name, module in model.named_modules():
            if hasattr(module, 'weight') and module.weight is not None and module.weight.requires_grad:
                if module.weight.grad is None:
                    module.weight.grad = torch.randn_like(module.weight) * 0.01

        dummy_input = torch.randn(2, 3, 224, 224, requires_grad=True)
        output = model(dummy_input)

        if output.dim() > 1:
            loss = output.sum()
        else:
            loss = output.sum()

        loss.backward()

        for name, module in model.named_modules():
            if hasattr(module, 'weight') and module.weight is not None:
                grad = module.weight.grad
                if grad is not None:
                    grad_data = grad.detach().numpy().flatten()
                    mean_grad = float(np.mean(np.abs(grad_data)))
                    max_grad = float(np.max(np.abs(grad_data)))
                    std_grad = float(np.std(grad_data))

                    layer_gradients.append({
                        "layer": name,
                        "type": type(module).__name__,
                        "mean_abs_grad": round(mean_grad, 8),
                        "max_abs_grad": round(max_grad, 8),
                        "std_grad": round(std_grad, 8),
                        "vanishing": mean_grad < 1e-7,
                        "exploding": max_grad > 1e3
                    })
    except Exception:
        for name, module in model.named_modules():
            if hasattr(module, 'weight') and module.weight is not None:
                layer_gradients.append({
                    "layer": name,
                    "type": type(module).__name__,
                    "mean_abs_grad": 0.0,
                    "max_abs_grad": 0.0,
                    "std_grad": 0.0,
                    "vanishing": False,
                    "exploding": False
                })

    model.eval()
    vanishing_count = sum(1 for g in layer_gradients if g["vanishing"])
    exploding_count = sum(1 for g in layer_gradients if g["exploding"])

    return {
        "layers": layer_gradients[:30],
        "vanishing_count": vanishing_count,
        "exploding_count": exploding_count,
        "total_analyzed": len(layer_gradients),
        "has_gradient_issues": vanishing_count > 0 or exploding_count > 0
    }


def compute_activation_stats(model: nn.Module, input_size: tuple = (1, 3, 224, 224)) -> Dict[str, Any]:
    """Capture activation statistics using forward hooks."""
    activations = OrderedDict()
    hooks = []

    def make_hook(name):
        def hook(module, input, output):
            if isinstance(output, torch.Tensor):
                activations[name] = output.detach().numpy()
        return hook

    for name, module in model.named_modules():
        if isinstance(module, (nn.ReLU, nn.GELU, nn.SiLU, nn.Tanh, nn.Sigmoid)):
            hooks.append(module.register_forward_hook(make_hook(name)))

    model.eval()
    try:
        with torch.no_grad():
            dummy_input = torch.randn(*input_size)
            model(dummy_input)
    except Exception:
        pass
    finally:
        for h in hooks:
            h.remove()

    layer_stats = []
    for name, act in activations.items():
        flat = act.flatten()
        dead_ratio = float(np.sum(np.abs(flat) < 1e-6) / len(flat))
        layer_stats.append({
            "layer": name,
            "mean": round(float(np.mean(flat)), 6),
            "std": round(float(np.std(flat)), 6),
            "max": round(float(np.max(flat)), 6),
            "min": round(float(np.min(flat)), 6),
            "dead_ratio_pct": round(dead_ratio * 100, 2),
            "saturation_pct": round(float(np.sum(np.abs(flat) > 0.95) / len(flat) * 100), 2)
        })

    return {
        "activation_layers": layer_stats[:30],
        "total_captured": len(layer_stats),
        "high_dead_ratio_count": sum(1 for s in layer_stats if s["dead_ratio_pct"] > 50)
    }


def compute_pruning_sensitivity(model: nn.Module) -> Dict[str, Any]:
    """Estimate pruning sensitivity by measuring weight magnitude distribution per layer."""
    layer_sensitivities = []

    for name, module in model.named_modules():
        if hasattr(module, 'weight') and module.weight is not None:
            w = module.weight.data.numpy().flatten()
            abs_w = np.abs(w)

            p10 = float(np.percentile(abs_w, 10))
            p25 = float(np.percentile(abs_w, 25))
            p50 = float(np.percentile(abs_w, 50))
            p75 = float(np.percentile(abs_w, 75))
            p90 = float(np.percentile(abs_w, 90))

            low_magnitude_ratio = float(np.sum(abs_w < p10) / len(abs_w))

            sensitivity = "high" if low_magnitude_ratio > 0.5 else "medium" if low_magnitude_ratio > 0.2 else "low"

            layer_sensitivities.append({
                "layer": name,
                "type": type(module).__name__,
                "p10": round(p10, 6),
                "p25": round(p25, 6),
                "p50": round(p50, 6),
                "p75": round(p75, 6),
                "p90": round(p90, 6),
                "low_magnitude_ratio": round(low_magnitude_ratio, 4),
                "pruning_sensitivity": sensitivity
            })

    high_sens = sum(1 for s in layer_sensitivities if s["pruning_sensitivity"] == "high")
    medium_sens = sum(1 for s in layer_sensitivities if s["pruning_sensitivity"] == "medium")
    low_sens = sum(1 for s in layer_sensitivities if s["pruning_sensitivity"] == "low")

    return {
        "layers": layer_sensitivities[:25],
        "high_sensitivity_count": high_sens,
        "medium_sensitivity_count": medium_sens,
        "low_sensitivity_count": low_sens,
        "total_analyzed": len(layer_sensitivities)
    }


def compute_all_advanced_metrics(model: nn.Module) -> Dict[str, Any]:
    return {
        "flops": compute_flops(model),
        "gradient_flow": compute_gradient_flow(model),
        "activation_stats": compute_activation_stats(model),
        "pruning_sensitivity": compute_pruning_sensitivity(model)
    }
