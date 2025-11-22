import { NextResponse } from "next/server"
import { getMerchants } from "@/services/api"

export async function GET() {
  try {
    const data = await getMerchants()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ status: "Error" })
  }
}
