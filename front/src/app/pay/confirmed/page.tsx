"use client"
export const dynamic = "force-dynamic"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import NavBar from "../../components/NavBar"

function ConfirmedContent() {
  const params = useSearchParams()
  const method = params.get("method")

  return (
    <main>
      <NavBar />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-3">Payment Confirmed (mock)</h1>
        <p className="text-gray-700">
          You have successfully paid using{" "}
          <span className="font-semibold">{method?.toUpperCase()}</span>.
        </p>
      </div>
    </main>
  )
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading confirmation…</div>}>
      <ConfirmedContent />
    </Suspense>
  )
}
