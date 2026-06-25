from typing import Dict, Any

def calculate_health_score(
    arch_data: Dict,
    param_data: Dict,
    model_data: Dict
) -> Dict[str, Any]:

    # Architecture Score
    arch_score = 10.0
    if not arch_data.get("has_batch_norm"):
        arch_score -= 1.5
    if not arch_data.get("has_dropout"):
        arch_score -= 1.0
    if arch_data.get("total_depth", 0) < 5:
        arch_score -= 2.0
    arch_score = max(0, round(arch_score, 1))

    # Efficiency Score
    eff_score = 10.0
    memory = model_data.get("memory_mb", 0)
    if memory > 500:
        eff_score -= 3.0
    elif memory > 100:
        eff_score -= 1.5
    params = model_data.get("total_params", 0)
    if params > 100_000_000:
        eff_score -= 2.0
    eff_score = max(0, round(eff_score, 1))

    # Health Score
    health_score = 10.0
    dead_pct = param_data.get("dead_percentage", 0)
    if dead_pct > 50:
        health_score -= 4.0
    elif dead_pct > 20:
        health_score -= 2.0
    std = param_data.get("global_std", 0)
    if std < 0.001:
        health_score -= 3.0
    health_score = max(0, round(health_score, 1))

    overall = round((arch_score + eff_score + health_score) / 3, 1)

    def score_to_stars(score):
        if score >= 9:
            return "★★★★★"
        elif score >= 7:
            return "★★★★☆"
        elif score >= 5:
            return "★★★☆☆"
        elif score >= 3:
            return "★★☆☆☆"
        return "★☆☆☆☆"

    return {
        "architecture_score": arch_score,
        "efficiency_score": eff_score,
        "health_score": health_score,
        "overall_score": overall,
        "stars": score_to_stars(overall),
        "grade": "A" if overall >= 8 else "B" if overall >= 6 else "C" if overall >= 4 else "D"
    }
