"use client"

import { CheckCircle2, Clock, ExternalLink, Loader2, Plus } from "lucide-react"
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
import { PaymentFormOverlay } from "./payment-form-overlay"

interface PaymentRecord {
  payment_id: string
  merchant_id: string
  amount_usd: number
  status: "pending" | "confirmed"
  qr_url?: string
}

// Memoized status badge component
const StatusBadge = memo(({ status }: { status: PaymentRecord["status"] }) => {
  const isConfirmed = status === "confirmed"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-base px-2 py-1 text-xs font-medium",
        isConfirmed
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      )}
    >
      {isConfirmed ? (
        <>
          <CheckCircle2 className="h-3 w-3" />
          Confirmed
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
    if (payment.qr_url) {
      window.open(payment.qr_url, "_blank", "noopener,noreferrer")
    }
  }, [payment.qr_url])

  return (
    <TableRow className="bg-background hover:bg-secondary-background border-b border-border">
      <TableCell className="font-medium text-foreground">{payment.payment_id}</TableCell>
      <TableCell className="text-foreground">${payment.amount_usd.toFixed(2)}</TableCell>
      <TableCell className="text-foreground">
        <StatusBadge status={payment.status} />
      </TableCell>
      <TableCell className="text-foreground">
        {payment.qr_url ? (
          <Button variant="noShadow" size="sm" onClick={handleViewPayment} className="gap-1">
            <ExternalLink className="h-3 w-3" />
            View
          </Button>
        ) : (
          <span className="text-foreground/50 text-sm">N/A</span>
        )}
      </TableCell>
    </TableRow>
  )
})
PaymentRow.displayName = "PaymentRow"

function PaymentsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if form should be open from URL params
  const isFormOpen = useMemo(() => searchParams.get("create") === "true", [searchParams])

  // Memoized merchant ID
  const merchantId = useMemo(() => "merchant01", [])

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/payment?merchant_id=${merchantId}`)

      if (!res.ok) {
        throw new Error(`Failed to fetch payments: ${res.status}`)
      }

      const data = await res.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching payments:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch payments")
    } finally {
      setLoading(false)
    }
  }, [merchantId])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  // Handle form close
  const handleFormClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("create")
    router.replace(`/dashboard/payments?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Handle form success - refresh payments and close form
  const handleFormSuccess = useCallback(() => {
    fetchPayments()
    handleFormClose()
  }, [fetchPayments, handleFormClose])

  // Handle create button click
  const handleCreateClick = useCallback(() => {
    router.push("/dashboard/payments?create=true", { scroll: false })
  }, [router])

  // Memoized stats
  const stats = useMemo(() => {
    const total = payments.length
    const confirmed = payments.filter((p) => p.status === "confirmed").length
    const pending = total - confirmed
    const totalAmount = payments.reduce((sum, p) => sum + p.amount_usd, 0)
    const confirmedAmount = payments
      .filter((p) => p.status === "confirmed")
      .reduce((sum, p) => sum + p.amount_usd, 0)

    return {
      total,
      confirmed,
      pending,
      totalAmount,
      confirmedAmount
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
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
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
            <div className="text-2xl font-bold">${stats.confirmedAmount.toFixed(2)}</div>
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
              <Button onClick={fetchPayments} variant="neutral" className="mt-4" size="sm">
                Retry
              </Button>
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
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <PaymentRow key={payment.payment_id} payment={payment} />
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
