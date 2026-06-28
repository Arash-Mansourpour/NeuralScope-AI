import { useState, useRef, useEffect, useCallback } from "react"

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

export default function ArchitectureGraph({ graph, architecture }) {
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredLayer, setHoveredLayer] = useState(null)
  const [useSvgMode, setUseSvgMode] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoom(prev => Math.min(4, Math.max(0.3, prev + delta)))
      }
    }
    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
      return () => container.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const handleMouseDown = (e) => {
    setDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
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

  const layers = architecture?.layers || []

  const renderSvgGraph = () => {
    if (!architecture || !architecture.layers) return null

    const displayLayers = architecture.layers.slice(0, 50)
    const nodeWidth = 90
    const nodeHeight = 36
    const hGap = 20
    const vGap = 50
    const cols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(displayLayers.length))))
    const rows = Math.ceil(displayLayers.length / cols)

    const svgWidth = cols * (nodeWidth + hGap) + hGap
    const svgHeight = rows * (nodeHeight + vGap) + vGap + 40

    return (
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: "block" }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#555" />
          </marker>
        </defs>

        {displayLayers.map((layer, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = col * (nodeWidth + hGap) + hGap
          const y = row * (nodeHeight + vGap) + vGap
          const nextCol = (i + 1) % cols
          const nextRow = Math.floor((i + 1) / cols)
          const nextX = nextCol * (nodeWidth + hGap) + hGap
          const nextY = nextRow * (nodeHeight + vGap) + vGap

          if (i >= displayLayers.length - 1) return null

          return (
            <line
              key={`edge-${i}`}
              x1={x + nodeWidth}
              y1={y + nodeHeight / 2}
              x2={nextX}
              y2={nextY + nodeHeight / 2}
              stroke="#444"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
              opacity={hoveredLayer === i || hoveredLayer === i + 1 ? 1 : 0.4}
            />
          )
        })}

        {displayLayers.map((layer, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const x = col * (nodeWidth + hGap) + hGap
          const y = row * (nodeHeight + vGap) + vGap
          const isHovered = hoveredLayer === i

          return (
            <g
              key={`node-${i}`}
              onMouseEnter={() => setHoveredLayer(i)}
              onMouseLeave={() => setHoveredLayer(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={nodeWidth}
                height={nodeHeight}
                rx="6"
                fill={isHovered ? getColor(layer.type) : `${getColor(layer.type)}CC`}
                stroke={isHovered ? "#fff" : getColor(layer.type)}
                strokeWidth={isHovered ? 2 : 1}
                opacity={isHovered ? 1 : 0.9}
              />
              <text
                x={x + nodeWidth / 2}
                y={y + nodeHeight / 2 + 4}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {layer.type.length > 10 ? layer.type.slice(0, 10) : layer.type}
              </text>
              {layer.params > 0 && (
                <text
                  x={x + nodeWidth / 2}
                  y={y + nodeHeight + 12}
                  textAnchor="middle"
                  fill="#888"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {layer.params >= 1e6 ? `${(layer.params / 1e6).toFixed(1)}M` :
                   layer.params >= 1e3 ? `${(layer.params / 1e3).toFixed(1)}K` :
                   layer.params}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    )
  }

  const renderImageGraph = () => (
    <img
      src={`data:image/png;base64,${graph}`}
      alt="Architecture Graph"
      style={{ display: "block", maxWidth: "100%", margin: "0 auto" }}
      draggable={false}
    />
  )

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <h3 style={{ color: "#4A90D9", margin: 0 }}>Architecture Graph</h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setUseSvgMode(!useSvgMode)}
            style={{
              padding: "4px 12px",
              background: useSvgMode ? "#4A90D9" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11px"
            }}
          >
            {useSvgMode ? "Interactive SVG" : "Static PNG"}
          </button>
          <button
            onClick={() => setZoom(prev => Math.min(4, prev + 0.2))}
            style={{ padding: "4px 12px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px" }}
          >
            +
          </button>
          <span style={{ color: "#888", fontSize: "12px", minWidth: "40px", textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.max(0.3, prev - 0.2))}
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

      {hoveredLayer !== null && architecture?.layers?.[hoveredLayer] && (
        <div style={{
          background: "#16162A",
          padding: "10px 14px",
          borderRadius: "6px",
          marginBottom: "12px",
          fontSize: "12px",
          border: "1px solid #333",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <span><span style={{ color: "#888" }}>Layer:</span> <span style={{ color: "#4A90D9" }}>{architecture.layers[hoveredLayer].name}</span></span>
          <span><span style={{ color: "#888" }}>Type:</span> <span style={{ color: getColor(architecture.layers[hoveredLayer].type) }}>{architecture.layers[hoveredLayer].type}</span></span>
          <span><span style={{ color: "#888" }}>Params:</span> <span style={{ color: "#27AE60" }}>{architecture.layers[hoveredLayer].params?.toLocaleString()}</span></span>
        </div>
      )}

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          overflow: "auto",
          borderRadius: "8px",
          cursor: dragging ? "grabbing" : "grab",
          border: "1px solid #333",
          background: "#0F1117",
          maxHeight: "500px"
        }}
      >
        <div style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: "top left",
          transition: dragging ? "none" : "transform 0.2s ease",
          padding: "10px"
        }}>
          {useSvgMode && architecture ? renderSvgGraph() : (graph ? renderImageGraph() : <div style={{ color: "#666", padding: "20px" }}>No graph available</div>)}
        </div>
      </div>

      <div style={{ marginTop: "8px", fontSize: "11px", color: "#666" }}>
        Ctrl+Scroll to zoom • Drag to pan • Hover nodes for details
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
        {Object.entries(LAYER_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#888" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: color }} />
            {type}
          </div>
        ))}
      </div>
    </div>
  )
}
