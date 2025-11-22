import { type NextRequest, NextResponse } from "next/server"

type PaymentRecord = {
  payment_id: string
  merchant_id: string
  amount_usd: number
  status: "pending" | "confirmed"
  qr_url?: string
}

// In-memory store (module scope, dev-only)
const payments = new Map<string, PaymentRecord>()

function makePaymentId(): string {
  return `pay_${Math.random().toString(36).slice(2, 10)}`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const merchant_id = String(body.merchant_id ?? "mrc_unknown")
  const amount_usd = Number(body.amount_usd ?? 0)
  const payment_id = makePaymentId()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ""
  const qr_url = `${baseUrl}/pay/${payment_id}`

  const record: PaymentRecord = {
    payment_id,
    merchant_id,
    amount_usd,
    status: "pending",
    qr_url
  }

  payments.set(payment_id, record)
  return NextResponse.json({ payment_id, qr_url, status: "pending" })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get("payment_id") ?? ""
  const merchantId = url.searchParams.get("merchant_id") ?? ""

  // If merchant_id is provided, return all payments for that merchant
  if (merchantId) {
    const merchantPayments = Array.from(payments.values()).filter(
      (p) => p.merchant_id === merchantId
    )
    // Sort by payment_id (most recent first, assuming newer IDs come later)
    merchantPayments.sort((a, b) => b.payment_id.localeCompare(a.payment_id))
    return NextResponse.json(merchantPayments)
  }

  if (id.startsWith("merchant-")) {
    const merchantId = id.replace("merchant-", "")
    return NextResponse.json({
      payment_id: id,
      merchant_id: merchantId,
      amount_usd: 0,
      status: "pending",
      qr_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/dashboard`
    })
  }

  const record = payments.get(id)
  if (!record) return new NextResponse("Not found", { status: 404 })

  return NextResponse.json(record)
}
