"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Analytics</h1>
        <p className="text-foreground/50 mt-1">
          View detailed analytics and insights for your business
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/50">Analytics features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  )
}

