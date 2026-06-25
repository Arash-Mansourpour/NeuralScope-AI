import { useState, useRef, useEffect } from "react"

export default function ArchitectureGraph({ graph }) {
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(prev => Math.min(3, Math.max(0.5, prev + delta)))
      }
    }
    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
      return () => container.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const resetView = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  if (!graph) return null

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h3 style={{ color: "#4A90D9", margin: 0 }}>Architecture Graph</h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
            style={{ padding: "4px 12px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
          >
            +
          </button>
          <span style={{ color: "#888", fontSize: "12px", minWidth: "40px", textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
            style={{ padding: "4px 12px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
          >
            −
          </button>
          <button
            onClick={resetView}
            style={{ padding: "4px 12px", background: "#4A90D9", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
          >
            Reset
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          overflow: "hidden",
          borderRadius: "8px",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          border: "1px solid #333",
          background: "#0F1117"
        }}
      >
        <div style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: "center center",
          transition: dragging ? "none" : "transform 0.2s ease"
        }}>
          <img
            src={`data:image/png;base64,${graph}`}
            alt="Architecture Graph"
            style={{ display: "block", maxWidth: zoom === 1 ? "100%" : "none", margin: "0 auto" }}
            draggable={false}
          />
        </div>
      </div>
      <div style={{ marginTop: "8px", fontSize: "11px", color: "#666" }}>
        Ctrl+Scroll to zoom • Drag to pan when zoomed
      </div>
    </div>
  )
}
