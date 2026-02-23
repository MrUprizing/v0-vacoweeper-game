import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { sharedResults } from "@/lib/db/schema"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ id: string }>
}

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "https://vacoweeper.vercel.app"
}

async function getResult(id: string) {
  const rows = await db.select().from(sharedResults).where(eq(sharedResults.id, id)).limit(1)
  return rows[0] ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const result = await getResult(id)
  if (!result) return {}

  const title = result.won
    ? `ALL CLEAR in ${result.time}s — Vacoweeper`
    : "GAME OVER — Vacoweeper"

  const description = `"${result.message}" — ${result.difficulty.toUpperCase()} mode, ${result.time}s${result.rank ? ` | Rank: ${result.rank}` : ""}`

  const ogUrl = new URL("/api/og", getBaseUrl())
  ogUrl.searchParams.set("won", String(result.won))
  ogUrl.searchParams.set("difficulty", result.difficulty)
  ogUrl.searchParams.set("time", String(result.time))
  ogUrl.searchParams.set("round", String(result.round))
  if (result.rank) ogUrl.searchParams.set("rank", result.rank)
  ogUrl.searchParams.set("message", result.message)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const result = await getResult(id)
  if (!result) notFound()

  const resultColor = result.won ? "#4AE87A" : "#E84A4A"
  const accent = "#E8734A"
  const resultText = result.won ? "ALL CLEAR" : "GAME OVER"
  const subText = result.won ? `COMPLETED IN ${result.time}s` : "VACO ATE GARBAGE"
  const vacoSrc = result.won ? "/images/vaco-face.jpeg" : "/images/vaco-sad.jpg"

  return (
    <div
      className="min-h-svh flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div
        className="flex flex-col items-center gap-4 p-8"
        style={{
          border: `1px solid ${resultColor}33`,
          background: "#0a0a0a",
          maxWidth: 360,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/30">//PROJECT:</span>
          <span className="font-mono text-sm tracking-widest uppercase font-bold text-white/90">VACOWEEPER</span>
        </div>
        <img
          src={vacoSrc}
          alt="Vaco"
          width={72}
          height={72}
          className="object-cover"
          style={{ imageRendering: "pixelated", border: `1px solid ${resultColor}44` }}
        />
        <span
          className="font-mono text-xl font-bold tracking-[0.3em] uppercase"
          style={{ color: resultColor }}
        >
          {resultText}
        </span>
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/40">{subText}</span>
        <div className="flex gap-4 px-4 py-2 border border-white/[0.08]">
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-white/30">MODE</span>
            <span className="font-mono text-sm font-semibold" style={{ color: accent }}>{result.difficulty.toUpperCase()}</span>
          </div>
          <div className="w-px bg-white/[0.08]" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-white/30">TIME</span>
            <span className="font-mono text-sm font-semibold text-white/70">{result.time}s</span>
          </div>
          <div className="w-px bg-white/[0.08]" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-white/30">ROUND</span>
            <span className="font-mono text-sm font-semibold text-white/70">{String(result.round).padStart(2, "0")}</span>
          </div>
        </div>
        {result.won && result.rank && (
          <div className="px-4 py-1.5 border font-mono text-[10px] tracking-[0.15em] uppercase" style={{ borderColor: accent, color: accent }}>
            RANK: {result.rank}
          </div>
        )}
        {result.boardState && (() => {
          type CellSnapshot = {
            isMine: boolean
            adjacentMines: number
            state: "hidden" | "revealed" | "flagged"
            treat: string
          }
          const NUMBER_COLORS: Record<number, string> = {
            1: "#6BA4E8", 2: "#4AE87A", 3: "#E8734A", 4: "#A46BE8",
            5: "#E84A4A", 6: "#4AE8D4", 7: "#E8E8E8", 8: "#888888",
          }
          let board: CellSnapshot[][] = []
          try { board = JSON.parse(result.boardState) } catch { return null }
          const cols = board[0]?.length ?? 9
          const cellPx = Math.max(6, Math.min(16, Math.floor(280 / cols)))
          return (
            <div style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {board.map((row, r) => (
                  <div key={r} style={{ display: "flex", gap: 1 }}>
                    {row.map((cell, c) => {
                      let bg = "rgba(255,255,255,0.06)"
                      let borderColor = "rgba(255,255,255,0.1)"
                      let content = ""
                      let color = "transparent"
                      if (cell.state === "revealed") {
                        bg = cell.isMine ? "rgba(232,74,74,0.18)" : "rgba(255,255,255,0.02)"
                        borderColor = cell.isMine ? "rgba(232,74,74,0.3)" : "rgba(255,255,255,0.04)"
                        if (cell.isMine) {
                          content = "×"
                          color = "#E84A4A"
                        } else if (cell.adjacentMines > 0) {
                          content = String(cell.adjacentMines)
                          color = NUMBER_COLORS[cell.adjacentMines] || "#E8E8E8"
                        } else {
                          content = cell.treat
                          color = "rgba(255,255,255,0.08)"
                        }
                      } else if (cell.state === "flagged") {
                        bg = "rgba(232,115,74,0.12)"
                        borderColor = "rgba(232,115,74,0.35)"
                        content = "▶"
                        color = "#E8734A"
                      }
                      return (
                        <div
                          key={c}
                          style={{
                            width: cellPx,
                            height: cellPx,
                            background: bg,
                            border: `1px solid ${borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: Math.max(4, cellPx - 4),
                            color,
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          {content}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
        <span className="font-mono text-[10px] text-center text-white/45 max-w-[280px]">
          &ldquo;{result.message}&rdquo;
        </span>
        <Link
          href="/"
          className="mt-4 font-mono text-xs tracking-[0.2em] uppercase px-6 py-3 border-2 transition-all hover:scale-105"
          style={{ borderColor: accent, color: accent }}
        >
          PLAY VACOWEEPER
        </Link>
      </div>
    </div>
  )
}
