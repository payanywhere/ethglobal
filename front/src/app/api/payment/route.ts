import { type NextRequest, NextResponse } from "next/server"
import { getPaymentsByMerchantId } from "@/services/payment"

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

/**
 * Get latest merchant cashier payment order. Payment ID is the cashier ID.
 * 
 * return NextResponse.json({
      payment_id: id,
      merchant_id: merchantId,
      amount_usd: 0,
      status: "pending",
      qr_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/pay/${payment_id}`
    })
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get("payment_id") ?? ""

  if (!id) return new NextResponse("Payment ID is required", { status: 400 })

  const cashierOrders = await getPaymentsByMerchantId(id)

  // Sort cashier orders by createdAt descending
  cashierOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const record = cashierOrders[0]
  if (!record) return new NextResponse("Payment not found", { status: 404 })

  // Return the latest cashier order
  return NextResponse.json({
    payment_id: record.id,
    merchant_id: record.merchantId,
    amount_usd: record.amount,
    status: record.status,
    qr_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/pay/${record.id}`
  })
}
