"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Wallet</h1>
        <p className="text-foreground/50 mt-1">
          Manage your crypto wallet and transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Management</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/50">Wallet features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

