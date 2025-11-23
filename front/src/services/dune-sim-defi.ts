/**
 * Dune Sim DeFi Positions API Service
 * Documentation: https://docs.sim.dune.com/evm/defi-positions
 */

import { isDefiSupportedChain } from "@/constants/chains"
import type { TokenBalance } from "./dune-sim"

export interface DefiPosition {
  type: "Erc4626" | "Tokenized" | "UniswapV2" | "Nft" | "NftV4"
  chain_id: number
  usd_value: number
  logo?: string | null

  // Common fields
  token_type?: string // For Tokenized positions (e.g., "AtokenV2")
  token?: string
  token_name?: string
  token_symbol?: string
  calculated_balance?: number
  price_in_usd?: number

  // ERC4626 specific
  underlying_token?: string
  underlying_token_name?: string
  underlying_token_symbol?: string
  underlying_token_decimals?: number

  // UniswapV2/AMM specific
  protocol?: string
  pool?: string
  token0?: string
  token0_name?: string
  token0_symbol?: string
  token0_decimals?: number
  token0_price?: number
  token1?: string
  token1_name?: string
  token1_symbol?: string
  token1_decimals?: number
  token1_price?: number
  lp_balance?: string

  // NFT positions
  positions?: Array<{
    tick_lower: number
    tick_upper: number
    token_id: string
    token0_price: number
    token0_holdings?: number
    token0_rewards?: number
    token1_price: number
    token1_holdings?: number
    token1_rewards?: number
  }>
}

export interface DefiAggregations {
  total_usd_value: number
  total_by_chain?: Record<string, number>
}

export interface DefiPositionsResponse {
  positions: DefiPosition[]
  aggregations?: DefiAggregations
  request_time?: string
  response_time?: string
}

export interface FetchDefiPositionsOptions {
  chainIds?: string // e.g., "1,56,137"
}

/**
 * Fetch DeFi positions via our backend API
 */
export async function fetchDefiPositions(
  address: string,
  options: FetchDefiPositionsOptions = {}
): Promise<DefiPositionsResponse> {
  const params = new URLSearchParams({
    address
  })

  if (options.chainIds) {
    params.append("chain_ids", options.chainIds)
  }

  const url = `/api/defi-positions?${params.toString()}`

  const response = await fetch(url, {
    cache: "no-store" // Always get fresh positions
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error || `Failed to fetch DeFi positions: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  return data
}

/**
 * Check if a position is an Aave token
 */
export function isAaveToken(position: DefiPosition): boolean {
  if (position.type !== "Tokenized") return false

  const tokenType = position.token_type?.toLowerCase() || ""
  const symbol = position.token_symbol?.toLowerCase() || ""

  return (
    tokenType.includes("atoken") ||
    (symbol.startsWith("a") &&
      (symbol.includes("weth") ||
        symbol.includes("wbtc") ||
        symbol.includes("usdc") ||
        symbol.includes("usdt") ||
        symbol.includes("dai")))
  )
}

/**
 * Format position name for display
 */
export function formatPositionName(position: DefiPosition): string {
  switch (position.type) {
    case "Erc4626":
      return `${position.token_symbol || "Vault"} (${position.underlying_token_symbol || "Unknown"})`

    case "Tokenized":
      if (isAaveToken(position)) {
        return `Aave ${position.token_symbol?.replace(/^a/, "") || "Token"}`
      }
      return position.token_symbol || "Lending Position"

    case "UniswapV2":
      return `${position.token0_symbol || "?"}-${position.token1_symbol || "?"} LP`

    case "Nft":
    case "NftV4":
      return `${position.token0_symbol || "?"}-${position.token1_symbol || "?"} V3 Position`

    default:
      return "DeFi Position"
  }
}

/**
 * Get chain name from chain ID
 * @deprecated Use getChainName from @/constants/chains instead
 */
export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    56: "BSC",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base"
  }
  return chains[chainId] || `Chain ${chainId}`
}

/**
 * Get the underlying token symbol from Aave token symbol
 * e.g., "aBnbUSDT" -> "USDT", "aWETH" -> "WETH", "aPolUSDCn" -> "USDC"
 */
export function getUnderlyingSymbolFromAaveToken(aaveSymbol: string): string | null {
  const symbol = aaveSymbol.toLowerCase()

  // Remove common Aave prefixes
  if (symbol.startsWith("abnb")) {
    let underlying = symbol.substring(4) // "aBnbUSDT" -> "usdt"
    // Remove trailing "n" if present (native token indicator)
    if (underlying.endsWith("n")) {
      underlying = underlying.slice(0, -1)
    }
    return underlying.toUpperCase() // "USDT"
  }
  if (symbol.startsWith("apol")) {
    let underlying = symbol.substring(4) // "aPolUSDCn" -> "usdcn"
    // Remove trailing "n" if present (native token indicator on Polygon)
    if (underlying.endsWith("n")) {
      underlying = underlying.slice(0, -1)
    }
    return underlying.toUpperCase() // "USDC"
  }
  if (symbol.startsWith("a")) {
    let underlying = symbol.substring(1) // "aWETH" -> "weth", "aUSDT" -> "usdt"
    // Remove trailing "n" if present (native token indicator)
    if (underlying.endsWith("n")) {
      underlying = underlying.slice(0, -1)
    }
    return underlying.toUpperCase() // "WETH", "USDT"
  }

  return null
}

/**
 * Fetch Aave tokens from regular balances for chains not supported by DeFi Positions API
 * This ensures we still show Aave positions even on chains without full DeFi support
 */
export async function fetchAaveTokensFromBalances(
  balances: TokenBalance[]
): Promise<TokenBalance[]> {
  return balances.filter((token) => {
    // Only include Aave tokens from non-DeFi-supported chains
    if (isDefiSupportedChain(token.chain_id)) {
      return false
    }

    const symbol = token.symbol?.toLowerCase() || ""
    const name = token.name?.toLowerCase() || ""

    // Check if it's an Aave token
    return (
      (symbol.startsWith("a") &&
        (symbol.includes("weth") ||
          symbol.includes("wbtc") ||
          symbol.includes("usdc") ||
          symbol.includes("usdt") ||
          symbol.includes("dai") ||
          symbol.includes("link") ||
          symbol.includes("aave") ||
          symbol.includes("matic") ||
          symbol.includes("avax") ||
          symbol.includes("bnb"))) ||
      name.includes("aave interest bearing") ||
      name.includes("atoken") ||
      (name.toLowerCase().includes("aave") && name.toLowerCase().includes("usdt"))
    )
  })
}
