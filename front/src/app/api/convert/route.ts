// app/api/convert/route.ts
import { type NextRequest, NextResponse } from "next/server"

type Body = {
  amount_usd: number
  network: string
  token: string
}

const mockRates: Record<string, number> = {
  ETH: 4600, // USD per ETH
  USDC: 1,
  USDT: 1
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  const amountUsd = Number(body.amount_usd ?? 0)
  const token = String(body.token ?? "USDC")
  const rate = mockRates[token] ?? 1
  const token_amount =
    token === "ETH" ? Number((amountUsd / rate).toFixed(6)) : Number((amountUsd / rate).toFixed(4))
  return NextResponse.json({ token_amount, rate })
}
