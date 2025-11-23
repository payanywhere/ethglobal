import { useCallback, useEffect, useState } from "react"
import type { PaymentDetails } from "../types"

export function usePayment(paymentId: string) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/payment?payment_id=${paymentId}`)

      if (!res.ok) {
        throw new Error("Payment not found")
      }

      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        setPayment(data[0])
      } else if (data.payment_id) {
        setPayment(data)
      } else {
        throw new Error("Invalid payment data")
      }
    } catch (err) {
      console.error("Error fetching payment:", err)
      setError(err instanceof Error ? err.message : "Failed to load payment")
    } finally {
      setLoading(false)
    }
  }, [paymentId])

  useEffect(() => {
    if (paymentId) {
      fetchPayment()
    }
  }, [paymentId, fetchPayment])

  return {
    payment,
    loading,
    error,
    refetch: fetchPayment
  }
}
