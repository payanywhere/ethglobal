import Image from "next/image"
import { memo } from "react"
import type { TokenBalance } from "@/services/dune-sim"
import { formatTokenAmount } from "@/services/dune-sim"

interface TokenBalanceItemProps {
  token: TokenBalance
}

export const TokenBalanceItem = memo(function TokenBalanceItem({ token }: TokenBalanceItemProps) {
  const formattedAmount = formatTokenAmount(token.amount, token.decimals)
  const valueUSD = token.value_usd || 0

  return (
    <div className="flex items-center gap-4 p-4 rounded-base border border-border bg-background hover:bg-secondary-background transition-colors">
      <div className="flex-shrink-0">
        {token.token_metadata?.logo ? (
          <Image
            src={token.token_metadata.logo}
            alt={token.symbol}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
            <span className="text-sm font-bold">{token.symbol.slice(0, 2)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading font-semibold truncate">{token.symbol}</p>
            <p className="text-sm text-foreground/50 truncate">{token.name || token.symbol}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-heading font-semibold">{formattedAmount}</p>
            <p className="text-sm text-foreground/50">
              ${valueUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        {token.chain && (
          <div className="mt-2">
            <span className="text-xs text-foreground/50 bg-secondary-background px-2 py-1 rounded">
              {token.chain}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

