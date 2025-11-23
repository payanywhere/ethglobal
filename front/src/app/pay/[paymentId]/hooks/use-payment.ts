import { useCallback, useEffect, useState } from "react"
import type { Payment } from "@/services/api"
import { getPaymentsByMerchantId } from "@/services/payment"
import type { PaymentDetails } from "../types"

export function usePayment(paymentId: string) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPayment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch list of payments for this "merchant" (actually passes cashierId as paymentId param)
      const data = await getPaymentsByMerchantId(paymentId)

      // Expect data to be Payment[]. Find payment that matches the provided paymentId as "id"
      const paymentsCollection: Payment[] = Array.isArray(data) ? data : []

      if (!paymentsCollection) {
        throw new Error("Payment not found")
      }

      console.log("M:", paymentsCollection)

      // Filter payments, and get the latest payment
      // Fix: parse createdAt as string to Date before sorting
      const latestPayment = paymentsCollection.sort(
        (a: Payment, b: Payment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]

      // Map backend Payment to PaymentDetails
      const paymentDetails: PaymentDetails = {
        payment_id: latestPayment.id,
        merchant_id: latestPayment.merchantId,
        amount_usd: latestPayment.amount,
        status: latestPayment.status as "pending" | "confirmed",
        qr_url:
          typeof window !== "undefined" ? `${window.location.origin}/pay/${latestPayment.id}` : ""
      }
      console.log("M:", paymentDetails)

      setPayment(paymentDetails)
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
