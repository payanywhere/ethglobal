import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { TokenBalance } from "@/services/dune-sim"
import { TokenBalanceItem } from "./token-balance-item"

interface TokenBalancesListProps {
  tokens: TokenBalance[]
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

export function TokenBalancesList({ tokens, loading, error, onRefresh }: TokenBalancesListProps) {
  if (loading && tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
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
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center space-y-4">
            <p className="text-red-500">{error}</p>
            {onRefresh && (
              <Button variant="neutral" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-foreground/50 mb-4">No tokens found</p>
            {onRefresh && (
              <Button variant="neutral" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Balances</CardTitle>
          {onRefresh && (
            <Button variant="neutral" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {tokens.map((token) => (
            <TokenBalanceItem key={`${token.chain_id}-${token.address}`} token={token} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

