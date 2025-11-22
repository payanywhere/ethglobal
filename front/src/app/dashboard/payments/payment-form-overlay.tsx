"use client"

import { memo, useCallback, useState } from "react"
import { Loader2, QrCode } from "lucide-react"
import Image from "next/image"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface PaymentFormOverlayProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  merchantId: string
}

interface PaymentResponse {
  preference_id: string
  init_point: string
  sandbox_init_point?: string
}

export const PaymentFormOverlay = memo(function PaymentFormOverlay({
  open,
  onClose,
  onSuccess,
  merchantId
}: PaymentFormOverlayProps) {
  const [amount, setAmount] = useState<number>(10)
  const [description, setDescription] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string>("")
  const [payment, setPayment] = useState<PaymentResponse | null>(null)

  // Reset form when dialog closes
  const handleClose = useCallback(() => {
    if (!loading) {
      setAmount(10)
      setDescription("")
      setEmail("")
      setError(null)
      setQrImage("")
      setPayment(null)
      onClose()
    }
  }, [loading, onClose])

  // Create payment
  const createPayment = useCallback(async () => {
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
  }, [amount, description, email, merchantId])

  // Handle success and close
  const handleSuccess = useCallback(() => {
    onSuccess()
    handleClose()
  }, [onSuccess, handleClose])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
          <DialogDescription>
            Generate a payment link using Mercado Pago (Sandbox Mode)
          </DialogDescription>
        </DialogHeader>

        {!payment ? (
          <div className="space-y-6 py-4">
            {error && (
              <div className="p-4 rounded-base border-2 border-border bg-red-50 dark:bg-red-950 shadow-shadow">
                <p className="text-sm font-heading text-red-600 dark:text-red-400">
                  {error}
                </p>
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
              <p className="text-sm text-foreground/50 font-base">
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
              <p className="text-sm text-foreground/50 font-base">
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
              <p className="text-sm text-foreground/50 font-base">
                Customer email address for notifications
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-6">
                  {qrImage && (
                    <div className="p-6 rounded-base border-2 border-border bg-secondary-background shadow-shadow">
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
                    <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2 shadow-shadow">
                      <p className="text-sm font-heading text-foreground/50">
                        Payment Amount
                      </p>
                      <p className="text-2xl font-bold font-heading">
                        ${amount.toFixed(2)} USD
                      </p>
                    </div>

                    {description && (
                      <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2 shadow-shadow">
                        <p className="text-sm font-heading text-foreground/50">
                          Description
                        </p>
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
                      href={payment.init_point || payment.sandbox_init_point}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Mercado Pago Checkout
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {payment ? (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => {
                  setPayment(null)
                  setQrImage("")
                }}
                variant="neutral"
                className="flex-1 min-h-12 text-lg font-heading"
                size="lg"
              >
                Create Another
              </Button>
              <Button
                onClick={handleSuccess}
                variant="default"
                className="flex-1 min-h-12 text-lg font-heading"
                size="lg"
              >
                Done
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button
                onClick={handleClose}
                variant="neutral"
                disabled={loading}
                className="flex-1 min-h-12 text-lg font-heading"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onClick={createPayment}
                disabled={loading || amount <= 0}
                className="flex-1 min-h-12 text-lg font-heading"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Generating Payment...
                  </>
                ) : (
                  <>
                    Generate Payment Link
                    <QrCode className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

