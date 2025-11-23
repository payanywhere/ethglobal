"use client"

import { CreditCard, DollarSign, Plus, TrendingUp, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import QRCode from "qrcode"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentResponse {
  payment_id: string
  qr_url: string
  status: string
}

export default function DashboardPage() {
  const [qrData, setQrData] = useState<string>("")
  const [paymentLink, setPaymentLink] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

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

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle>New Payment</CardTitle>
          <CardDescription>
            Each time you open this dashboard, a new mock payment is created and linked to the demo
            checkout page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-foreground/50">Generating payment...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && qrData && (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Image
                alt="payment-qr"
                src={qrData}
                width={240}
                height={240}
                className="border-2 border-border rounded-base"
              />
              <div className="flex-1">
                <p className="font-medium mb-2">Payment link:</p>
                <a
                  href={paymentLink}
                  className="text-blue-600 hover:underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {paymentLink}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
