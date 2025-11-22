"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import NavBar from "../../components/NavBar"

export default function DemoCheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const startFiat = async (): Promise<void> => {
    try {
      setLoading(true)
      // Call your backend to create a Mercado Pago payment preference
      const res = await fetch("/api/payment/fiat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: "merchant01",
          amount_usd: 10,
          description: "Demo purchase via PayAnyWhere"
        })
      })

      const data = await res.json()
      if (data?.init_point) {
        window.location.href = data.init_point // Redirect directly to Mercado Pago checkout
      } else {
        alert("Error: missing checkout link")
        console.error("Missing init_point in response", data)
      }
    } catch (err) {
      console.error("Error creating fiat payment:", err)
      alert("Error creating payment.")
    } finally {
      setLoading(false)
    }
  }

  const startCrypto = (): void => {
    router.push("/pay/confirmed?method=crypto")
  }

  return (
    <main>
      <NavBar />
      <div className="p-8 space-y-8">
        <h1 className="text-2xl font-bold">Pay Anywhere Demo</h1>
        <p className="text-gray-600">Choose how you want to pay this purchase.</p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            type="button"
            onClick={startFiat}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded text-lg disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Pay with FIAT (MercadoPago)"}
          </button>
          <button
            type="button"
            onClick={startCrypto}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded text-lg"
          >
            Pay with CRYPTO
          </button>
        </div>
      </div>
    </main>
  )
}
