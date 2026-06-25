import torch.nn as nn
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import networkx as nx
import io
import base64
from typing import Dict, List

LAYER_COLORS = {
    "Conv2d": "#4A90D9",
    "BatchNorm2d": "#27AE60",
    "ReLU": "#F39C12",
    "Linear": "#E74C3C",
    "MaxPool2d": "#9B59B6",
    "AdaptiveAvgPool2d": "#1ABC9C",
    "Dropout": "#95A5A6",
    "SiLU": "#E67E22",
    "Hardswish": "#E67E22"
}

DEFAULT_COLOR = "#BDC3C7"

def generate_architecture_graph(model: nn.Module, model_name: str) -> str:
    G = nx.DiGraph()
    layers = []

    for name, module in model.named_modules():
        if len(list(module.children())) == 0:
            layer_type = type(module).__name__
            layers.append((name, layer_type))

    max_layers = 40
    if len(layers) > max_layers:
        step = len(layers) // max_layers
        layers = layers[::step][:max_layers]

    for i, (name, ltype) in enumerate(layers):
        G.add_node(i, label=ltype, name=name)
        if i > 0:
            G.add_edge(i - 1, i)

    fig, ax = plt.subplots(1, 1, figsize=(14, 8))
    fig.patch.set_facecolor('#0F1117')
    ax.set_facecolor('#0F1117')

    pos = {}
    cols = 8
    for i in range(len(layers)):
        row = i // cols
        col = i % cols
        pos[i] = (col * 2, -row * 2)

    node_colors = [
        LAYER_COLORS.get(layers[i][1], DEFAULT_COLOR)
        for i in range(len(layers))
    ]

    nx.draw_networkx_nodes(G, pos, node_color=node_colors,
                           node_size=800, ax=ax, alpha=0.9)
    nx.draw_networkx_edges(G, pos, edge_color='#FFFFFF',
                           arrows=True, alpha=0.4, ax=ax,
                           arrowsize=10)

    labels = {i: layers[i][1][:6] for i in range(len(layers))}
    nx.draw_networkx_labels(G, pos, labels, font_size=6,
                            font_color='white', ax=ax)

    legend_patches = [
        mpatches.Patch(color=color, label=ltype)
        for ltype, color in LAYER_COLORS.items()
    ]
    ax.legend(handles=legend_patches, loc='upper right',
              facecolor='#1E1E2E', labelcolor='white', fontsize=8)

    ax.set_title(f"Architecture Graph - {model_name}",
                 color='white', fontsize=14, fontweight='bold')
    ax.axis('off')
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=120,
                bbox_inches='tight', facecolor='#0F1117')
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_base64
