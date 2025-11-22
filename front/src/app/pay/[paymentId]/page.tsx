"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  CreditCard,
  Loader2,
  RefreshCw,
  Sparkles,
  Wallet
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useConnection, useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appKit } from "@/lib/reown-config"
import {
  calculateTokenAmount,
  fetchWalletBalances,
  filterTokensWithSufficientBalance,
  type TokenBalance
} from "@/services/dune-sim"

interface PaymentDetails {
  payment_id: string
  merchant_id: string
  amount_usd: number
  status: "pending" | "confirmed"
  qr_url?: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.paymentId as string

  // Payment state
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Wallet state
  const { address, isConnected, chain } = useConnection()
  const { disconnect } = useDisconnect()

  // Token selection state
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loadingBalances, setLoadingBalances] = useState(false)
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null)

  // Payment processing
  const [processing, setProcessing] = useState(false)

  // Fetch payment details
  const fetchPayment = useCallback(async () => {
    try {
      setLoadingPayment(true)
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
      setLoadingPayment(false)
    }
  }, [paymentId])

  // Fetch balances when wallet connected
  const loadBalances = useCallback(async () => {
    if (!address || !payment) return

    try {
      setLoadingBalances(true)
      setError(null)

      const response = await fetchWalletBalances(address, {
        excludeSpamTokens: true,
        metadata: ["logo"],
        limit: 100
      })

      const sufficientBalances = filterTokensWithSufficientBalance(
        response.balances,
        payment.amount_usd
      )

      setBalances(sufficientBalances)

      if (sufficientBalances.length > 0 && !selectedToken) {
        setSelectedToken(sufficientBalances[0])
      }
    } catch (err) {
      console.error("Error loading balances:", err)
      setError(err instanceof Error ? err.message : "Failed to load wallet balances")
    } finally {
      setLoadingBalances(false)
    }
  }, [address, payment, selectedToken])

  // Load payment on mount
  useEffect(() => {
    if (paymentId) {
      fetchPayment()
    }
  }, [paymentId, fetchPayment])

  // Load balances when wallet connects
  useEffect(() => {
    if (isConnected && address && payment) {
      loadBalances()
    } else {
      setBalances([])
      setSelectedToken(null)
    }
  }, [isConnected, address, payment, loadBalances])

  // Handle fiat payment
  const startFiat = async (): Promise<void> => {
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
      setError("Failed to create payment. Please try again.")
      setProcessing(false)
    }
  }

  // Handle crypto payment
  const payCrypto = async (): Promise<void> => {
    if (!selectedToken || !payment || !address) return

    try {
      setProcessing(true)
      setError(null)

      // TODO: Implement actual crypto payment transaction
      // This would involve:
      // 1. Getting token amount needed
      // 2. Approving token spend (if ERC20)
      // 3. Sending transaction
      // 4. Waiting for confirmation
      // 5. Updating payment status in backend

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
      setError("Failed to process payment. Please try again.")
      setProcessing(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  }

  if (loadingPayment) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-foreground/50" />
          <p className="text-foreground/70">Loading payment details...</p>
        </div>
      </main>
    )
  }

  if (!payment) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Payment Not Found</CardTitle>
            <CardDescription>The payment you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (payment.status === "confirmed") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Payment Completed</CardTitle>
                <CardDescription>This payment has already been processed.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const availableTokens = filterTokensWithSufficientBalance(balances, payment.amount_usd)

  return (
    <main className="min-h-screen">
      {/* Header */}
      <nav className="flex items-center justify-center p-6 mb-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-heading text-foreground hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.svg"
            alt="PayAnyWhere Logo"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <span>PayAnyWhere</span>
        </Link>
      </nav>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Payment Amount */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <motion.h1
              className="text-4xl md:text-5xl font-heading font-bold"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 200, damping: 15 }}
            >
              ${payment.amount_usd.toFixed(2)} USD
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-foreground/70 font-base"
              variants={itemVariants}
            >
              Payment ID: {payment.payment_id}
            </motion.p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-base border-2 border-border bg-red-50 dark:bg-red-950 shadow-shadow"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-sm font-heading text-red-600 dark:text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 gap-6">
            {/* FIAT Payment Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex-1">
                  <motion.div
                    className="w-16 h-16 rounded-base border-2 border-border bg-main mb-4 flex items-center justify-center shadow-shadow"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <CreditCard className="w-8 h-8 text-main-foreground" />
                  </motion.div>
                  <CardTitle className="text-2xl font-heading">Pay with FIAT</CardTitle>
                  <CardDescription className="text-base font-base">
                    Use traditional payment methods via Mercado Pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div whileHover={{ x: 4, y: 4 }} whileTap={{ x: 0, y: 0 }}>
                    <Button
                      onClick={startFiat}
                      disabled={processing}
                      variant="default"
                      size="lg"
                      className="w-full min-h-14 text-lg font-heading"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue with FIAT
                          <CreditCard className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-xs text-foreground/50 mt-3 text-center font-base">
                    Secure payment gateway
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Crypto Payment Option */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="flex-1">
                  <motion.div
                    className="w-16 h-16 rounded-base border-2 border-border bg-chart-1 mb-4 flex items-center justify-center shadow-shadow"
                    whileHover={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Coins className="w-8 h-8 text-main-foreground" />
                  </motion.div>
                  <CardTitle className="text-2xl font-heading">Pay with CRYPTO</CardTitle>
                  <CardDescription className="text-base font-base">
                    {isConnected
                      ? `Connected to ${chain?.name || "Unknown"}`
                      : "Connect your wallet to pay with crypto"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isConnected ? (
                    <Button
                      onClick={() => appKit.open()}
                      variant="default"
                      size="lg"
                      className="w-full min-h-14 text-lg font-heading bg-chart-1 hover:bg-chart-1/90"
                    >
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </Button>
                  ) : (
                    <>
                      {/* Wallet Info */}
                      <div className="p-3 rounded-base border border-border bg-secondary-background">
                        <p className="text-sm font-mono text-foreground/70">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>

                      {/* Token Selection */}
                      {loadingBalances ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
                        </div>
                      ) : availableTokens.length === 0 ? (
                        <div className="p-4 rounded-base border border-border bg-secondary-background text-center space-y-3">
                          <p className="text-sm text-foreground/50">
                            No tokens with sufficient balance found.
                            <br />
                            Required: ${payment.amount_usd.toFixed(2)} USD
                          </p>
                          <Button
                            variant="neutral"
                            size="sm"
                            onClick={loadBalances}
                            className="gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Balances
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableTokens.slice(0, 3).map((token) => {
                              const { formattedAmount } = calculateTokenAmount(
                                token,
                                payment.amount_usd
                              )
                              const isSelected = selectedToken?.address === token.address

                              return (
                                <button
                                  key={`${token.chain_id}-${token.address}`}
                                  type="button"
                                  onClick={() => setSelectedToken(token)}
                                  className={`w-full p-3 rounded-base border-2 transition-all ${
                                    isSelected
                                      ? "border-[#00D696] bg-[#00D696]/10"
                                      : "border-border bg-secondary-background hover:border-foreground/20"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    {token.token_metadata?.logo ? (
                                      <Image
                                        src={token.token_metadata.logo}
                                        alt={token.symbol}
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                                        <span className="text-xs font-bold">
                                          {token.symbol.slice(0, 2)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex-1 text-left">
                                      <p className="font-heading font-semibold text-sm">
                                        {formattedAmount} {token.symbol}
                                      </p>
                                      <p className="text-xs text-foreground/50">
                                        ≈ ${payment.amount_usd.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              )
                            })}
                          </div>

                          <Button
                            onClick={payCrypto}
                            disabled={!selectedToken || processing}
                            variant="default"
                            size="lg"
                            className="w-full min-h-14 text-lg font-heading bg-chart-1 hover:bg-chart-1/90"
                          >
                            {processing ? (
                              <>
                                <Loader2 className="animate-spin w-5 h-5" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Pay with {selectedToken?.symbol || "Crypto"}
                                <Sparkles className="w-5 h-5" />
                              </>
                            )}
                          </Button>

                          <Button
                            variant="neutral"
                            size="sm"
                            onClick={() => disconnect()}
                            className="w-full text-xs"
                          >
                            Disconnect Wallet
                          </Button>
                        </>
                      )}
                    </>
                  )}
                  <p className="text-xs text-foreground/50 text-center font-base">
                    Fast & decentralized
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info Banner */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-base border-2 border-border bg-secondary-background shadow-shadow"
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="flex-shrink-0"
              >
                <Sparkles className="w-6 h-6 text-foreground" />
              </motion.div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-sm">Secure Payment</p>
                <p className="text-sm font-base text-foreground/70">
                  Your payment is processed securely. Choose the method that works best for you.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
