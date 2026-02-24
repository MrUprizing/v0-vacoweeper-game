import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer-core"
import chromium from "@sparticuz/chromium-min"
import fs from "node:fs"
import path from "node:path"

export const maxDuration = 60
export const runtime = "nodejs"

const CHROMIUM_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"

const NUMBER_COLORS: Record<number, string> = {
  1: "#6BA4E8", 2: "#4AE87A", 3: "#E8734A", 4: "#A46BE8",
  5: "#E84A4A", 6: "#4AE8D4", 7: "#E8E8E8", 8: "#888888",
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

async function getBrowser() {
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production"

  if (isProduction) {
    const executablePath = await chromium.executablePath(CHROMIUM_URL)
    return puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    })
  }

  const paths = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ]
  const fs = await import("node:fs")
  const executablePath = paths.find((p) => fs.existsSync(p))
  if (!executablePath) throw new Error("No local Chrome/Chromium found")

  return puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
    headless: true,
  })
}

function buildBoardHtml(boardState: string): string {
  try {
    const board = JSON.parse(boardState)
    if (!Array.isArray(board) || !board.length) return ""
    const cols = board[0]?.length ?? 9
    const cellPx = Math.max(6, Math.min(16, Math.floor(280 / cols)))
    const fontSize = Math.max(4, cellPx - 4)

    let html = `<table style="border-collapse:separate;border-spacing:1px;margin:0;padding:0;table-layout:fixed;"><tbody>`
    for (const row of board) {
      html += "<tr>"
      for (const cell of row) {
        let bg = "rgba(255,255,255,0.06)"
        let border = "rgba(255,255,255,0.1)"
        let content = ""
        let color = "transparent"
        if (cell.state === "revealed") {
          if (cell.isMine) {
            bg = "rgba(232,74,74,0.18)"; border = "rgba(232,74,74,0.3)"
            content = "&times;"; color = "#E84A4A"
          } else if (cell.adjacentMines > 0) {
            bg = "rgba(255,255,255,0.02)"; border = "rgba(255,255,255,0.04)"
            content = String(cell.adjacentMines)
            color = NUMBER_COLORS[cell.adjacentMines as number] || "#E8E8E8"
          } else {
            bg = "rgba(255,255,255,0.02)"; border = "rgba(255,255,255,0.04)"
            content = escapeHtml(cell.treat || "")
            color = "rgba(255,255,255,0.08)"
          }
        } else if (cell.state === "flagged") {
          bg = "rgba(232,115,74,0.12)"; border = "rgba(232,115,74,0.35)"
          content = "&#9654;"; color = "#E8734A"
        }
        html += `<td style="width:${cellPx}px;height:${cellPx}px;background:${bg};border:1px solid ${border};font-size:${fontSize}px;color:${color};text-align:center;vertical-align:middle;padding:0;line-height:1;">${content}</td>`
      }
      html += "</tr>"
    }
    html += "</tbody></table>"
    return html
  } catch {
    return ""
  }
}

function readImageAsDataUri(relativePath: string): string {
  try {
    const filePath = path.join(process.cwd(), "public", relativePath)
    const buf = fs.readFileSync(filePath)
    const ext = path.extname(relativePath).toLowerCase()
    const mime = ext === ".png" ? "image/png" : "image/jpeg"
    return `data:${mime};base64,${buf.toString("base64")}`
  } catch {
    return ""
  }
}

