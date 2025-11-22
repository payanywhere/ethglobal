import { ArrowDownToLine, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "../hooks/use-wallet-transactions"

interface TransactionHistoryProps {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  address?: string
}

export function TransactionHistory({
  transactions,
  loading,
  error,
  address
}: TransactionHistoryProps) {
  const viewOnExplorer = (hash: string, chainId: number) => {
    // Simple chain mapping - can be expanded
    const explorerUrls: Record<number, string> = {
      1: "https://etherscan.io",
      137: "https://polygonscan.com",
      42161: "https://arbiscan.io",
      8453: "https://basescan.org",
      10: "https://optimistic.etherscan.io"
    }

    const baseUrl = explorerUrls[chainId] || "https://etherscan.io"
    window.open(`${baseUrl}/tx/${hash}`, "_blank", "noopener,noreferrer")
  }

  if (loading && transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-foreground/50">No transactions found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((tx) => {
            const isReceive = tx.type === "receive"
            const timestamp = new Date(tx.timestamp * 1000)

            return (
              <div
                key={tx.hash}
                className="flex items-center gap-4 p-4 rounded-base border border-border bg-background hover:bg-secondary-background transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isReceive ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                  }`}
                >
                  {isReceive ? (
                    <ArrowDownToLine className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading font-semibold capitalize">{tx.type}</p>
                      <p className="text-sm text-foreground/50">
                        {formatDistanceToNow(timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-heading font-semibold ${
                          isReceive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isReceive ? "+" : "-"}
                        {tx.token
                          ? `${(Number(tx.value) / Math.pow(10, tx.token.decimals)).toFixed(6)} ${tx.token.symbol}`
                          : `${(Number(tx.value) / 1e18).toFixed(6)} ETH`}
                      </p>
                      <p className="text-sm text-foreground/50">
                        {tx.status === "pending" ? "Pending" : tx.status === "failed" ? "Failed" : "Confirmed"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="neutral"
                  size="sm"
                  onClick={() => viewOnExplorer(tx.hash, tx.chain_id)}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

