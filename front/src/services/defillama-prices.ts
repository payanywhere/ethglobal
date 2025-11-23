/**
 * DeFiLlama Prices API Service
 * Documentation: https://defillama.com/docs/api
 * No authentication required
 */

import { getChainName } from "@/constants/chains"

export interface DeFiLlamaPrice {
  decimals: number
  price: number
  symbol: string
  timestamp: number
  confidence: number
}

export interface DeFiLlamaPricesResponse {
  coins: Record<string, DeFiLlamaPrice>
}

/**
 * Get chain prefix for DeFiLlama API
 * Maps chain IDs to DeFiLlama chain identifiers
 */
function getChainPrefix(chainId: number): string {
  const chainMap: Record<number, string> = {
    1: "ethereum",
    56: "bsc",
    137: "polygon",
    42161: "arbitrum",
    10: "optimism",
    8453: "base",
    43114: "avax",
    250: "fantom",
    100: "xdai",
    42220: "celo",
    // DeFi-supported chains
    480: "world",
    34443: "mode",
    57073: "ink",
    60808: "bob",
    84532: "base", // base_sepolia uses base prefix
    7777777: "zora",
    360: "shape",
    1868: "soneium",
    130: "unichain"
  }
  return chainMap[chainId] || getChainName(chainId).toLowerCase()
}

/**
 * Fetch token prices from DeFiLlama
 * @param tokens Array of { chainId, address } objects
 * @returns Map of "chainId:address" to price info
 */
export async function fetchTokenPrices(
  tokens: Array<{ chainId: number; address: string }>
): Promise<Map<string, DeFiLlamaPrice>> {
  if (tokens.length === 0) {
    return new Map()
  }

  // Build coin identifiers in format "chain:address"
  const coinIds = tokens
    .map(({ chainId, address }) => {
      // Skip native tokens (0x0000...)
      if (address === "0x0000000000000000000000000000000000000000") {
        return null
      }
      const chain = getChainPrefix(chainId)
      return `${chain}:${address.toLowerCase()}`
    })
    .filter((id): id is string => id !== null)

  if (coinIds.length === 0) {
    return new Map()
  }

  // DeFiLlama supports batch requests with comma-separated coin IDs
  const coinsParam = coinIds.join(",")
  const url = `https://coins.llama.fi/prices/current/${coinsParam}`

  console.log(`DeFiLlama request: ${coinIds.length} tokens`)
  console.log(`URL: ${url.substring(0, 150)}...`)

  try {
    const response = await fetch(url, {
      cache: "no-store", // Always get fresh prices
      headers: {
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      console.error("DeFiLlama API error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      return new Map()
    }

    const data: DeFiLlamaPricesResponse = await response.json()

    // Convert to Map for easy lookup
    const priceMap = new Map<string, DeFiLlamaPrice>()
    for (const [coinId, priceData] of Object.entries(data.coins)) {
      priceMap.set(coinId, priceData)
      console.log(`DeFiLlama price: ${coinId} = $${priceData.price}`)
    }

    return priceMap
  } catch (error) {
    console.error("Error fetching prices from DeFiLlama:", error)
    return new Map()
  }
}

/**
 * Fetch price for a single token
 */
export async function fetchTokenPrice(
  chainId: number,
  address: string
): Promise<DeFiLlamaPrice | null> {
  const prices = await fetchTokenPrices([{ chainId, address }])
  const chain = getChainPrefix(chainId)
  const coinId = `${chain}:${address.toLowerCase()}`
  return prices.get(coinId) || null
}

/**
 * Search token price by symbol on a specific chain
 * This is useful for finding underlying token prices
 */
export async function searchTokenBySymbol(
  chainId: number,
  symbol: string
): Promise<DeFiLlamaPrice | null> {
  const _chain = getChainPrefix(chainId)

  // Try common stablecoin addresses first
  const commonTokens: Record<string, Record<number, string>> = {
    USDT: {
      1: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      56: "0x55d398326f99059fF775485246999027B3197955",
      137: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"
    },
    USDC: {
      1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      56: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      137: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
    },
    WETH: {
      1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      10: "0x4200000000000000000000000000000000000006",
      42161: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
    },
    WBTC: {
      1: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      56: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c"
    },
    DAI: {
      1: "0x6b175474e89094c44da98b954eedeac495271d0f",
      56: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
      137: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063"
    }
  }

  const upperSymbol = symbol.toUpperCase()
  const tokenAddress = commonTokens[upperSymbol]?.[chainId]

  if (tokenAddress) {
    console.log(`Found common token ${upperSymbol} on chain ${chainId}: ${tokenAddress}`)
    return await fetchTokenPrice(chainId, tokenAddress)
  }

  console.warn(`No common token mapping found for ${symbol} on chain ${chainId}`)
  return null
}

/**
 * Calculate USD value from token amount and price
 */
export function calculateUsdValue(amount: string, decimals: number, priceUsd: number): number {
  try {
    const amountBigInt = BigInt(amount)
    const divisor = BigInt(10 ** decimals)
    const tokenAmount = Number(amountBigInt) / Number(divisor)
    return tokenAmount * priceUsd
  } catch (error) {
    console.error("Error calculating USD value:", error)
    return 0
  }
}
