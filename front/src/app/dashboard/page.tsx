"use client"

import { CreditCard, DollarSign, Plus, TrendingUp, Users, CheckCircle2, Clock, ExternalLink, Loader2, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import QRCode from "qrcode"
import { memo, Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useMerchantVerification } from "@/hooks/use-merchant-verification"
import { useMerchant } from "@/contexts/merchant-context"
import { cn } from "@/lib/utils"
import type { Payment } from "@/services/api"

interface PaymentResponse {
  payment_id: string
  qr_url: string
  status: string
}

interface PaymentRecord {
  id: string
  cashier_id: string
  merchant_id: string
  amount_usd: number
  status: "pending" | "consolidated" | "failed"
  createdAt: Date | string
}

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: PaymentRecord["status"] }) => {
  const isConsolidated = status === "consolidated"
  const isFailed = status === "failed"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-base px-2 py-1 text-xs font-medium",
        isConsolidated
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : isFailed
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      )}
    >
      {isConsolidated ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Consolidated
        </>
      ) : isFailed ? (
        <>
          <XCircle className="h-3 w-3" />
          Failed
        </>
      ) : (
        <>
          <Clock className="h-3 w-3" />
          Pending
        </>
      )}
    </span>
  )
})
StatusBadge.displayName = "StatusBadge"

const CashierBadge = memo(({ cashierName }: { cashierName: string }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-base px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      {cashierName}
    </span>
  )
})
CashierBadge.displayName = "CashierBadge"

// Memoized table row component
const PaymentRow = memo(({ payment, cashierName }: { payment: PaymentRecord, cashierName: string }) => {
  const router = useRouter()

  const handleViewPayment = useCallback(() => {
    if (payment.id) {
      router.push(`/pay/${payment.cashier_id}`)
    }
  }, [payment.cashier_id, router])

  const formatDate = useCallback((date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }, [])

  return (
    <TableRow className="bg-background hover:bg-secondary-background border-b border-border">
      <TableCell className="font-medium text-foreground font-mono text-sm">{payment.id}</TableCell>
      <TableCell className="text-foreground">${payment.amount_usd.toFixed(2)}</TableCell>
      <TableCell className="text-foreground">
        <CashierBadge cashierName={cashierName} />
      </TableCell>
      <TableCell className="text-foreground">
        <StatusBadge status={payment.status} />
      </TableCell>
      <TableCell className="text-foreground text-sm">{formatDate(payment.createdAt)}</TableCell>

      <TableCell className="text-foreground text-sm">
        <Button variant="noShadow" size="sm" onClick={handleViewPayment} className="gap-1">
          <ExternalLink className="h-3 w-3" />
          View
        </Button>
      </TableCell>
    </TableRow>
  )
})
PaymentRow.displayName = "PaymentRow"

export default function DashboardPage() {
  const [qrData, setQrData] = useState<string>("")
  const [paymentLink, setPaymentLink] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Payments history state
  const { payments: paymentsFromHook, walletAddress, isVerifying } = useMerchantVerification()
  const { cashiers } = useMerchant()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)
  const router = useRouter()

  const getCashierNameFromID = useCallback((cashierId: string) => {
    const cashier = cashiers.find((c) => c.uuid === cashierId)
    return cashier?.name ?? "Default Cashier"
  }, [cashiers])

  // Convert payments from hook to PaymentRecord format
  useEffect(() => {
    if (isVerifying) {
      setPaymentsLoading(true)
      return
    }

    if (paymentsFromHook && paymentsFromHook.length > 0) {
      const convertedPayments: PaymentRecord[] = paymentsFromHook.map((p: Payment) => ({
        id: p.id,
        cashier_id: p.cashierId,
        status: p.status,
        createdAt: p.createdAt,
        merchant_id: p.merchantId,
        amount_usd: p.amount
      }))
      setPayments(convertedPayments)
      setPaymentsLoading(false)
      setPaymentsError(null)
    } else if (walletAddress) {
      setPayments([])
      setPaymentsLoading(false)
      setPaymentsError(null)
    }
  }, [paymentsFromHook, walletAddress, isVerifying])

  useEffect(() => {
    const createPayment = async () => {
      try {
        setLoading(true)
        setError("")

        // Use your existing mock endpoint
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchant_id: "merchant01",
            amount_usd: 5
          })
        })

        if (!res.ok) {
          throw new Error(`Failed to create payment: ${res.status}`)
        }

        const data: PaymentResponse = await res.json()
        const link = data.qr_url // your /pay/pay_xxxxx link
        setPaymentLink(link)

        const qr = await QRCode.toDataURL(link)
        setQrData(qr)
      } catch (err) {
        console.error("Error creating payment:", err)
        setError("Failed to create payment. Check API or network connection.")
      } finally {
        setLoading(false)
      }
    }

    createPayment().catch(console.error)
  }, [])

  // Placeholder metrics data
  const metrics = [
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+12.5%",
      description: "from last month",
      icon: DollarSign
    },
    {
      title: "Active Payments",
      value: "234",
      change: "+8.2%",
      description: "from last month",
      icon: CreditCard
    },
    {
      title: "Growth Rate",
      value: "18.3%",
      change: "+2.1%",
      description: "from last month",
      icon: TrendingUp
    },
    {
      title: "Total Customers",
      value: "1,429",
      change: "+15.7%",
      description: "from last month",
      icon: Users
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-foreground/50 text-sm">
            Overview of your merchant account and sales performance
          </p>
        </div>
        <Button asChild variant="default" className="gap-2 shrink-0">
          <Link href="/dashboard/payments?create=true">
            <Plus className="h-4 w-4" />
            Create Payment
          </Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-foreground/50" />
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-foreground/50">
                <span className="text-green-600 font-medium">{metric.change}</span>{" "}
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>
                A list of your most recent payment transactions
              </CardDescription>
            </div>
            <Button variant="neutral" size="sm" asChild>
              <Link href="/dashboard/payments">
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
            </div>
          ) : paymentsError ? (
            <div className="py-12 text-center">
              <p className="text-red-500">{paymentsError}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-foreground/50 mb-4">No payments found</p>
              <Button asChild variant="default" size="sm">
                <Link href="/dashboard/payments?create=true">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Payment
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-base border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary-background hover:bg-secondary-background">
                    <TableHead className="text-foreground">Payment ID</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Cashier</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 5).map((payment) => (
                    <PaymentRow key={payment.id} payment={payment} cashierName={getCashierNameFromID(payment.cashier_id)} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
