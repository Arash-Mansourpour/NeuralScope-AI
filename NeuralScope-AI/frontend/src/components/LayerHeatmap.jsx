export default function LayerHeatmap({ layerStats }) {
  if (!layerStats || layerStats.length === 0) return null

  const getHeatColor, value, min, max) => {
    if (max === min) return "rgb(74, 144, 217)"
    const ratio = (value - min) / (max - min)
    const r = Math.round(74 + (231 - 74) * ratio)
    const g = Math.round(144 + (76 - 144) * ratio)
    const b = Math.round(217 + (60 - 217) * ratio)
    return `rgb(${r}, ${g}, ${b})`
  }

  const stdValues = layerStats.map(l => l.std)
  const minStd = Math.min(...stdValues)
  const maxStd = Math.max(...stdValues)

  const sparsityValues = layerStats.map(l => l.sparsity)
  const minSparsity = Math.min(...sparsityValues)
  const maxSparsity = Math.max(...sparsityValues)

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333", marginBottom: "20px" }}>
      <h3 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>Layer Activity Heatmap</h3>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Weight Std Deviation (활یت لایه)</div>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
          {layerStats.map((layer, i) => (
            <div
              key={i}
              title={`${layer.layer}: std=${layer.std}`}`}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "3px",
                background: getHeatColor(layer.std, minStd, maxStd),
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.3)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "#666" }}>
          <span>Low ({minStd.toFixed(4)})</span>
          <span>High ({maxStd.toFixed(4)})</span>
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Dead Neurons ( sparsity %)</div>
        <div style={{ display: "flex", gap: "2px", flexWrap: "wrap" }}>
          {layerStats.map((layer, i) => (
            <div
              key={i}
              title={`${layer.layer}: ${layer.sparsity}% dead`}
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "3px",
                background: getHeatColor(layer.sparsity, minSparsity, maxSparsity),
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.3)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "10px", color: "#666" }}>
          <span>0%</span>
          <span>{maxSparsity.toFixed(1)}%</span>
        </div>
      </div>

      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
        <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #333" }}>
              <th style={{ textAlign: "left", padding: "6px", color: "#888" }}>Layer</th>
              <th style={{ textAlign: "right", padding: "6px", color: "#888" }}>Std</th>
              <th style={{ textAlign: "right", padding: "6px", color: "#888" }}>Dead %</th>
            </tr>
          </thead>
          <tbody>
            {layerStats.map((layer, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #222" }}>
                <td style={{ padding: "6px", color: "#ccc", fontFamily: "monospace" }}>
                  {layer.layer.length > 25 ? "..." + layer.layer.slice(-22) : layer.layer}
                </td>
                <td style={{ textAlign: "right", padding: "6px", color: getHeatColor(layer.std, minStd, maxStd) }}>
                  {layer.std.toFixed(4)}
                </td>
                <td style={{ textAlign: "right", padding: "6px", color: getHeatColor(layer.sparsity, minSparsity, maxSparsity) }}>
                  {layer.sparsity.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
