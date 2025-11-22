"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Coins, CreditCard, Loader2, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DemoCheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startFiat = async (): Promise<void> => {
    try {
      setLoading("fiat")
      setError(null)
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
        setError("Missing checkout link. Please try again.")
        console.error("Missing init_point in response", data)
        setLoading(null)
      }
    } catch (err) {
      console.error("Error creating fiat payment:", err)
      setError("Failed to create payment. Please try again.")
      setLoading(null)
    }
  }

  const startCrypto = (): void => {
    setLoading("crypto")
    setTimeout(() => {
      router.push("/pay/confirmed?method=crypto")
    }, 300)
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

  return (
    <main className="min-h-screen">
      {/* Centered logo for user-facing page */}
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
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <motion.h1
              className="text-4xl md:text-5xl font-heading font-bold"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" as const, stiffness: 200, damping: 15 }}
            >
              Choose Payment Method
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-foreground/70 font-base"
              variants={itemVariants}
            >
              Select how you want to complete this purchase
            </motion.p>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-base border-2 border-border bg-red-50 dark:bg-red-950 shadow-shadow"
              >
                <p className="text-sm font-heading text-red-600 dark:text-red-400">{error}</p>
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
                      disabled={loading !== null}
                      variant="default"
                      size="lg"
                      className="w-full min-h-14 text-lg font-heading"
                    >
                      {loading === "fiat" ? (
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
                    Complete your payment using cryptocurrency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div whileHover={{ x: 4, y: 4 }} whileTap={{ x: 0, y: 0 }}>
                    <Button
                      onClick={startCrypto}
                      disabled={loading !== null}
                      variant="default"
                      size="lg"
                      className="w-full min-h-14 text-lg font-heading bg-chart-1 hover:bg-chart-1/90"
                    >
                      {loading === "crypto" ? (
                        <>
                          <Loader2 className="animate-spin w-5 h-5" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Continue with CRYPTO
                          <Sparkles className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-xs text-foreground/50 mt-3 text-center font-base">
                    Fast & decentralized
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="p-6 rounded-base border-2 border-border bg-secondary-background shadow-shadow"
          >
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="flex-shrink-0"
              >
                <Sparkles className="w-6 h-6 text-foreground" />
              </motion.div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-sm">Payment Information</p>
                <p className="text-sm font-base text-foreground/70">
                  This is a demo transaction. No real payments will be processed in sandbox mode.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
