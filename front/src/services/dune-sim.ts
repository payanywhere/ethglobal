import { parseUnits } from "viem"

/**
 * Dune Sim API Service
 * Documentation: https://docs.sim.dune.com/evm/balances
 */

export interface TokenBalance {
  chain: string
  chain_id: number
  address: string
  amount: string
  symbol: string
  name: string
  decimals: number
  price_usd: number
  value_usd: number
  pool_size?: number
  low_liquidity?: boolean
  token_metadata?: {
    logo?: string
    url?: string
  }
}

export interface BalancesResponse {
  wallet_address: string
  balances: TokenBalance[]
  next_offset?: string
  request_time: string
  response_time: string
  errors?: {
    error_message?: string
    token_errors?: Array<{
      chain_id: number
      address: string
      description?: string
    }>
  }
}

export interface FetchBalancesOptions {
  chainIds?: string // e.g., "1,8543" or "mainnet,testnet"
  filters?: "erc20" | "native"
  metadata?: string[] // e.g., ["logo", "url", "pools"]
  excludeSpamTokens?: boolean
  limit?: number
}

/**
 * Fetch token balances for a wallet address via our backend API
 * This ensures the Dune Sim API key is kept secure on the server
 */
export async function fetchWalletBalances(
  address: string,
  options: FetchBalancesOptions = {}
): Promise<BalancesResponse> {
  const params = new URLSearchParams({
    address
  })

  if (options.chainIds) {
    params.append("chain_ids", options.chainIds)
  }

  if (options.filters) {
    params.append("filters", options.filters)
  }

  if (options.metadata && options.metadata.length > 0) {
    params.append("metadata", options.metadata.join(","))
  }

  if (options.excludeSpamTokens !== undefined) {
    params.append("exclude_spam_tokens", String(options.excludeSpamTokens))
  }

  if (options.limit) {
    params.append("limit", String(Math.min(options.limit, 1000)))
  }

  const url = `/api/balances?${params.toString()}`

  const response = await fetch(url, {
    cache: "no-store" // Always get fresh balances
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error || `Failed to fetch balances: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  return data
}

/**
 * Filter tokens that have sufficient balance for a given payment amount (in USD)
 */
export function filterTokensWithSufficientBalance(
  balances: TokenBalance[],
  requiredAmountUSD: number
): TokenBalance[] {
  return balances.filter((token) => {
    // Calculate the token's value in USD
    const tokenValueUSD = token.value_usd || 0

    // Filter out tokens with insufficient balance
    return tokenValueUSD >= requiredAmountUSD
  })
}

/**
 * Calculate the amount of tokens needed for a specific USD value
 */
export function calculateTokenAmount(
  token: TokenBalance,
  amountUSD: number
): { amount: string; formattedAmount: string } {
  if (!token.price_usd || token.price_usd === 0) {
    return { amount: "0", formattedAmount: "0" }
  }

  // Calculate how many tokens we need
  const tokensNeeded = amountUSD / token.price_usd

  // Format with appropriate decimals
  const formattedAmount = tokensNeeded.toFixed(6)

  // Convert to smallest unit (considering decimals)
  const amount = (tokensNeeded * 10 ** token.decimals).toString()

  return { amount, formattedAmount }
}

/**
 * Format token amount from smallest unit to human-readable format
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  const value = Number(amount) / 10 ** decimals

  // Format large numbers with commas
  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })
  }

  // Format smaller numbers with more precision
  if (value >= 1) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 2
    })
  }

  // Format very small numbers with more precision
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0
  })
}

/**
 * Convert a USD amount into smallest token units as bigint
 */
export function getTokenAmountInSmallestUnit(
  token: TokenBalance,
  amountUSD: number,
  precision = 8
): bigint {
  if (!token.price_usd || token.price_usd === 0) {
    return BigInt(0)
  }

  const decimals = typeof token.decimals === "number" ? token.decimals : 18
  const tokensNeeded = amountUSD / token.price_usd

  if (!Number.isFinite(tokensNeeded) || tokensNeeded <= 0) {
    return BigInt(0)
  }

  const decimalsToUse = Math.min(decimals, precision)
  const tokensNeededStr = tokensNeeded.toFixed(decimalsToUse)

  return parseUnits(tokensNeededStr, decimals)
}