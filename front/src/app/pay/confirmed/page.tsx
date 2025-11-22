"use client"
export const dynamic = "force-dynamic"

import { motion } from "framer-motion"
import { CheckCircle2, Coins, CreditCard, Download, Sparkles } from "lucide-react"
import { jsPDF } from "jspdf"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function ConfirmedContent() {
  const params = useSearchParams()
  const method = params.get("method") || "unknown"
  const paymentId = params.get("payment_id") || `PAY-${Date.now()}`
  const amount = params.get("amount") || "N/A"

  const isCrypto = method.toLowerCase() === "crypto"
  const _MethodIcon = isCrypto ? Coins : CreditCard

  const handleSaveReceipt = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      
      // Colors matching neobrutalism theme
      const textColor = 0 // black
      const lightGrayR = 128
      const lightGrayG = 128
      const lightGrayB = 128
      const borderColor = 0 // black

      // Calculate center position for all content
      const contentWidth = 120
      const startX = (pageWidth - contentWidth) / 2
      let yPos = 40

      // Header with company name and receipt title - centered
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(textColor, textColor, textColor)
      doc.text("PayAnyWhere", pageWidth / 2, yPos, { align: "center" })
      yPos += 12

      doc.setFontSize(16)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(lightGrayR, lightGrayG, lightGrayB)
      doc.text("Receipt", pageWidth / 2, yPos, { align: "center" })
      yPos += 25

      // Transaction details as a table - centered
      const tableData = [
        { label: "ID", value: paymentId },
        { label: "Method", value: method.toUpperCase() },
        { label: "Date", value: new Date().toLocaleString() },
        { label: "Amount", value: amount !== "N/A" ? `$${amount}` : "N/A" }
      ]

      const rowHeight = 12
      const cellPadding = 8
      const labelWidth = 45
      const tableHeight = rowHeight * tableData.length
      const tableTopY = yPos

      // Set up drawing properties
      doc.setDrawColor(borderColor, borderColor, borderColor)
      doc.setLineWidth(0.5)

      // Draw outer table border
      doc.rect(startX, tableTopY, contentWidth, tableHeight)

      // Draw vertical separator line between columns
      const columnSeparatorX = startX + labelWidth + (cellPadding * 2)
      doc.line(columnSeparatorX, tableTopY, columnSeparatorX, tableTopY + tableHeight)

      // Draw rows and content
      tableData.forEach(({ label, value }, index) => {
        const currentRowY = tableTopY + (index * rowHeight)
        const textBaseY = currentRowY + (rowHeight / 2) + 3

        // Draw horizontal separator line between rows (except for first row)
        if (index > 0) {
          doc.line(startX, currentRowY, startX + contentWidth, currentRowY)
        }

        // Draw label in left column
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(lightGrayR, lightGrayG, lightGrayB)
        doc.text(label, startX + cellPadding, textBaseY, { align: "left" })

        // Draw value in right column
        doc.setFont("helvetica", "bold")
        doc.setFontSize(10)
        doc.setTextColor(textColor, textColor, textColor)
        const valueStartX = columnSeparatorX + cellPadding
        const valueMaxWidth = contentWidth - labelWidth - (cellPadding * 4)
        doc.text(value, valueStartX, textBaseY, { align: "left", maxWidth: valueMaxWidth })
      })

      yPos = tableTopY + tableHeight + 20

      // Footer centered
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(lightGrayR, lightGrayG, lightGrayB)
      doc.text("Thank you for using PayAnyWhere", pageWidth / 2, yPos, { align: "center" })

      // Save the PDF
      const fileName = `receipt-${paymentId}-${Date.now()}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate receipt. Please try again.")
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

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <CardHeader className="space-y-4">
                <motion.div
                  className="flex justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <motion.div
                      className="w-24 h-24 rounded-full border-4 border-border bg-chart-1 flex items-center justify-center shadow-shadow"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <CheckCircle2 className="w-12 h-12 text-main-foreground" />
                    </motion.div>
                  </motion.div>
                </motion.div>
                <CardTitle className="text-3xl md:text-4xl font-heading">
                  Payment Successful!
                </CardTitle>
                <CardDescription className="text-base font-base">
                  Your payment via{" "}
                  <span className="font-heading font-bold text-foreground">
                    {method.toUpperCase()}
                  </span>{" "}
                  has been processed successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Unified Information Box */}
                <motion.div
                  className="p-6 rounded-base border-2 border-border bg-secondary-background space-y-3 shadow-shadow text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground" />
                    <p className="text-sm font-heading font-bold text-foreground">
                      Transaction Details
                    </p>
                  </div>
                  <div className="space-y-2 text-sm font-base">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Method:</span>
                      <span className="font-heading font-bold">{method.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Status:</span>
                      <span className="font-heading font-bold text-chart-1">Completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Date:</span>
                      <span className="font-base">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs font-base text-foreground/60 pt-2 border-t-2 border-border">
                    You will receive a confirmation email shortly with all the details.
                  </p>
                </motion.div>

                {/* Main Action - Save Receipt */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div whileHover={{ x: 4, y: 4 }} whileTap={{ x: 0, y: 0 }}>
                    <Button
                      onClick={handleSaveReceipt}
                      variant="default"
                      size="lg"
                      className="w-full min-h-14 text-lg font-heading"
                    >
                      <Download className="w-5 h-5" />
                      Save Receipt
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}

function LoadingFallback() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-center p-6 mb-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-heading text-foreground">
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
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-base border-2 border-border border-t-transparent animate-spin" />
          <p className="mt-4 font-heading text-foreground/50">Loading confirmation…</p>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmedContent />
    </Suspense>
  )
}
