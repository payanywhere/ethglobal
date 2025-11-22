"use client"

import Image from "next/image"
import QRCode from "qrcode"
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"

interface PaymentResponse {
  payment_id: string
  qr_url: string
  status: string
}

export default function DashboardPage() {
  const [qrData, setQrData] = useState<string>("")
  const [paymentLink, setPaymentLink] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const createPayment = async () => {
      try {
        setLoading(true)
        setError("")

        // Use your existing mock endpoint
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchant_id: "merchant01",
            amount_usd: 10
          })
        })

        if (!res.ok) {
          throw new Error(`Failed to create payment: ${res.status}`)
        }

        const data: PaymentResponse = await res.json()
        const link = data.qr_url // your /pay/pay_xxxxx link
        setPaymentLink(link)

        const qr = await QRCode.toDataURL(link)
        setQrData(qr)
      } catch (err) {
        console.error("Error creating payment:", err)
        setError("Failed to create payment. Check API or network connection.")
      } finally {
        setLoading(false)
      }
    }

    createPayment().catch(console.error)
  }, [])

  return (
    <main>
      <NavBar />
      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold mb-4">Merchant Dashboard (demo)</h1>

        <section>
          <h2 className="font-semibold mb-2">New Payment</h2>
          <p className="text-sm text-gray-600 mb-4">
            Each time you open this dashboard, a new mock payment is created and linked to the demo
            checkout page.
          </p>

          {loading && <p className="text-gray-500">Generating payment...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && qrData && (
            <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-6">
              <Image
                alt="payment-qr"
                src={qrData}
                width={240}
                height={240}
                className="border rounded"
              />
              <div>
                <p className="font-medium text-gray-700 mb-2">Payment link:</p>
                <a href={paymentLink} className="text-blue-600 underline break-all">
                  {paymentLink}
                </a>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
