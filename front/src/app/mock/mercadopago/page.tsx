// app/mock/mercadopago/page.tsx
"use client"
export const dynamic = "force-dynamic"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

function MockMPInner() {
  const params = useSearchParams()
  const merchant = params.get("merchant")
  const amount = params.get("amount")

  useEffect(() => {
    const tid = setTimeout(() => {
      window.location.href = `/pay/confirmed?merchant=${merchant}&amount=${amount}`
    }, 2000)
    return () => clearTimeout(tid)
  }, [merchant, amount])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Mock MercadoPago checkout</h1>
      <p className="mt-3">Merchant: {merchant}</p>
      <p>Amount: {amount} USD</p>
      <p className="mt-4 text-gray-600">Simulating redirect back to merchant after payment…</p>
    </main>
  )
}

export default function MockMP() {
  return (
    <Suspense fallback={<div className="p-8">Loading mock checkout…</div>}>
      <MockMPInner />
    </Suspense>
  )
}
