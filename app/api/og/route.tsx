import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const won = searchParams.get("won") === "true"
  const difficulty = searchParams.get("difficulty") ?? "easy"
  const time = searchParams.get("time") ?? "0"
  const round = searchParams.get("round") ?? "01"
  const rank = searchParams.get("rank")
  const message = searchParams.get("message") ?? ""

  const resultColor = won ? "#4AE87A" : "#E84A4A"
  const accent = "#E8734A"
  const resultText = won ? "ALL CLEAR" : "GAME OVER"
  const subText = won ? `COMPLETED IN ${time}s` : "VACO ATE GARBAGE"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          fontFamily: "monospace",
        }}
      >
        {/* Corner accents */}
        <div style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderTop: `3px solid ${resultColor}`, borderLeft: `3px solid ${resultColor}`, display: "flex" }} />
        <div style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderTop: `3px solid ${resultColor}`, borderRight: `3px solid ${resultColor}`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, width: 40, height: 40, borderBottom: `3px solid ${resultColor}`, borderLeft: `3px solid ${resultColor}`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: 20, right: 20, width: 40, height: 40, borderBottom: `3px solid ${resultColor}`, borderRight: `3px solid ${resultColor}`, display: "flex" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "18px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)" }}>
              //PROJECT:
            </span>
            <span style={{ fontSize: "28px", letterSpacing: "0.15em", color: "#E8E8E8", fontWeight: 700 }}>
              VACOWEEPER
            </span>
          </div>

          {/* Result */}
          <span style={{
            fontSize: "64px",
            fontWeight: 700,
            letterSpacing: "0.3em",
            color: resultColor,
          }}>
            {resultText}
          </span>

          {/* Sub text */}
          <span style={{ fontSize: "22px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>
            {subText}
          </span>

          {/* Stats row */}
          <div style={{
            display: "flex",
            gap: "40px",
            marginTop: "10px",
            padding: "16px 40px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>MODE</span>
              <span style={{ fontSize: "26px", color: accent, fontWeight: 600, letterSpacing: "0.15em" }}>{difficulty.toUpperCase()}</span>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.08)", display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>TIME</span>
              <span style={{ fontSize: "26px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{time}s</span>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.08)", display: "flex" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>ROUND</span>
              <span style={{ fontSize: "26px", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{String(round).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Rank */}
          {won && rank && (
            <div style={{
              padding: "8px 24px",
              border: `2px solid ${accent}`,
              color: accent,
              fontSize: "20px",
              letterSpacing: "0.15em",
              display: "flex",
            }}>
              RANK: {rank.toUpperCase()}
            </div>
          )}

          {/* Message */}
          <span style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            letterSpacing: "0.12em",
            maxWidth: "800px",
          }}>
            &ldquo;{message}&rdquo;
          </span>

          {/* URL */}
          <span style={{ fontSize: "16px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)", marginTop: "8px" }}>
            VACOWEEPER.VERCEL.APP
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
