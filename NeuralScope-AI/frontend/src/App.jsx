import { useState } from "react"
import axios from "axios"
import ModelSelector from "./components/ModelSelector"
import HealthScore from "./components/HealthScore"
import ArchitectureGraph from "./components/ArchitectureGraph"
import ParameterCharts from "./components/ParameterCharts"
import AIReport from "./components/AIReport"
import ComparisonView from "./components/ComparisonView"
import LayerHeatmap from "./components/LayerHeatmap"

const API = "http://localhost:8000"

export default function App() {
  const [activeTab, setActiveTab] = useState("analyze")
  const [selectedModel, setSelectedModel] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!selectedModel) return
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/analyze`, { model_key: selectedModel })
      setResult(res.data)
    } catch (e) {
      setError("Analysis failed. Make sure backend is running.")
    }
    setLoading(false)
  }

  return (
    <div style={{ background: "#0F1117", minHeight: "100vh", color: "white", fontFamily: "monospace" }}>

      <div style={{ background: "#1E1E2E", padding: "20px 40px", borderBottom: "1px solid #333" }}>
        <h1 style={{ margin: 0, fontSize: "24px", color: "#4A90D9" }}>
          🔬 NeuralScope AI
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#888", fontSize: "13px" }}>
          Neural Network Analysis & Diagnostics Platform
        </p>
      </div>

      <div style={{ padding: "20px 40px" }}>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {["analyze", "compare"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 20px",
                background: activeTab === tab ? "#4A90D9" : "#1E1E2E",
                color: "white",
                border: "1px solid #333",
                borderRadius: "6px",
                cursor: "pointer",
                textTransform: "capitalize"
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "analyze" && (
          <div>
            <ModelSelector
              selected={selectedModel}
              onSelect={setSelectedModel}
              api={API}
            />

            <button
              onClick={handleAnalyze}
              disabled={!selectedModel || loading}
              style={{
                marginTop: "16px",
                padding: "12px 32px",
                background: selectedModel ? "#4A90D9" : "#333",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: selectedModel ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              {loading ? "Analyzing..." : "Analyze Model"}
            </button>

            {error && (
              <div style={{ color: "#E74C3C", marginTop: "12px" }}>{error}</div>
            )}

            {result && (
              <div style={{ marginTop: "32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                  <HealthScore data={result.health} modelInfo={result.model_info} />
                  <ParameterCharts data={result.parameters} />
                </div>
                <LayerHeatmap layerStats={result.parameters.layer_stats} />
                <ArchitectureGraph graph={result.graph} />
                <AIReport report={result.ai_report} />
              </div>
            )}
          </div>
        )}

        {activeTab === "compare" && (
          <ComparisonView api={API} />
        )}

      </div>
    </div>
  )
}
