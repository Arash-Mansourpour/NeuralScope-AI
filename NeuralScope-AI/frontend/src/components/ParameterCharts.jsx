import Plot from "react-plotly.js"

export default function ParameterCharts({ data }) {
  if (!data) return null

  const layers = data.layer_stats?.slice(0, 20) || []
  const names = layers.map(l => l.type + " " + l.layer.split(".").pop())
  const shortNames = layers.map(l => l.layer.split(".").pop())
  const stds = layers.map(l => l.std)
  const sparsities = layers.map(l => l.sparsity)
  const kurtosisValues = layers.map(l => l.kurtosis || 0)
  const skewnessValues = layers.map(l => l.skewness || 0)
  const means = layers.map(l => l.mean)
  const params = layers.map(l => l.num_params || l.shape?.reduce((a, b) => a * b, 1) || 0)

  const baseLayout = {
    paper_bgcolor: "#1E1E2E",
    plot_bgcolor: "#1E1E2E",
    font: { color: "white", size: 10 },
    margin: { t: 30, b: 80, l: 50, r: 10 },
    height: 240,
    xaxis: { tickangle: -45, tickfont: { size: 9 } }
  }

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333", marginBottom: "20px" }}>
      <h3 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>Parameter Analysis</h3>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
        <div style={{ background: "#16162A", padding: "10px 16px", borderRadius: "8px", border: "1px solid #333" }}>
          <div style={{ fontSize: "10px", color: "#888" }}>Dead Neurons</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#E74C3C" }}>{data.dead_percentage}%</div>
        </div>
        <div style={{ background: "#16162A", padding: "10px 16px", borderRadius: "8px", border: "1px solid #333" }}>
          <div style={{ fontSize: "10px", color: "#888" }}>Global Std</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#27AE60" }}>{data.global_std}</div>
        </div>
        <div style={{ background: "#16162A", padding: "10px 16px", borderRadius: "8px", border: "1px solid #333" }}>
          <div style={{ fontSize: "10px", color: "#888" }}>Kurtosis</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#9B59B6" }}>{data.global_kurtosis}</div>
        </div>
        <div style={{ background: "#16162A", padding: "10px 16px", borderRadius: "8px", border: "1px solid #333" }}>
          <div style={{ fontSize: "10px", color: "#888" }}>Skewness</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#F39C12" }}>{data.global_skewness}</div>
        </div>
        <div style={{ background: "#16162A", padding: "10px 16px", borderRadius: "8px", border: "1px solid #333" }}>
          <div style={{ fontSize: "10px", color: "#888" }}>Trainable Ratio</div>
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#4A90D9" }}>{(data.trainable_ratio * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Weight Std Deviation by Layer</div>
          <Plot
            data={[{
              x: shortNames,
              y: stds,
              type: "bar",
              marker: { color: "#4A90D9" },
              name: "Weight Std"
            }]}
            layout={{ ...baseLayout, showlegend: false }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Sparsity (% Dead) by Layer</div>
          <Plot
            data={[{
              x: shortNames,
              y: sparsities,
              type: "bar",
              marker: {
                color: sparsities.map(s => s > 50 ? "#E74C3C" : s > 20 ? "#F39C12" : "#27AE60")
              },
              name: "Sparsity %"
            }]}
            layout={{ ...baseLayout, showlegend: false, yaxis: { range: [0, Math.max(100, ...sparsities)] } }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Kurtosis by Layer</div>
          <Plot
            data={[{
              x: shortNames,
              y: kurtosisValues,
              type: "bar",
              marker: {
                color: kurtosisValues.map(k => k > 3 ? "#E74C3C" : k > 0 ? "#F39C12" : "#4A90D9")
              },
              name: "Kurtosis"
            }]}
            layout={{ ...baseLayout, showlegend: false }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Skewness by Layer</div>
          <Plot
            data={[{
              x: shortNames,
              y: skewnessValues,
              type: "bar",
              marker: {
                color: skewnessValues.map(s => Math.abs(s) > 1 ? "#E74C3C" : "#27AE60")
              },
              name: "Skewness"
            }]}
            layout={{ ...baseLayout, showlegend: false }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Mean Weight by Layer</div>
          <Plot
            data={[{
              x: shortNames,
              y: means,
              type: "bar",
              marker: {
                color: means.map(m => m >= 0 ? "#27AE60" : "#E74C3C")
              },
              name: "Mean"
            }]}
            layout={{ ...baseLayout, showlegend: false }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Parameter Count by Layer</div>
          <Plot
            data={[{
              x: shortNames,
              y: params,
              type: "bar",
              marker: { color: "#9B59B6" },
              name: "Params",
              text: params.map(p => p >= 1e6 ? `${(p/1e6).toFixed(1)}M` : p >= 1e3 ? `${(p/1e3).toFixed(0)}K` : p),
              textposition: "outside",
              textfont: { color: "white", size: 8 }
            }]}
            layout={{ ...baseLayout, showlegend: false }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {layers[0]?.p5 !== undefined && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>Weight Distribution Percentiles (P5/P25/P50/P75/P95)</div>
          <Plot
            data={[
              { x: shortNames, y: layers.map(l => l.p5), type: "scatter", mode: "lines+markers", name: "P5", line: { color: "#E74C3C", width: 1 }, marker: { size: 4 } },
              { x: shortNames, y: layers.map(l => l.p25), type: "scatter", mode: "lines+markers", name: "P25", line: { color: "#F39C12", width: 1 }, marker: { size: 4 } },
              { x: shortNames, y: layers.map(l => l.p50), type: "scatter", mode: "lines+markers", name: "P50", line: { color: "#27AE60", width: 2 }, marker: { size: 5 } },
              { x: shortNames, y: layers.map(l => l.p75), type: "scatter", mode: "lines+markers", name: "P75", line: { color: "#4A90D9", width: 1 }, marker: { size: 4 } },
              { x: shortNames, y: layers.map(l => l.p95), type: "scatter", mode: "lines+markers", name: "P95", line: { color: "#9B59B6", width: 1 }, marker: { size: 4 } }
            ]}
            layout={{
              ...baseLayout,
              height: 280,
              showlegend: true,
              legend: { font: { size: 9 }, x: 0, y: 1.15, orientation: "h" },
              yaxis: { title: "Weight Value" }
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  )
}
