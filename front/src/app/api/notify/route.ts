import { type NextRequest, NextResponse } from "next/server"

type NotifyBody = {
  payment_id: string
  status: "confirmed" | "pending"
  tx_hash?: string
}

type PaymentStoreValue = {
  payment_id: string
  status: "pending" | "confirmed"
  tx_hash?: string
}

type PaymentStore = Map<string, PaymentStoreValue>

declare global {
  // eslint-disable-next-line no-var
  var __PAYMENTS_MOCK_STORE__: PaymentStore | undefined
}

if (!global.__PAYMENTS_MOCK_STORE__) {
  global.__PAYMENTS_MOCK_STORE__ = new Map<string, PaymentStoreValue>()
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as NotifyBody
  const { payment_id, status, tx_hash } = body

  const store = global.__PAYMENTS_MOCK_STORE__
  if (!store) {
    return new NextResponse("Store not initialized", { status: 500 })
  }

  store.set(payment_id, { payment_id, status, tx_hash })

  return NextResponse.json({
    message: "notified",
    payment_id,
    status,
    tx_hash
  })
}
