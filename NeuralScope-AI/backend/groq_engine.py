from groq import Groq
from typing import Dict, Any
import os

api_key = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=api_key)

def generate_ai_report(
    model_name: str,
    arch_data: Dict[str, Any],
    param_data: Dict[str, Any],
    health_data: Dict[str, Any],
    model_meta: Dict[str, Any]
) -> str:

    prompt = f"""You are an expert neural network engineer analyzing a deep learning model.

Model: {model_name}
Architecture Type: {arch_data.get('architecture_type')}
Total Layers: {arch_data.get('total_depth')}
Layer Types: {arch_data.get('layer_counts')}
Has BatchNorm: {arch_data.get('has_batch_norm')}
Has Dropout: {arch_data.get('has_dropout')}
Has Residual Connections: {arch_data.get('has_residual')}

Parameter Statistics:
- Global Mean: {param_data.get('global_mean')}
- Global Std: {param_data.get('global_std')}
- Dead Neurons: {param_data.get('dead_neurons')}
- Dead Percentage: {param_data.get('dead_percentage')}%
- Sparsity: {param_data.get('sparsity')}%

Health Scores:
- Architecture Score: {health_data.get('architecture_score')}/10
- Efficiency Score: {health_data.get('efficiency_score')}/10
- Health Score: {health_data.get('health_score')}/10
- Overall: {health_data.get('overall_score')}/10
- Grade: {health_data.get('grade')}

Write a professional engineering report with these sections:
1. Architecture Overview
2. Strengths
3. Potential Issues
4. Optimization Recommendations
5. Use Case Suggestions

Be specific, technical, and concise. Use bullet points where appropriate."""

    try:
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"AI Report unavailable: {str(e)}. Analysis data is still valid."
