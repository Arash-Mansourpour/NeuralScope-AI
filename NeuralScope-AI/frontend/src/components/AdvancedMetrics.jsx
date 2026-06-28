import Plot from "react-plotly.js"

const LAYER_COLORS = {
  Conv2d: "#4A90D9",
  BatchNorm2d: "#27AE60",
  ReLU: "#F39C12",
  Linear: "#E74C3C",
  MaxPool2d: "#9B59B6",
  AdaptiveAvgPool2d: "#1ABC9C",
  Dropout: "#95A5A6",
  SiLU: "#E67E22",
  Hardswish: "#E67E22",
  GELU: "#FF6B6B",
  Tanh: "#8E44AD",
  Sigmoid: "#16A085"
}

const getColor = (type) => LAYER_COLORS[type] || "#BDC3C7"

function MetricCard({ label, value, color = "#4A90D9", subtitle = "" }) {
  return (
    <div style={{
      background: "#16162A",
      padding: "14px 18px",
      borderRadius: "10px",
      border: `1px solid ${color}33`,
      minWidth: "120px"
    }}>
      <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: "bold", color }}>{value}</div>
      {subtitle && <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>{subtitle}</div>}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ color: "#4A90D9", margin: "0 0 16px 0", fontSize: "16px", borderBottom: "1px solid #333", paddingBottom: "8px" }}>
      {children}
    </h3>
  )
}

function BarChart({ data, xKey, yKey, colorKey, title, xLabel, yLabel }) {
  const colors = data.map(d => getColor(d[colorKey] || "default"))
  return (
    <Plot
      data={[{
        x: data.map(d => d[xKey]),
        y: data.map(d => d[yKey]),
        type: "bar",
        marker: { color: colors },
        text: data.map(d => d[yKey]),
        textposition: "outside",
        textfont: { color: "white", size: 9 }
      }]}
      layout={{
        paper_bgcolor: "#1E1E2E",
        plot_bgcolor: "#1E1E2E",
        font: { color: "white", size: 10 },
        margin: { t: 30, b: 80, l: 60, r: 20 },
        height: 280,
        xaxis: { title: xLabel, tickangle: -45, tickfont: { size: 9 } },
        yaxis: { title: yLabel, tickfont: { size: 9 } },
        title: { text: title, font: { size: 12, color: "#888" } },
        showlegend: false
      }}
      config={{ displayModeBar: false }}
      style={{ width: "100%" }}
    />
  )
}

function HeatmapTable({ layers, valueKey, title, colorMin, colorMax }) {
  const values = layers.map(l => l[valueKey])
  const min = colorMin !== undefined ? colorMin : Math.min(...values)
  const max = colorMax !== undefined ? colorMax : Math.max(...values)

  const getColor = (value) => {
    if (max === min) return "rgb(74, 144, 217)"
    const ratio = (value - min) / (max - min)
    const r = Math.round(74 + (231 - 74) * ratio)
    const g = Math.round(144 + (76 - 144) * ratio)
    const b = Math.round(217 + (60 - 217) * ratio)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{title}</div>
      <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
        {layers.map((layer, i) => (
          <div
            key={i}
            title={`${layer.layer}: ${layer[valueKey]}`}
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "3px",
              background: getColor(layer[valueKey]),
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "scale(1.3)"}
            onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "#666" }}>
        <span>{typeof min === "number" ? min.toFixed(4) : min}</span>
        <span>{typeof max === "number" ? max.toFixed(4) : max}</span>
      </div>
    </div>
  )
}

