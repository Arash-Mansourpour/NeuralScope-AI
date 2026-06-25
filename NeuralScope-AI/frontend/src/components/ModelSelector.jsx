import { useState, useRef } from "react"
import axios from "axios"

export default function ModelSelector({ selected, onSelect, api }) {
  const [models, setModels] = useState({})
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const fetchModels = () => {
    axios.get(`${api}/models`).then(r => setModels(r.data))
  }

  useState(() => {
    fetchModels()
  }, [])

  const handleFileUpload = async (file) => {
    if (!file) return
    if (!file.name.endsWith('.pth') && !file.name.endsWith('.pt') && !file.name.endsWith('.onnx')) {
      alert('Only .pth, .pt, or .onnx files are supported')
      return
    }

    setUploading(true)
    setUploadResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${api}/upload-model`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadResult(res.data)
      fetchModels()
    } catch (e) {
      setUploadResult({ success: false, message: e.response?.detail || "Upload failed" })
    }
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileUpload(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ color: "#4A90D9", margin: 0 }}>Select Model</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          style={{
            padding: "6px 16px",
            background: showUpload ? "#E74C3C" : "#4A90D9",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          {showUpload ? "Cancel" : "+ Upload Model"}
        </button>
      </div>

      {showUpload && (
        <div style={{ marginBottom: "16px", padding: "16px", background: "#0F1117", borderRadius: "8px", border: "1px solid #333" }}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "#4A90D9" : "#333"}`,
              borderRadius: "8px",
              padding: "24px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              background: dragOver ? "rgba(74, 144, 217, 0.1)" : "transparent"
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>📁</div>
            <div style={{ color: "#888", fontSize: "13px" }}>
              {uploading ? "Uploading..." : "Drop .pth, .pt, or .onnx file here or click to browse"}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pth,.pt,.onnx"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />
          </div>
          {uploadResult && (
            <div style={{
              marginTop: "12px",
              padding: "10px",
              borderRadius: "6px",
              background: uploadResult.success ? "rgba(39, 174, 96, 0.2)" : "rgba(231, 76, 60, 0.2)",
              color: uploadResult.success ? "#27AE60" : "#E74C3C",
              fontSize: "12px"
            }}>
              {uploadResult.success ? `✓ ${uploadResult.filename} uploaded successfully!` : `✗ ${uploadResult.message}`}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {Object.entries(models).map(([key, info]) => (
          <div
            key={key}
            onClick={() => onSelect(key)}
            style={{
              padding: "16px 20px",
              background: selected === key ? "#4A90D9" : "#1E1E2E",
              border: `1px solid ${selected === key ? "#4A90D9" : "#333"}`,
              borderRadius: "8px",
              cursor: "pointer",
              minWidth: "180px",
              transition: "all 0.2s"
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>{info.name}</div>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>{info.family}</div>
            <div style={{ fontSize: "11px", color: "#888", marginTop: "6px" }}>{info.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
