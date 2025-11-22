import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("🪝 Mercado Pago Webhook received:", body)

    const { id, data } = body
    const paymentId = data?.id ?? id ?? body["data.id"] ?? null

    if (!paymentId) {
      console.error("❌ Missing payment ID in webhook payload")
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      console.error("❌ Missing MP_ACCESS_TOKEN environment variable")
      return NextResponse.json({ error: "Missing MP_ACCESS_TOKEN" }, { status: 500 })
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!paymentResponse.ok) {
      const errText = await paymentResponse.text()
      console.error("❌ Failed to fetch payment details:", errText)
      return NextResponse.json(
        { error: "Failed to fetch payment details", details: errText },
        { status: 500 }
      )
    }

    const paymentData = await paymentResponse.json()
    console.log("✅ Payment status:", paymentData.status)

    // Update your DB or dashboard with the payment status here
    // Example: updatePaymentStatus(paymentId, paymentData.status)

    return NextResponse.json({ received: true, status: paymentData.status })
  } catch (err) {
    console.error("💥 Webhook error:", err)
    return NextResponse.json(
      {
        error: "Unexpected server error",
        message: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(_req: NextRequest) {
  console.log("🪝 Webhook validation GET received")
  return NextResponse.json({ message: "Webhook active" })
}