function buildCardHtml(params: {
  won: boolean
  difficulty: string
  time: number
  round: number
  rank: string | null
  message: string
  boardState: string | null
  vacoImgDataUri: string
}): string {
  const { won, difficulty, time, round, rank, message, boardState, vacoImgDataUri } = params
  const resultColor = won ? "#4AE87A" : "#E84A4A"
  const accent = "#E8734A"
  const resultText = won ? "ALL CLEAR" : "GAME OVER"
  const subText = won ? `COMPLETED IN ${time}s` : "VACO ATE GARBAGE"
  const boardHtml = boardState ? buildBoardHtml(boardState) : ""

  const rankHtml =
    won && rank
      ? `<div style="position:relative;padding:4px 14px;border:1px solid ${accent};color:${accent};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-family:inherit;">
          <span style="position:absolute;top:-1px;left:-1px;width:4px;height:4px;border-top:1px solid ${accent};border-left:1px solid ${accent};"></span>
          <span style="position:absolute;bottom:-1px;right:-1px;width:4px;height:4px;border-bottom:1px solid ${accent};border-right:1px solid ${accent};"></span>
          RANK: ${escapeHtml(rank)}
        </div>`
      : ""

  return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=block" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; width: 360px; font-family: 'JetBrains Mono', ui-monospace, 'Courier New', Courier, monospace; }
  </style>
</head>
<body>
<div id="card" style="width:360px;padding:32px 28px;background:#0a0a0a;border:1px solid ${resultColor}33;position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;font-family:'JetBrains Mono',ui-monospace,'Courier New',Courier,monospace;overflow:hidden;">
  <span style="position:absolute;top:0;left:0;width:16px;height:16px;border-top:2px solid ${resultColor};border-left:2px solid ${resultColor};"></span>
  <span style="position:absolute;top:0;right:0;width:16px;height:16px;border-top:2px solid ${resultColor};border-right:2px solid ${resultColor};"></span>
  <span style="position:absolute;bottom:0;left:0;width:16px;height:16px;border-bottom:2px solid ${resultColor};border-left:2px solid ${resultColor};"></span>
  <span style="position:absolute;bottom:0;right:0;width:16px;height:16px;border-bottom:2px solid ${resultColor};border-right:2px solid ${resultColor};"></span>

  <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
    <span style="font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);font-family:inherit;">//PROJECT:</span>
    <span style="font-size:13px;letter-spacing:0.15em;color:#E8E8E8;font-weight:700;font-family:inherit;">VACOWEEPER</span>
  </div>

  <img src="${vacoImgDataUri}" width="72" height="72" style="image-rendering:pixelated;border:1px solid ${resultColor}44;object-fit:cover;display:block;">

  <span style="font-size:20px;font-weight:700;letter-spacing:0.3em;color:${resultColor};text-transform:uppercase;font-family:inherit;">${resultText}</span>

  <span style="font-size:10px;letter-spacing:0.15em;color:rgba(255,255,255,0.4);text-transform:uppercase;font-family:inherit;">${subText}</span>

  <div style="display:flex;gap:16px;margin-top:4px;padding:8px 16px;border:1px solid rgba(255,255,255,0.08);position:relative;">
    <span style="position:absolute;top:-1px;left:-1px;width:4px;height:4px;border-top:1px solid ${accent};border-left:1px solid ${accent};"></span>
    <span style="position:absolute;bottom:-1px;right:-1px;width:4px;height:4px;border-bottom:1px solid ${accent};border-right:1px solid ${accent};"></span>
    <div style="display:flex;flex-direction:column;text-align:center;gap:2px;min-width:48px;">
      <span style="display:block;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;font-family:inherit;">MODE</span>
      <span style="display:block;font-size:13px;color:${accent};font-weight:600;letter-spacing:0.15em;font-family:inherit;">${escapeHtml(difficulty.toUpperCase())}</span>
    </div>
    <div style="width:1px;background:rgba(255,255,255,0.08);align-self:stretch;"></div>
    <div style="display:flex;flex-direction:column;text-align:center;gap:2px;min-width:48px;">
      <span style="display:block;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;font-family:inherit;">TIME</span>
      <span style="display:block;font-size:13px;color:rgba(255,255,255,0.7);font-weight:600;font-family:inherit;">${time}s</span>
    </div>
    <div style="width:1px;background:rgba(255,255,255,0.08);align-self:stretch;"></div>
    <div style="display:flex;flex-direction:column;text-align:center;gap:2px;min-width:48px;">
      <span style="display:block;font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.1em;font-family:inherit;">ROUND</span>
      <span style="display:block;font-size:13px;color:rgba(255,255,255,0.7);font-weight:600;font-family:inherit;">${String(round).padStart(2, "0")}</span>
    </div>
  </div>

  ${rankHtml}

  ${boardHtml ? `<div style="overflow:hidden;margin-top:2px;">${boardHtml}</div>` : ""}

  <span style="font-size:10px;color:rgba(255,255,255,0.45);text-align:center;text-transform:uppercase;letter-spacing:0.12em;line-height:1.6;max-width:280px;margin-top:2px;font-family:inherit;">
    &ldquo;${escapeHtml(message)}&rdquo;
  </span>

  <span style="font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.2);margin-top:4px;text-transform:uppercase;font-family:inherit;">
    vacoweeper.vercel.app
  </span>
</div>
</body></html>`
}

export async function POST(request: NextRequest) {
  const browser = await getBrowser()
  try {
    const body = await request.json()
    const { won, difficulty, time, round, rank, message, boardState } = body
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

    const vacoImgPath = won ? "images/vaco-face.jpeg" : "images/vaco-sad.jpg"
    const vacoImgDataUri = readImageAsDataUri(vacoImgPath)

    const html = buildCardHtml({ won, difficulty, time, round, rank, message, boardState, vacoImgDataUri })

    const page = await browser.newPage()
    await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 2 })
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 })
    await new Promise((r) => setTimeout(r, 300))

    const card = await page.$("#card")
    if (!card) throw new Error("Card element not found")
    const screenshot = await card.screenshot({ type: "png" })
    await page.close()

    return new NextResponse(screenshot as Buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="vacoweeper-result.png"',
      },
    })
  } catch (e) {
    console.error("Screenshot failed:", e)
    return NextResponse.json({ error: "Screenshot failed" }, { status: 500 })
  } finally {
    await browser.close()
  }
}
