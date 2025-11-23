import { format } from "date-fns"
import { ArrowDownToLine, ArrowUpRight, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  address: _address
}: TransactionHistoryProps) {
  const viewOnExplorer = (hash: string, chainId: number) => {
    // Complete chain mapping with all major networks
    const explorerUrls: Record<number, string> = {
      1: "https://etherscan.io",
      56: "https://bscscan.com",
      137: "https://polygonscan.com",
      42161: "https://arbiscan.io",
      8453: "https://basescan.org",
      10: "https://optimistic.etherscan.io",
      43114: "https://snowtrace.io",
      250: "https://ftmscan.com",
      100: "https://gnosisscan.io",
      42220: "https://celoscan.io"
    }

    const baseUrl = explorerUrls[chainId] || "https://etherscan.io"
    window.open(`${baseUrl}/tx/${hash}`, "_blank", "noopener,noreferrer")
  }

  const getChainName = (chainId: number): string => {
    const chains: Record<number, string> = {
      1: "Ethereum",
      56: "BSC",
      137: "Polygon",
      42161: "Arbitrum",
      10: "Optimism",
      8453: "Base",
      43114: "Avalanche",
      250: "Fantom",
      100: "Gnosis",
      42220: "Celo"
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    // If less than 24 hours ago, show relative time
    if (diffInHours < 24) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      if (diffInMinutes < 1) return "Just now"
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      return `${Math.floor(diffInHours)}h ago`
    }

    // If less than 7 days ago, show "X days ago"
    if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24)
      return `${days}d ago`
    }

    // Otherwise show formatted date
    return format(date, "MMM d, yyyy")
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
            const formattedValue = tx.token
              ? (Number(tx.value) / 10 ** tx.token.decimals).toFixed(6)
              : (Number(tx.value) / 1e18).toFixed(6)
            const symbol = tx.token?.symbol || "ETH"

            return (
              <div
                key={tx.id}
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
                        {formatDate(tx.timestamp)} · {getChainName(tx.chain_id)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-heading font-semibold ${
                          isReceive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isReceive ? "+" : "-"}
                        {formattedValue} {symbol}
                      </p>
                      <p className="text-sm text-foreground/50">
                        {tx.status === "pending"
                          ? "Pending"
                          : tx.status === "failed"
                            ? "Failed"
                            : "Confirmed"}
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
