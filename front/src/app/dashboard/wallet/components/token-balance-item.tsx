import Image from "next/image"
import { memo } from "react"
import type { TokenBalance } from "@/services/dune-sim"
import { formatTokenAmount } from "@/services/dune-sim"

interface TokenBalanceItemProps {
  token: TokenBalance
  isARS: boolean
  dollarPrice: number
}

export const TokenBalanceItem = memo(function TokenBalanceItem({ token, isARS, dollarPrice }: TokenBalanceItemProps) {
  const formattedAmount = formatTokenAmount(token.amount, token.decimals)
  const value = isARS ? (Number(token.value_usd) * (dollarPrice ?? 0)) : token.value_usd || 0

  return (
    <div className="group relative p-4 rounded-base border border-border bg-background hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {token.token_metadata?.logo ? (
            <Image
              src={token.token_metadata.logo}
              alt={token.symbol}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center">
              <span className="text-base font-bold text-foreground/70">
                {token.symbol.slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-heading font-semibold text-base">{token.symbol}</p>
                {token.chain && (
                  <span className="text-xs font-medium text-foreground/50 bg-secondary-background px-2 py-0.5 rounded-full uppercase">
                    {token.chain}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/50 truncate">{token.name || token.symbol}</p>
            </div>

            {/* Amount and Value */}
            <div className="text-right flex-shrink-0">
              <p className="font-heading font-semibold text-base mb-1">{formattedAmount}</p>
              <p className="text-sm font-medium text-foreground/60">
                {isARS ? "$" : "ARS"}
                {value.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