export default function AdvancedMetrics({ data }) {
  if (!data) return null

  const { flops, gradient_flow, activation_stats, pruning_sensitivity } = data

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333", marginBottom: "20px" }}>
      <SectionTitle>Advanced Analysis</SectionTitle>

      {flops && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#27AE60", marginBottom: "12px", fontWeight: "bold" }}>
            Computational Cost (FLOPs)
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <MetricCard label="Total FLOPs" value={flops.total_flops_human} color="#27AE60" />
            <MetricCard label="Layers Analyzed" value={flops.layer_count} color="#4A90D9" />
          </div>
          {flops.top_layers && flops.top_layers.length > 0 && (
            <BarChart
              data={flops.top_layers}
              xKey="layer"
              yKey="flops"
              colorKey="type"
              title="Top Layers by FLOPs"
              xLabel="Layer"
              yLabel="FLOPs"
            />
          )}
        </div>
      )}

      {gradient_flow && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#F39C12", marginBottom: "12px", fontWeight: "bold" }}>
            Gradient Flow Analysis
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <MetricCard
              label="Vanishing Gradients"
              value={gradient_flow.vanishing_count}
              color={gradient_flow.vanishing_count > 0 ? "#E74C3C" : "#27AE60"}
              subtitle={gradient_flow.vanishing_count > 0 ? "Issues detected" : "No issues"}
            />
            <MetricCard
              label="Exploding Gradients"
              value={gradient_flow.exploding_count}
              color={gradient_flow.exploding_count > 0 ? "#E74C3C" : "#27AE60"}
              subtitle={gradient_flow.exploding_count > 0 ? "Issues detected" : "No issues"}
            />
            <MetricCard label="Layers Analyzed" value={gradient_flow.total_analyzed} color="#4A90D9" />
          </div>
          {gradient_flow.layers && gradient_flow.layers.length > 0 && (
            <Plot
              data={[
                {
                  x: gradient_flow.layers.map(l => l.layer.split(".").pop()),
                  y: gradient_flow.layers.map(l => l.mean_abs_grad),
                  type: "bar",
                  name: "Mean |Grad|",
                  marker: { color: "#4A90D9" }
                },
                {
                  x: gradient_flow.layers.map(l => l.layer.split(".").pop()),
                  y: gradient_flow.layers.map(l => l.max_abs_grad),
                  type: "bar",
                  name: "Max |Grad|",
                  marker: { color: "#E74C3C" }
                }
              ]}
              layout={{
                paper_bgcolor: "#1E1E2E",
                plot_bgcolor: "#1E1E2E",
                font: { color: "white", size: 10 },
                margin: { t: 20, b: 80, l: 60, r: 20 },
                height: 250,
                xaxis: { tickangle: -45 },
                yaxis: { type: "log", title: "Gradient Magnitude" },
                barmode: "group",
                legend: { font: { size: 9 }, x: 0, y: 1.1, orientation: "h" }
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%" }}
            />
          )}
        </div>
      )}

      {activation_stats && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#9B59B6", marginBottom: "12px", fontWeight: "bold" }}>
            Activation Statistics
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <MetricCard label="Activations Captured" value={activation_stats.total_captured} color="#9B59B6" />
            <MetricCard
              label="High Dead Ratio"
              value={activation_stats.high_dead_ratio_count}
              color={activation_stats.high_dead_ratio_count > 0 ? "#E74C3C" : "#27AE60"}
              subtitle={activation_stats.high_dead_ratio_count > 0 ? "Layers > 50% dead" : "Healthy"}
            />
          </div>
          {activation_stats.activation_layers && activation_stats.activation_layers.length > 0 && (
            <>
              <HeatmapTable
                layers={activation_stats.activation_layers}
                valueKey="dead_ratio_pct"
                title="Dead Activation Ratio (%)"
                colorMin={0}
                colorMax={100}
              />
              <HeatmapTable
                layers={activation_stats.activation_layers}
                valueKey="saturation_pct"
                title="Saturation Ratio (%)"
                colorMin={0}
                colorMax={100}
              />
            </>
          )}
        </div>
      )}

      {pruning_sensitivity && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#E67E22", marginBottom: "12px", fontWeight: "bold" }}>
            Pruning Sensitivity
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <MetricCard label="High Sensitivity" value={pruning_sensitivity.high_sensitivity_count} color="#E74C3C" subtitle="Easy to prune" />
            <MetricCard label="Medium Sensitivity" value={pruning_sensitivity.medium_sensitivity_count} color="#F39C12" />
            <MetricCard label="Low Sensitivity" value={pruning_sensitivity.low_sensitivity_count} color="#27AE60" subtitle="Critical layers" />
          </div>
          {pruning_sensitivity.layers && pruning_sensitivity.layers.length > 0 && (
            <Plot
              data={[{
                x: pruning_sensitivity.layers.map(l => l.layer.split(".").pop()),
                y: pruning_sensitivity.layers.map(l => l.low_magnitude_ratio),
                type: "bar",
                marker: {
                  color: pruning_sensitivity.layers.map(l =>
                    l.pruning_sensitivity === "high" ? "#E74C3C" :
                    l.pruning_sensitivity === "medium" ? "#F39C12" : "#27AE60"
                  )
                },
                text: pruning_sensitivity.layers.map(l => l.pruning_sensitivity),
                textposition: "outside",
                textfont: { color: "white", size: 8 }
              }]}
              layout={{
                paper_bgcolor: "#1E1E2E",
                plot_bgcolor: "#1E1E2E",
                font: { color: "white", size: 10 },
                margin: { t: 20, b: 80, l: 60, r: 20 },
                height: 250,
                xaxis: { tickangle: -45 },
                yaxis: { title: "Low Magnitude Ratio", range: [0, 1] },
                showlegend: false
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%" }}
            />
          )}
        </div>
      )}
    </div>
  )
}
