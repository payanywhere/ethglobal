"use client"

import Image from "next/image"
import QRCode from "qrcode"
import { useState } from "react"
import NavBar from "@/app/components/NavBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, QrCode, ExternalLink, ArrowLeft } from "lucide-react"

interface PaymentResponse {
  preference_id: string
  init_point: string
}

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(10)
  const [merchantId] = useState<string>("merchant01")
  const [description, setDescription] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string>("")

  const createPayment = async () => {
    if (amount <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/payment/fiat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount_usd: amount,
          description: description || `Purchase of $${amount} USD`,
          email: email || undefined
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to create payment")
      }

      const data = await res.json()
      setPayment(data)

      if (data.init_point || data.sandbox_init_point) {
        const initPoint = data.init_point || data.sandbox_init_point
        const qr = await QRCode.toDataURL(initPoint, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF"
          }
        })
        setQrImage(qr)
      } else {
        throw new Error("Missing payment URL in response")
      }
    } catch (e) {
      console.error("Error creating payment", e)
      setError(e instanceof Error ? e.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const resetPayment = () => {
    setPayment(null)
    setQrImage("")
    setError(null)
  }

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="container max-w-2xl mx-auto px-4 py-12">
        {!payment ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-heading">Create Payment</CardTitle>
              <CardDescription>
                Generate a payment link using Mercado Pago (Sandbox Mode)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-4 rounded-base border-2 border-red-500 bg-red-50 dark:bg-red-950">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-base font-heading">
                  Amount (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 font-heading">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-8 text-lg"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-foreground/50">
                  Enter the payment amount in US Dollars
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-heading">
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment description"
                  disabled={loading}
                />
                <p className="text-sm text-foreground/50">
                  Add a description for this payment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-heading">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  disabled={loading}
                />
                <p className="text-sm text-foreground/50">
                  Customer email address for notifications
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={createPayment}
                disabled={loading || amount <= 0}
                className="w-full min-h-12 text-lg font-heading"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Generating Payment...
                  </>
                ) : (
                  <>
                    Generate Payment Link
                    <QrCode />
                  </>
                )}
              </Button>
              <p className="text-xs text-foreground/50 text-center">
                This is a sandbox environment. No real payments will be processed.
              </p>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-heading flex items-center gap-2">
                <QrCode className="w-8 h-8" />
                Payment Ready
              </CardTitle>
              <CardDescription>
                Scan the QR code below or click the link to complete your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-6">
                {qrImage && (
                  <div className="p-6 rounded-base border-2 border-border bg-secondary-background">
                    <Image
                      src={qrImage}
                      alt="Mercado Pago QR Code"
                      width={300}
                      height={300}
                      className="w-64 h-64 md:w-72 md:h-72"
                      priority
                    />
                  </div>
                )}

                <div className="w-full space-y-3">
                  <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2">
                    <p className="text-sm font-heading text-foreground/50">Payment Amount</p>
                    <p className="text-2xl font-bold font-heading">${amount.toFixed(2)} USD</p>
                  </div>

                  {description && (
                    <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2">
                      <p className="text-sm font-heading text-foreground/50">Description</p>
                      <p className="text-base font-base">{description}</p>
                    </div>
                  )}
                </div>

                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="w-full min-h-12 text-lg font-heading"
                >
                  <a
                    href={payment.init_point}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Mercado Pago Checkout
                    <ExternalLink />
                  </a>
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={resetPayment}
                variant="neutral"
                className="w-full"
              >
                <ArrowLeft />
                Create Another Payment
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  )
}
