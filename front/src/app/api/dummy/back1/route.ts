import { NextResponse } from "next/server"
import { health } from "@/services/api"

export async function GET() {
  try {
    const data = await health()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: "error" })
  }
}
