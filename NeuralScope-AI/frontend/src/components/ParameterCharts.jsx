import Plot from "react-plotly.js"

export default function ParameterCharts({ data }) {
  if (!data) return null

  const layers = data.layer_stats?.slice(0, 15) || []
  const names = layers.map(l => l.type + "\n" + l.layer.split(".").pop())
  const stds = layers.map(l => l.std)
  const sparsities = layers.map(l => l.sparsity)

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333" }}>
      <h3 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>Parameter Analysis</h3>

      <div style={{ marginBottom: "8px", fontSize: "12px", color: "#888" }}>
        Dead Neurons: <span style={{ color: "#E74C3C" }}>{data.dead_percentage}%</span>
        {" | "}
        Global Std: <span style={{ color: "#27AE60" }}>{data.global_std}</span>
      </div>

      <Plot
        data={[{
          x: names,
          y: stds,
          type: "bar",
          marker: { color: "#4A90D9" },
          name: "Weight Std"
        }]}
        layout={{
          paper_bgcolor: "#1E1E2E",
          plot_bgcolor: "#1E1E2E",
          font: { color: "white", size: 10 },
          margin: { t: 20, b: 80, l: 40, r: 10 },
          height: 220,
          xaxis: { tickangle: -45 },
          showlegend: false
        }}
        config={{ displayModeBar: false }}
        style={{ width: "100%" }}
      />
    </div>
  )
}
