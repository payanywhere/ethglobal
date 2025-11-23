import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TokenBalance } from "@/services/dune-sim"
import { calculateTokenAmount } from "@/services/dune-sim"
import { TokenOption } from "./token-option"

interface TokenListProps {
  tokens: TokenBalance[]
  selectedToken: TokenBalance | null
  paymentAmount: number
  loading: boolean
  onSelect: (token: TokenBalance) => void
  onRefresh: () => void
}

export function TokenList({
  tokens,
  selectedToken,
  paymentAmount,
  loading,
  onSelect,
  onRefresh
}: TokenListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/50" />
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className="p-4 rounded-base border border-border bg-secondary-background text-center space-y-3">
        <p className="text-sm text-foreground/50">
          No tokens with sufficient balance found.
          <br />
          Required: ${paymentAmount.toFixed(2)} USD
        </p>
        <Button variant="neutral" size="sm" onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Balances
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {tokens.slice(0, 3).map((token) => {
        const { formattedAmount } = calculateTokenAmount(token, paymentAmount)
        const isSelected = selectedToken?.address === token.address

        return (
          <TokenOption
            key={`${token.chain_id}-${token.address}`}
            token={token}
            formattedAmount={formattedAmount}
            isSelected={isSelected}
            paymentAmount={paymentAmount}
            onSelect={onSelect}
          />
        )
      })}
    </div>
  )
}
