import { useState, useRef } from "react"
import axios from "axios"

const MODELS = ["resnet18", "mobilenet_v2", "efficientnet_b0"]

export default function ComparisonView({ api }) {
  const [models, setModels] = useState(["resnet18", "mobilenet_v2", ""])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleAddModel = () => {
    if (models.length < 4) {
      setModels([...models, ""])
    }
  }

  const handleRemoveModel = (index) => {
    setModels(models.filter((_, i) => i !== index))
  }

  const handleModelChange = (index, value) => {
    const newModels = [...models]
    newModels[index] = value
    setModels(newModels)
  }

  const handleCompare = async () => {
    const validModels = models.filter(m => m)
    if (validModels.length < 2) return

    setLoading(true)
    try {
      const analyzePromises = validModels.map(key =>
        axios.post(`${api}/analyze`, { model_key: key })
      )
      const responses = await Promise.all(analyzePromises)
      setResults(responses.map(r => r.data))
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const formatParams = (n) => (n / 1e6).toFixed(1) + "M"
  const formatMemory = (mb) => mb < 1024 ? `${mb}MB` : `${(mb / 1024).toFixed(1)}GB`

  const getColor = (index) => {
    const colors = ["#4A90D9", "#27AE60", "#F39C12", "#E74C3C"]
    return colors[index % colors.length]
  }

  const compareMetrics = [
    { label: "Parameters", getValue: (r) => r.model_info.total_params, format: formatParams },
    { label: "Memory", getValue: (r) => r.model_info.memory_mb, format: formatMemory },
    { label: "Architecture Score", getValue: (r) => r.health.architecture_score, format: (v) => v.toFixed(1) },
    { label: "Efficiency Score", getValue: (r) => r.health.efficiency_score, format: (v) => v.toFixed(1) },
    { label: "Health Score", getValue: (r) => r.health.health_score, format: (v) => v.toFixed(1) },
    { label: "Overall", getValue: (r) => r.health.overall_score, format: (v) => v.toFixed(1) },
  ]

  const getBestValue = (metric) => {
    if (results.length < 2) return null
    const values = results.map(r => metric.getValue(r))
    return Math.max(...values)
  }

  return (
    <div>
      <h3 style={{ color: "#4A90D9", marginBottom: "16px" }}>Model Comparison</h3>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
        {models.map((model, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ color: getColor(index), fontSize: "14px", fontWeight: "bold" }}>
              {index + 1}.
            </div>
            <select
              value={model}
              onChange={(e) => handleModelChange(index, e.target.value)}
              style={{
                padding: "10px",
                background: "#1E1E2E",
                color: "white",
                border: "1px solid #333",
                borderRadius: "6px",
                minWidth: "140px"
              }}
            >
              <option value="">Select model...</option>
              {MODELS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {models.length > 2 && (
              <button
                onClick={() => handleRemoveModel(index)}
                style={{
                  padding: "4px 8px",
                  background: "#E74C3C",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {models.length < 4 && (
          <button
            onClick={handleAddModel}
            style={{
              padding: "10px 16px",
              background: "#333",
              color: "white",
              border: "1px dashed #555",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            + Add Model
          </button>
        )}

        <button
          onClick={handleCompare}
          disabled={loading || models.filter(m => m).length < 2}
          style={{
            padding: "10px 24px",
            background: models.filter(m => m).length >= 2 ? "#4A90D9" : "#333",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: models.filter(m => m).length >= 2 ? "pointer" : "not-allowed",
            fontWeight: "bold"
          }}
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: "16px", marginBottom: "24px" }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  background: "#1E1E2E",
                  padding: "20px",
                  borderRadius: "12px",
                  border: `2px solid ${getColor(index)}`
                }}
              >
                <h4 style={{ color: getColor(index), margin: "0 0 12px 0", fontSize: "16px" }}>
                  {result.model_info.name}
                </h4>
                <div style={{ fontSize: "13px", lineHeight: "2" }}>
                  <div>Params: <span style={{ color: "#27AE60" }}>{formatParams(result.model_info.total_params)}</span></div>
                  <div>Memory: <span style={{ color: "#F39C12" }}>{formatMemory(result.model_info.memory_mb)}</span></div>
                  <div>Grade: <span style={{ color: "#4A90D9" }}>{result.health.grade} ({result.health.overall_score})</span></div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333" }}>
            <h4 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>Detailed Comparison</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #333" }}>
                  <th style={{ textAlign: "left", padding: "10px", color: "#888", fontSize: "13px" }}>Metric</th>
                  {results.map((r, i) => (
                    <th key={i} style={{ textAlign: "center", padding: "10px", color: getColor(i), fontSize: "13px" }}>
                      {r.model_info.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareMetrics.map((metric, mIndex) => {
                  const bestValue = getBestValue(metric)
                  return (
                    <tr key={mIndex} style={{ borderBottom: "1px solid #222" }}>
                      <td style={{ padding: "10px", color: "#aaa", fontSize: "13px" }}>{metric.label}</td>
                      {results.map((r, rIndex) => {
                        const value = metric.getValue(r)
                        const isBest = value === bestValue
                        return (
                          <td
                            key={rIndex}
                            style={{
                              textAlign: "center",
                              padding: "10px",
                              color: isBest ? getColor(rIndex) : "#ccc",
                              fontWeight: isBest ? "bold" : "normal",
                              fontSize: "13px"
                            }}
                          >
                            {metric.format(value)}
                            {isBest && <span style={{ marginLeft: "4px" }}>🏆</span>}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333", marginTop: "16px" }}>
            <h4 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>Visual Comparison</h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {compareMetrics.map((metric, mIndex) => {
                const bestValue = getBestValue(metric)
                const maxVal = Math.max(...results.map(r => metric.getValue(r)))
                return (
                  <div key={mIndex} style={{ flex: "1", minWidth: "200px" }}>
                    <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>{metric.label}</div>
                    {results.map((r, rIndex) => {
                      const value = metric.getValue(r)
                      const pct = maxVal > 0 ? (value / maxVal) * 100 : 0
                      return (
                        <div key={rIndex} style={{ marginBottom: "4px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                            <span style={{ color: getColor(rIndex) }}>{r.model_info.name}</span>
                            <span style={{ color: "#888" }}>{metric.format(value)}</span>
                          </div>
                          <div style={{ background: "#333", borderRadius: "3px", height: "6px", marginTop: "2px" }}>
                            <div style={{
                              width: `${pct}%`,
                              background: getColor(rIndex),
                              height: "100%",
                              borderRadius: "3px",
                              transition: "width 0.5s ease"
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
