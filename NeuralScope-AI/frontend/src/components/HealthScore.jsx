export default function HealthScore({ data, modelInfo }) {
  if (!data) return null

  const scores = [
    { label: "Architecture", value: data.architecture_score, max: 10 },
    { label: "Efficiency", value: data.efficiency_score, max: 10 },
    { label: "Health", value: data.health_score, max: 10 },
    { label: "Overall", value: data.overall_score, max: 10 },
  ]

  const radarSize = 200
  const radarCenter = radarSize / 2
  const radarRadius = 70
  const levels = 5

  const angleStep = (2 * Math.PI) / scores.length

  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2
    const r = (value / 10) * radarRadius
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
    }
  }

  const polygonPoints = scores
    .map((s, i) => {
      const p = getPoint(i, s.value)
      return `${p.x},${p.y}`
    })
    .join(" ")

  const gridLevels = Array.from({ length: levels }, (_, i) => {
    const levelRadius = ((i + 1) / levels) * radarRadius
    const points = scores
      .map((_, j) => {
        const angle = angleStep * j - Math.PI / 2
        return `${radarCenter + levelRadius * Math.cos(angle)},${radarCenter + levelRadius * Math.sin(angle)}`
      })
      .join(" ")
    return points
  })

  const getColor = (score) => {
    if (score >= 8) return "#27AE60"
    if (score >= 6) return "#F39C12"
    if (score >= 4) return "#E67E22"
    return "#E74C3C"
  }

  return (
    <div style={{ background: "#1E1E2E", padding: "20px", borderRadius: "12px", border: "1px solid #333" }}>
      <h3 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>Model Health Score</h3>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: getColor(data.overall_score) }}>
          {data.overall_score}
        </div>
        <div style={{ fontSize: "24px", marginTop: "4px" }}>{data.stars}</div>
        <div style={{ fontSize: "20px", color: "#F39C12", marginTop: "4px" }}>Grade: {data.grade}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <svg width={radarSize} height={radarSize}>
          {gridLevels.map((points, i) => (
            <polygon
              key={i}
              points={points}
              fill="none"
              stroke="#333"
              strokeWidth="1"
            />
          ))}
          {scores.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2
            return (
              <line
                key={i}
                x1={radarCenter}
                y1={radarCenter}
                x2={radarCenter + radarRadius * Math.cos(angle)}
                y2={radarCenter + radarRadius * Math.sin(angle)}
                stroke="#333"
                strokeWidth="1"
              />
            )
          })}
          <polygon
            points={polygonPoints}
            fill="rgba(74, 144, 217, 0.3)"
            stroke="#4A90D9"
            strokeWidth="2"
          />
          {scores.map((s, i) => {
            const p = getPoint(i, s.value)
            return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#4A90D9" />
          })}
          {scores.map((s, i) => {
            const angle = angleStep * i - Math.PI / 2
            const labelRadius = radarRadius + 20
            return (
              <text
                key={i}
                x={radarCenter + labelRadius * Math.cos(angle)}
                y={radarCenter + labelRadius * Math.sin(angle)}
                fill="#888"
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {s.label}
              </text>
            )
          })}
          {scores.map((s, i) => {
            const p = getPoint(i, s.value)
            return (
              <text
                key={`val-${i}`}
                x={p.x}
                y={p.y - 10}
                fill="white"
                fontSize="9"
                textAnchor="middle"
                fontWeight="bold"
              >
                {s.value}
              </text>
            )
          })}
        </svg>
      </div>

      {scores.map(s => (
        <div key={s.label} style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px" }}>{s.label}</span>
            <span style={{ color: getColor(s.value) }}>{s.value}/10</span>
          </div>
          <div style={{ background: "#333", borderRadius: "4px", height: "8px" }}>
            <div style={{
              width: `${s.value * 10}%`,
              background: getColor(s.value),
              height: "100%",
              borderRadius: "4px",
              transition: "width 0.5s ease"
            }} />
          </div>
        </div>
      ))}

      {modelInfo && (
        <div style={{ marginTop: "16px", padding: "12px", background: "#0F1117", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", color: "#888" }}>
            <div>Params: {(modelInfo.total_params / 1e6).toFixed(1)}M</div>
            <div>Memory: {modelInfo.memory_mb} MB</div>
            <div>Family: {modelInfo.family}</div>
          </div>
        </div>
      )}
    </div>
  )
}
