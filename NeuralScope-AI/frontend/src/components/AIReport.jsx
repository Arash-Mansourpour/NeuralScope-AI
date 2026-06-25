export default function AIReport({ report }) {
  if (!report) return null
  return (
    <div style={{ background: "#1E1E2E", padding: "24px", borderRadius: "12px", border: "1px solid #333", marginBottom: "20px" }}>
      <h3 style={{ color: "#4A90D9", margin: "0 0 16px 0" }}>AI Engineering Report</h3>
      <pre style={{
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        color: "#E0E0E0",
        margin: 0
      }}>
        {report}
      </pre>
    </div>
  )
}
