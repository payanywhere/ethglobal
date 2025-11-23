"use client"

import { CheckCircle2, Clock, ExternalLink, Loader2, Plus, XCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { memo, Suspense, useCallback, useEffect, useMemo, useState } from "react"
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
import { cn } from "@/lib/utils"
import { useMerchantVerification } from "@/hooks/use-merchant-verification"
import { PaymentFormOverlay } from "./payment-form-overlay"
import type { Payment } from "@/services/api"

interface PaymentRecord {
  id: string
  cashier_id: string
  merchant_id: string
  amount_usd: number
  status: "pending" | "consolidated" | "failed"
  createdAt: Date | string
  // qr_url?: string // generated with id
}

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: PaymentRecord["status"] }) => {
  const isConsolidated = status === "consolidated"
  const isFailed = status === "failed"
  const isPending = status === "pending"

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

// Memoized table row component
const PaymentRow = memo(({ payment }: { payment: PaymentRecord }) => {
  const handleViewPayment = useCallback(() => {
    if (payment.id) {
      window.open(payment.id, "_blank", "noopener,noreferrer")
    }
  }, [payment.id])

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
      <TableCell className="font-medium text-foreground font-mono text-sm">
        {payment.id}
      </TableCell>
      <TableCell className="text-foreground">${payment.amount_usd.toFixed(2)}</TableCell>
      <TableCell className="text-foreground">
        <StatusBadge status={payment.status} />
      </TableCell>
      <TableCell className="text-foreground text-sm">

      {formatDate(payment.createdAt)}
      </TableCell>

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

function PaymentsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { payments: paymentsFromHook, walletAddress, isVerifying } = useMerchantVerification()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if form should be open from URL params
  const isFormOpen = useMemo(() => searchParams.get("create") === "true", [searchParams])

  // Convert payments from hook to PaymentRecord format
  useEffect(() => {
    if (isVerifying) {
      setLoading(true)
      return
    }

    if (paymentsFromHook && paymentsFromHook.length > 0) {
      const convertedPayments: PaymentRecord[] = paymentsFromHook.map((p: Payment) => ({
        id: p.id,
        cashier_id: p.cashierId,
        status: p.status,
        createdAt: p.createdAt,
        merchant_id: p.merchantId,
        amount_usd: p.amount,
      }))
      setPayments(convertedPayments)
      setLoading(false)
      setError(null)
    } else if (walletAddress) {
      setPayments([])
      setLoading(false)
      setError(null)
    }
  }, [paymentsFromHook, walletAddress, isVerifying])

  // Memoized merchant ID 
  const merchantId = useMemo(() => "merchant01", [])

  // Handle form close
  const handleFormClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("create")
    router.replace(`/dashboard/payments?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Handle form success - close form (payments will refresh automatically from hook)
  const handleFormSuccess = useCallback(() => {
    handleFormClose()
    // Los payments se actualizarán automáticamente desde el hook cuando se recargue la página
    window.location.reload()
  }, [handleFormClose])

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    router.push("/dashboard/payments?create=true", { scroll: false })
  }, [router])

  // Memoized stats
  const stats = useMemo(() => {
    const total = payments.length
    const consolidated = payments.filter((p) => p.status === "consolidated").length
    const pending = payments.filter((p) => p.status === "pending").length
    const failed = payments.filter((p) => p.status === "failed").length
    const totalAmount = payments.reduce((sum, p) => sum + p.amount_usd, 0)
    const consolidatedAmount = payments
      .filter((p) => p.status === "consolidated")
      .reduce((sum, p) => sum + p.amount_usd, 0)

    return {
      total,
      consolidated,
      pending,
      failed,
      totalAmount,
      consolidatedAmount
    }
  }, [payments])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">Payments</h1>
          <p className="text-foreground/50 text-sm">
            Manage and track all your payment transactions
          </p>
        </div>
        <Button onClick={handleCreateClick} variant="default" className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Consolidated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.consolidated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.consolidatedAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            A list of all your payment transactions and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-foreground/50 mb-4">No payments found</p>
              <Button onClick={handleCreateClick} variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Payment
              </Button>
            </div>
          ) : (
            <div className="rounded-base border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary-background hover:bg-secondary-background">
                    <TableHead className="text-foreground">Payment ID</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <PaymentRow key={payment.id} payment={payment} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form Overlay */}
      <PaymentFormOverlay
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        merchantId={merchantId}
      />
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
        </div>
      }
    >
      <PaymentsPageContent />
    </Suspense>
  )
}
