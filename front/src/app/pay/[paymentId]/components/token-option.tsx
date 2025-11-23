import Image from "next/image"
import { memo } from "react"
import type { TokenBalance } from "@/services/dune-sim"

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
  return (
    <button
      type="button"
      onClick={() => onSelect(token)}
      className={`w-full p-3 rounded-base border-2 transition-all ${
        isSelected
          ? "border-[#00D696] bg-[#00D696]/10"
          : "border-border bg-secondary-background hover:border-foreground/20"
      }`}
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
          <p className="font-heading font-semibold text-sm">
            {formattedAmount} {token.symbol}
          </p>
          <p className="text-xs text-foreground/50">≈ ${paymentAmount.toFixed(2)}</p>
        </div>
      </div>
    </button>
  )
})
