import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentStatusProps {
  status: "loading" | "not-found" | "confirmed"
}

export function PaymentStatus({ status }: PaymentStatusProps) {
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 animate-spin mx-auto text-foreground/50 border-4 border-foreground/20 border-t-foreground rounded-full" />
          <p className="text-foreground/70">Loading payment details...</p>
        </div>
      </main>
    )
  }

  if (status === "not-found") {
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
