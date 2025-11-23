import { fetchDollarPrice } from "@/services/crypto-ya-prices"
import { type NextRequest, NextResponse } from "next/server"

interface FiatPaymentRequest {
  merchant_id: string
  amount_usd: number
  description?: string
  email?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: FiatPaymentRequest = await req.json()
    const { merchant_id, amount_usd, description } = body

    if (!merchant_id || !amount_usd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "Missing Mercado Pago sandbox token" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_BASE_URL")
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_BASE_URL environment variable" },
        { status: 500 }
      )
    }

    const dollarPrice = await fetchDollarPrice();

    const preferenceBody = {
      items: [
        {
          title: description ?? `Payment to ${merchant_id}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: amount_usd * dollarPrice
        }
      ],
      back_urls: {
        success: `${baseUrl}/payment/success`,
        failure: `${baseUrl}/payment/failure`,
        pending: `${baseUrl}/payment/pending`
      },
      ...(baseUrl.startsWith("https") ? { auto_return: "approved" } : {}),
      notification_url: `${baseUrl}/api/payment/fiat/webhook`,
      purpose: "wallet_purchase"
    }

    console.log(preferenceBody)

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(preferenceBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Mercado Pago API error:", errorText)
      return NextResponse.json({ error: `Mercado Pago error: ${errorText}` }, { status: 500 })
    }

    const data = await response.json()
    if (!data?.id || !data?.sandbox_init_point) {
      console.error("Invalid response from Mercado Pago:", data)
      return NextResponse.json(
        { error: "Invalid response from Mercado Pago", details: data },
        { status: 502 }
      )
    }

    return NextResponse.json({
      preference_id: data.id,
      init_point: data.sandbox_init_point
    })
  } catch (err) {
    console.error("Unexpected error in /api/payment/fiat:", err)
    return NextResponse.json(
      {
        error: "Unexpected server error",
        message: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
