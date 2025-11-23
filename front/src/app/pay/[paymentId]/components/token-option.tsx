import Image from "next/image"
import { memo } from "react"
import { formatTokenAmount, type TokenBalance } from "@/services/dune-sim"

interface TokenOptionProps {
  token: TokenBalance
  formattedAmount: string
  isSelected: boolean
  paymentAmount: number
  onSelect: (token: TokenBalance) => void
}

export const TokenOption = memo(function TokenOption({
  token,
  formattedAmount,
  isSelected,
  paymentAmount,
  onSelect
}: TokenOptionProps) {
  const balance = formatTokenAmount(token.amount, token.decimals)
  const isInsufficient = (token.value_usd || 0) < paymentAmount
  const networkName = token.chain === "base" ? "Base" : token.chain === "ethereum" ? "Ethereum" : token.chain

  return (
    <button
      type="button"
      onClick={() => onSelect(token)}
      className={`w-full p-3 rounded-base border-2 transition-all ${
        isSelected
          ? "border-[#00D696] bg-[#00D696]/10"
          : "border-border bg-secondary-background hover:border-foreground/20"
      } ${isInsufficient ? "opacity-75" : ""}`}
    >
      <div className="flex items-center gap-3">
        {token.token_metadata?.logo ? (
          <Image
            src={token.token_metadata.logo}
            alt={token.symbol}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
            <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
          </div>
        )}
        <div className="flex-1 text-left">
          <div className="flex justify-between items-start">
            <p className="font-heading font-semibold text-sm">
              {formattedAmount} {token.symbol}
              <span className="ml-2 text-[10px] text-foreground/50 border border-border px-1 rounded bg-background">
                {networkName}
              </span>
            </p>
            {isInsufficient && (
              <span className="text-[10px] text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                Low Balance
              </span>
            )}
          </div>
          <div className="flex justify-between text-xs text-foreground/50">
            <span>≈ ${paymentAmount.toFixed(2)}</span>
            <span className={isInsufficient ? "text-red-500/80" : ""}>
              Bal: {balance}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
})
