import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TokenBalance } from "@/services/dune-sim"
import { TokenBalanceItem } from "./token-balance-item"

interface TokenBalancesListProps {
  tokens: TokenBalance[]
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

function TokenBalanceSkeleton() {
  return (
    <div className="p-4 rounded-base border border-border bg-background">
      <div className="flex items-center gap-4">
        {/* Logo skeleton */}
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />

        {/* Token Info skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Amount and Value skeleton */}
            <div className="text-right flex-shrink-0">
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TokenBalancesList({ tokens, loading, error, onRefresh }: TokenBalancesListProps) {
  if (loading && tokens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <TokenBalanceSkeleton key={i} />
            ))}
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
          {loading && tokens.length > 0 ? (
            <>
              {tokens.map((token) => (
                <TokenBalanceItem key={`${token.chain_id}-${token.address}`} token={token} />
              ))}
              {/* Show a few skeletons at the end while refreshing */}
              {[...Array(2)].map((_, i) => (
                <TokenBalanceSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          ) : (
            tokens.map((token) => (
              <TokenBalanceItem key={`${token.chain_id}-${token.address}`} token={token} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
