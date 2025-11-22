"use client"

import Image from "next/image"
import QRCode from "qrcode"
import { useState } from "react"

interface PaymentResponse {
  preference_id: string
  init_point: string
}

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(10)
  const [merchantId] = useState<string>("merchant01")
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [qrImage, setQrImage] = useState<string>("")

  const createPayment = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/payment/fiat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount_usd: amount,
          description: `Purchase of $${amount} USD`
        })
      })

      const data = await res.json()
      setPayment(data)

      if (data.init_point) {
        const qr = await QRCode.toDataURL(data.init_point)
        setQrImage(qr)
      } else {
        console.error("Missing init_point in response", data)
      }
    } catch (e) {
      console.error("Error creating payment", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-2xl font-semibold">Pay with Mercado Pago (Sandbox)</h1>

      {!payment && (
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm text-gray-500">
            Amount (USD)
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="border border-gray-300 rounded p-2 ml-2 w-28 text-center"
            />
          </label>
          <button
            type="button"
            onClick={createPayment}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Payment"}
          </button>
        </div>
      )}

      {payment && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600">Scan the QR below or open the checkout link:</p>
          {qrImage && (
            <Image
              src={qrImage}
              alt="Mercado Pago QR"
              width={224}
              height={224}
              className="w-56 h-56"
              priority
            />
          )}
          <a
            href={payment.init_point}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open Mercado Pago Checkout
          </a>
          <button
            type="button"
            onClick={() => {
              setPayment(null)
              setQrImage("")
            }}
            className="mt-4 text-sm text-gray-500 underline"
          >
            Create another payment
          </button>
        </div>
      )}
    </div>
  )
}
