import { useCallback, useEffect, useRef, useState } from "react"
import { getFriendlyErrorMessage } from "@/lib/error-utils"
import { type ActivityItem, fetchWalletActivity } from "@/services/dune-sim-activity"

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  token?: {
    symbol: string
    name: string
    decimals: number
  }
  timestamp: number
  status: "success" | "pending" | "failed"
  chain_id: number
  type: "send" | "receive"
}

/**
 * Check if a token symbol contains suspicious unicode characters
 */
function isLikelySpamToken(symbol: string, name: string): boolean {
  if (!symbol && !name) return false

  const textToCheck = `${symbol} ${name}`.toLowerCase()

  // Check for common spam patterns
  const spamPatterns = [
    /[\u0400-\u04FF]/, // Cyrillic characters (used in fake USDT, etc.)
    /[\u0100-\u017F]/, // Latin Extended-A (used for lookalike characters)
    /[\u0180-\u024F]/, // Latin Extended-B
    /[\u1E00-\u1EFF]/, // Latin Extended Additional
    /[\uFF00-\uFFEF]/, // Fullwidth forms
    /visit|claim|reward|bonus|airdrop|free|gift/i, // Common spam words
    /\$|💰|🎁|🚀|⚡/ // Common spam emojis
  ]

  return spamPatterns.some((pattern) => pattern.test(textToCheck))
}

/**
 * Check if transaction is likely spam based on multiple factors
 */
function isLikelySpamTransaction(item: ActivityItem): boolean {
  // Filter approve transactions with 0 value (common spam pattern)
  if (item.type === "approve" && (!item.value || item.value === "0")) {
    return true
  }

  // Filter ERC1155 NFT transfers (often spam)
  if (item.asset_type === "erc1155") {
    return true
  }

  // Check token metadata for spam indicators
  if (item.token_metadata) {
    const symbol = item.token_metadata.symbol || ""
    const name = item.token_metadata.name || ""

    // Filter tokens with suspicious unicode characters
    if (isLikelySpamToken(symbol, name)) {
      return true
    }

    // Allow DeFi tokens (aTokens, cTokens, etc.) even without logo
    const isDeFiToken =
      symbol.toLowerCase().startsWith("a") ||
      symbol.toLowerCase().startsWith("c") ||
      symbol.toLowerCase().includes("lp") ||
      name.toLowerCase().includes("aave") ||
      name.toLowerCase().includes("compound") ||
      name.toLowerCase().includes("uniswap")

    // Filter tokens without BOTH decimals AND logo (likely fake)
    // But allow DeFi tokens
    if (
      item.asset_type === "erc20" &&
      !item.token_metadata.decimals &&
      !item.token_metadata.logo &&
      !item.value_usd &&
      !isDeFiToken
    ) {
      return true
    }
  }

  return false
}

/**
 * Convert Dune Sim ActivityItem to Transaction format
 */
function activityToTransaction(item: ActivityItem, walletAddress: string): Transaction | null {
  // Filter out spam transactions
  if (isLikelySpamTransaction(item)) {
    return null
  }

  // Filter out transactions with no value at all
  const hasValue = item.value && BigInt(item.value) > 0
  const hasUsdValue = item.value_usd && item.value_usd > 0

  // Skip if neither value nor USD value exists
  if (!hasValue && !hasUsdValue) {
    return null
  }

  const timestamp = Math.floor(new Date(item.block_time).getTime() / 1000) // Convert to seconds
  const isReceive =
    item.type === "receive" || item.to?.toLowerCase() === walletAddress.toLowerCase()
  const type = isReceive ? "receive" : "send"

  // Determine decimals - use metadata if available, otherwise default to 18 for ERC20
  const decimals =
    item.token_metadata?.decimals ||
    (item.asset_type === "erc20" ? 18 : item.asset_type === "native" ? 18 : 0)

  return {
    hash: item.tx_hash,
    from: item.from || "",
    to: item.to || "",
    value: item.value || "0",
    token: item.token_metadata
      ? {
          symbol: item.token_metadata.symbol || "UNKNOWN",
          name: item.token_metadata.name || "Unknown Token",
          decimals
        }
      : undefined,
    timestamp,
    status: "success", // Dune Sim only returns confirmed transactions
    chain_id: item.chain_id,
    type
  }
}

export function useWalletTransactions(address: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isLoadingRef = useRef(false)
  const lastAddressRef = useRef<string | null>(null)

  const loadTransactions = useCallback(async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return
    }

    // Skip if address hasn't changed
    if (address === lastAddressRef.current && lastAddressRef.current !== null) {
      return
    }

    if (!address) {
      setTransactions([])
      lastAddressRef.current = null
      return
    }

    try {
      isLoadingRef.current = true
      lastAddressRef.current = address
      setLoading(true)
      setError(null)

      const response = await fetchWalletActivity(address, {
        limit: 50 // Get last 50 transactions
      })

      // Convert activity items to transactions and filter out nulls
      const txs = response.activity
        .map((item) => activityToTransaction(item, address))
        .filter((tx): tx is Transaction => tx !== null)

      setTransactions(txs)
    } catch (err) {
      console.error("Error loading transactions:", err)
      const friendlyError = getFriendlyErrorMessage(err)
      setError(friendlyError)
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [address])

  useEffect(() => {
    // Only load if address changed
    if (address !== lastAddressRef.current) {
      loadTransactions()
    }
  }, [address, loadTransactions])

  return {
    transactions,
    loading,
    error,
    refetch: loadTransactions
  }
}
