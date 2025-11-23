"use client"

import { jsPDF } from "jspdf"
import { Loader2, Printer, QrCode } from "lucide-react"
import Image from "next/image"
import QRCode from "qrcode"
import { memo, useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMerchant } from "@/contexts/merchant-context"
import { createPayment } from "@/services/api"

interface PaymentFormOverlayProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  merchantId: string
}

export const PaymentFormOverlay = memo(function PaymentFormOverlay({
  open,
  onClose,
  onSuccess
}: PaymentFormOverlayProps) {
  const { cashiers, refreshCashiers, isLoading: isLoadingContext, merchant } = useMerchant()
  const [amount, setAmount] = useState<number>(10)
  const [description, setDescription] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [selectedCashierId, setSelectedCashierId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string>("")
  const [paymentData, setPaymentData] = useState<{ id: string; link: string } | null>(null)

  useEffect(() => {
    if (open) {
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    if (cashiers.length === 0) {
      refreshCashiers().catch((_err) => {
        setError("error loading cashiers")
      })
    } else if (!selectedCashierId) {
      setSelectedCashierId(cashiers[0].uuid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cashiers.length, refreshCashiers, selectedCashierId])

  useEffect(() => {
    if (cashiers.length > 0 && !selectedCashierId) {
      setSelectedCashierId(cashiers[0].uuid)
    }
  }, [cashiers, selectedCashierId])

  // Reset form when dialog closes
  const handleClose = useCallback(() => {
    if (!loading) {
      setAmount(10)
      setDescription("")
      setEmail("")
      setSelectedCashierId("")
      setError(null)
      setQrImage("")
      setPaymentData(null)
      onClose()
    }
  }, [loading, onClose])

  // Create payment
  const createPaymentHandler = useCallback(async () => {
    if (amount <= 0) {
      setError("Amount must be greater than 0")
      return
    }
    if (!selectedCashierId) {
      setError("Please select a cashier")
      return
    }
    if (!merchant || !merchant.wallets || merchant.wallets.length === 0) {
      setError("Merchant does not have wallets configured")
      return
    }

    const firstWallet = merchant.wallets[0]
    if (!firstWallet.tokens || firstWallet.tokens.length === 0) {
      setError("Merchant wallet does not have tokens configured")
      return
    }
    const network = firstWallet.network
    const token = firstWallet.tokens[0]

    try {
      setLoading(true)
      setError(null)

      const payment = await createPayment({
        cashierId: selectedCashierId,
        amount: amount,
        token: token,
        network: network,
        description: description || undefined,
        email: email || undefined
      })

      const link = `${window.location.origin}/pay/${payment.cashierId}`
      setPaymentData({ id: payment.id, link })

      const qr = await QRCode.toDataURL(link, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
      setQrImage(qr)
    } catch (e) {
      console.error("Error creating payment", e)
      setError(e instanceof Error ? e.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }, [amount, description, email, merchant, selectedCashierId])

  const handleDownloadPdf = useCallback(() => {
    if (!qrImage || !paymentData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Title
    doc.setFontSize(22)
    doc.text("Pay here", pageWidth / 2, 25, { align: "center" })

    // QR Code
    const qrSize = 120
    const qrY = 55
    doc.addImage(qrImage, "PNG", (pageWidth - qrSize) / 2, qrY, qrSize, qrSize)

    // Description
    if (description) {
      doc.setFontSize(14)
      const descLines = doc.splitTextToSize(description, 160)
      doc.text(descLines, pageWidth / 2, qrY + qrSize + 20, { align: "center" })
    }

    // Footer Link
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(paymentData.link, pageWidth / 2, 280, { align: "center" })

    doc.save(`payment-${paymentData.id}.pdf`)
  }, [qrImage, paymentData, description])

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
          <DialogDescription>Generate a QR code to receive payment.</DialogDescription>
        </DialogHeader>

        {!paymentData ? (
          <div className="space-y-6 py-4">
            {error && (
              <div className="p-4 rounded-base border-2 border-border bg-red-50 dark:bg-red-950 shadow-shadow">
                <p className="text-sm font-heading text-red-600 dark:text-red-400">{error}</p>
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

            <div className="space-y-2">
              <Label htmlFor="cashier" className="text-base font-heading">
                Cashier
              </Label>
              {isLoadingContext ? (
                <div className="flex items-center gap-2 p-3 border-2 border-border rounded-base">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-foreground/50">Loading cashiers...</span>
                </div>
              ) : (
                <select
                  id="cashier"
                  value={selectedCashierId}
                  onChange={(e) => setSelectedCashierId(e.target.value)}
                  disabled={loading || cashiers.length === 0}
                  className="w-full px-3 py-2 text-base border-2 border-border rounded-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cashiers.length === 0 ? (
                    <option value="">No cashiers available</option>
                  ) : (
                    cashiers.map((cashier) => (
                      <option key={cashier.uuid} value={cashier.uuid}>
                        {cashier.name || cashier.uuid}
                      </option>
                    ))
                  )}
                </select>
              )}
              <p className="text-sm text-foreground/50 font-base">
                Select the cashier for this payment
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-6">
                  {qrImage && (
                    <div className="p-6 rounded-base border-2 border-border bg-white shadow-shadow">
                      <Image
                        src={qrImage}
                        alt="Payment QR Code"
                        width={300}
                        height={300}
                        className="w-64 h-64 md:w-72 md:h-72"
                        priority
                      />
                    </div>
                  )}

                  <div className="w-full space-y-3">
                    <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2 shadow-shadow">
                      <p className="text-sm font-heading text-foreground/50">Payment Amount</p>
                      <p className="text-2xl font-bold font-heading">${amount.toFixed(2)} USD</p>
                    </div>

                    {description && (
                      <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2 shadow-shadow">
                        <p className="text-sm font-heading text-foreground/50">Description</p>
                        <p className="text-base font-base">{description}</p>
                      </div>
                    )}

                    <div className="p-4 rounded-base border-2 border-border bg-secondary-background space-y-2 shadow-shadow">
                      <p className="text-sm font-heading text-foreground/50">Payment Link</p>
                      <p className="text-xs font-mono break-all text-foreground/70">
                        {paymentData.link}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownloadPdf}
                    variant="default"
                    size="lg"
                    className="w-full min-h-12 text-lg font-heading"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print / Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {paymentData ? (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => {
                  setPaymentData(null)
                  setQrImage("")
                }}
                variant="neutral"
                className="flex-1 h-12 text-lg !font-heading !font-bold"
                size="lg"
              >
                Create Another
              </Button>
              <Button
                onClick={handleSuccess}
                variant="default"
                className="flex-1 h-12 text-lg !font-heading !font-bold"
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
                className="flex-1 h-12 text-lg !font-heading !font-bold"
                size="lg"
              >
                Cancel
              </Button>
              <Button
                onClick={createPaymentHandler}
                disabled={loading || amount <= 0 || !selectedCashierId}
                variant="default"
                className="flex-1 h-12 text-lg !font-heading !font-bold"
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
