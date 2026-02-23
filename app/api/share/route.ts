import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { db } from "@/lib/db"
import { sharedResults } from "@/lib/db/schema"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { won, difficulty, time, round, rank, message } = body

    if (typeof won !== "boolean" || !difficulty || typeof time !== "number" || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const id = nanoid(10)

    await db.insert(sharedResults).values({
      id,
      won,
      difficulty,
      time,
      round: round ?? 1,
      rank: rank ?? null,
      message,
    })

    return NextResponse.json({ id, url: `/share/${id}` })
  } catch (e) {
    console.error("Failed to create share link:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
