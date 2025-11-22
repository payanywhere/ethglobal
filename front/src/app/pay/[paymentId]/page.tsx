"use client"

import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { calculateTokenAmount } from "@/services/dune-sim"
import { getFriendlyErrorMessage } from "@/lib/error-utils"
import { CryptoPaymentCard } from "./components/crypto-payment-card"
import { ErrorMessage } from "./components/error-message"
import { FiatPaymentCard } from "./components/fiat-payment-card"
import { PaymentHeader } from "./components/payment-header"
import { PaymentAmount } from "./components/payment-amount"
import { PaymentInfoBanner } from "./components/payment-info-banner"
import { PaymentStatus } from "./components/payment-status"
import { ANIMATION_VARIANTS } from "./constants"
import { usePayment } from "./hooks/use-payment"
import { useTokenBalances } from "./hooks/use-token-balances"

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.paymentId as string

  // Custom hooks
  const { payment, loading: loadingPayment, error: paymentError } = usePayment(paymentId)
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()

  const {
    balances,
    loading: loadingBalances,
    error: balancesError,
    selectedToken,
    setSelectedToken,
    loadBalances
  } = useTokenBalances(payment)

  // Local state
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter tokens with sufficient balance (already filtered in hook, but ensure consistency)
  const availableTokens = useMemo(() => balances, [balances])

  // Memoize callbacks
  const handleTokenSelect = useCallback(
    (token: typeof balances[0]) => {
      setSelectedToken(token)
    },
    [setSelectedToken]
  )

  const handleDisconnect = useCallback(() => {
    disconnect()
  }, [disconnect])

  // Payment handlers
  const startFiat = useCallback(async () => {
    if (!payment) return

    try {
      setProcessing(true)
      setError(null)

      const res = await fetch("/api/payment/fiat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: payment.merchant_id,
          amount_usd: payment.amount_usd,
          description: `Payment ${payment.payment_id}`
        })
      })

      const data = await res.json()
      if (data?.init_point) {
        window.location.href = data.init_point
      } else {
        setError("Missing checkout link. Please try again.")
        setProcessing(false)
      }
    } catch (err) {
      console.error("Error creating fiat payment:", err)
      setError(getFriendlyErrorMessage(err))
      setProcessing(false)
    }
  }, [payment])

  const payCrypto = useCallback(async () => {
    if (!selectedToken || !payment || !address) return

    try {
      setProcessing(true)
      setError(null)

      const { formattedAmount } = calculateTokenAmount(selectedToken, payment.amount_usd)

      console.log("Processing payment:", {
        token: selectedToken.symbol,
        amount: formattedAmount,
        paymentId: payment.payment_id
      })

      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to success page
      router.push(`/pay/confirmed?method=crypto&token=${selectedToken.symbol}`)
    } catch (err) {
      console.error("Error processing crypto payment:", err)
      setError(getFriendlyErrorMessage(err))
      setProcessing(false)
    }
  }, [selectedToken, payment, address, router])

  // Memoize animation variants
  const containerVariants = useMemo(() => ANIMATION_VARIANTS.container, [])
  const itemVariants = useMemo(() => ANIMATION_VARIANTS.item, [])

  // Determine error to display
  const displayError = error || paymentError || balancesError

  // Early returns for loading and status states
  if (loadingPayment) {
    return <PaymentStatus status="loading" />
  }

  if (!payment) {
    return <PaymentStatus status="not-found" />
  }

  if (payment.status === "confirmed") {
    return <PaymentStatus status="confirmed" />
  }

  return (
    <main className="min-h-screen">
      <PaymentHeader />

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <PaymentAmount
            amount={payment.amount_usd}
            paymentId={payment.payment_id}
              variants={itemVariants}
          />

          <ErrorMessage error={displayError} />

          <div className={isConnected ? "space-y-6" : "grid md:grid-cols-2 gap-6"}>
            <CryptoPaymentCard
              isConnected={isConnected}
              chainName={chain?.name}
              address={address}
              tokens={availableTokens}
              selectedToken={selectedToken}
              paymentAmount={payment.amount_usd}
              loadingBalances={loadingBalances}
              processing={processing}
              onSelectToken={handleTokenSelect}
              onPay={payCrypto}
              onRefreshBalances={loadBalances}
              onDisconnect={handleDisconnect}
              variants={itemVariants}
            />

            <FiatPaymentCard
              isConnected={isConnected}
              processing={processing}
              onPay={startFiat}
              variants={itemVariants}
            />
          </div>

          <PaymentInfoBanner variants={itemVariants} />
        </motion.div>
      </div>
    </main>
  )
}
