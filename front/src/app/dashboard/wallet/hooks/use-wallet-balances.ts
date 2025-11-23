import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BASE_TOKENS, ETHEREUM_TOKENS, type TokenInfo } from "@/constants/cdp-tokens"
import { getAllChainIds } from "@/constants/chains"
import {
  calculateUsdValue,
  fetchTokenPrices,
  searchTokenBySymbol
} from "@/services/defillama-prices"
import { fetchWalletBalances, type TokenBalance } from "@/services/dune-sim"
import {
  type DefiPosition,
  fetchAaveTokensFromBalances,
  fetchDefiPositions,
  formatPositionName,
  getUnderlyingSymbolFromAaveToken,
  isAaveToken
} from "@/services/dune-sim-defi"

/**
 * Check if a token is an Aave token based on symbol
 */
function isAaveTokenBalance(token: TokenBalance): boolean {
  const symbol = token.symbol?.toLowerCase() || ""
  return (
    symbol.startsWith("a") &&
    (symbol.includes("weth") ||
      symbol.includes("wbtc") ||
      symbol.includes("usdc") ||
      symbol.includes("usdt") ||
      symbol.includes("dai") ||
      symbol.includes("link") ||
      symbol.includes("aave"))
  )
}

/**
 * Convert DeFi position to TokenBalance format for display
 */
function defiPositionToTokenBalance(position: DefiPosition): TokenBalance {
  const name = formatPositionName(position)

  return {
    chain: position.chain_id === 1 ? "ethereum" : position.chain_id === 56 ? "bnb" : "unknown",
    chain_id: position.chain_id,
    address: position.token || position.pool || `defi-${position.type}-${Math.random()}`,
    amount: String(Math.floor((position.calculated_balance || 0) * 1e18)), // Convert to wei-like format
    symbol: position.token_symbol || name,
    name: name,
    decimals: 18,
    price_usd: position.price_in_usd || 0,
    value_usd: position.usd_value || 0,
    token_metadata: {
      logo: position.logo || undefined
    }
  }
}

export function useWalletBalances(address: string | null) {
  const balanceChainIds = useMemo(() => getAllChainIds().join(","), [])
  const knownTokenOverrides = useMemo(() => {
    const map = new Map<string, TokenInfo>()
    const register = (chainId: number, token: TokenInfo) => {
      map.set(`${chainId}-${token.address.toLowerCase()}`, token)
    }

    ETHEREUM_TOKENS.forEach((token) => register(1, token))
    BASE_TOKENS.forEach((token) => register(8453, token))

    return map
  }, [])
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalValueUSD, setTotalValueUSD] = useState<number>(0)
  const isLoadingRef = useRef(false)
  const lastAddressRef = useRef<string | null>(null)

  const loadBalances = useCallback(
    async (force = false) => {
      // Prevent duplicate calls (unless forced)
      if (isLoadingRef.current && !force) {
        return
      }

      // Skip if address hasn't changed (unless forced)
      if (!force && address === lastAddressRef.current && lastAddressRef.current !== null) {
        return
      }
      if (!address) {
        setBalances([])
        setTotalValueUSD(0)
        return
      }

      try {
        isLoadingRef.current = true
        lastAddressRef.current = address
        setLoading(true)
        setError(null)

        // Fetch both regular balances and DeFi positions in parallel
        const [balancesResponse, defiResponse] = await Promise.all([
          fetchWalletBalances(address, {
            chainIds: balanceChainIds,
            excludeSpamTokens: true,
            metadata: ["logo"],
            limit: 1000
          }),
          fetchDefiPositions(address).catch((err) => {
            console.warn("Failed to fetch DeFi positions:", err)
            return { positions: [], aggregations: { total_usd_value: 0 } }
          })
        ])

        // Filter out ALL Aave tokens (we'll add them back separately) and tokens without logo
        const balancesWithOverrides = balancesResponse.balances.map((token) => {
          const key = `${token.chain_id}-${token.address.toLowerCase()}`
          const override = knownTokenOverrides.get(key)

          if (!override) {
            return token
          }

          return {
            ...token,
            symbol: token.symbol || override.symbol,
            name: token.name || override.name,
            token_metadata: {
              ...token.token_metadata,
              logo: token.token_metadata?.logo || override.logo
            }
          }
        })

        const regularBalances = balancesWithOverrides.filter((token) => {
          // Exclude ALL Aave tokens (we'll handle them separately)
          if (isAaveTokenBalance(token)) {
            return false
          }

          // Exclude tokens without logo (likely DeFi tokens that will be in positions)
          // But keep native tokens and tokens with USD value
          if (
            !token.token_metadata?.logo &&
            token.address !== "0x0000000000000000000000000000000000000000"
          ) {
            return token.value_usd && token.value_usd > 0
          }

          return true
        })

        // Filter out Aave positions and convert DeFi positions to token format
        const defiBalances = defiResponse.positions
          .filter((position) => !isAaveToken(position) && position.usd_value > 0)
          .map(defiPositionToTokenBalance)

        // Get Aave tokens from non-DeFi-supported chains (e.g., Polygon, BSC)
        const aaveTokensFromOtherChains = await fetchAaveTokensFromBalances(balancesWithOverrides)

        // Combine regular balances and Aave tokens for enrichment
        const allTokensToEnrich = [...regularBalances, ...aaveTokensFromOtherChains]

        // Identify tokens without logo or price that need DeFiLlama enrichment
        const tokensNeedingPrices = allTokensToEnrich.filter((token) => {
          return !token.token_metadata?.logo || !token.price_usd || token.price_usd === 0
        })

        // Fetch prices from DeFiLlama for tokens without logo/price
        let enrichedBalances = [...allTokensToEnrich]
        if (tokensNeedingPrices.length > 0) {
          console.log(`Fetching prices for ${tokensNeedingPrices.length} tokens from DeFiLlama...`)

          // First, try to fetch prices by address for non-Aave tokens
          const regularPriceRequests = tokensNeedingPrices
            .filter((token) => !isAaveTokenBalance(token))
            .map((token) => ({ chainId: token.chain_id, address: token.address }))

          const priceMap = await fetchTokenPrices(regularPriceRequests)
          console.log(`DeFiLlama returned ${priceMap.size} prices for regular tokens`)

          // For Aave tokens, fetch underlying token price by symbol
          const aaveTokens = tokensNeedingPrices.filter((token) => isAaveTokenBalance(token))

          for (const aaveToken of aaveTokens) {
            const underlyingSymbol = getUnderlyingSymbolFromAaveToken(aaveToken.symbol || "")

            if (underlyingSymbol) {
              console.log(
                `Aave token ${aaveToken.symbol}: searching for underlying ${underlyingSymbol}`
              )
              const underlyingPrice = await searchTokenBySymbol(
                aaveToken.chain_id,
                underlyingSymbol
              )

              if (underlyingPrice) {
                // Store the price using the Aave token address as key
                const chain =
                  aaveToken.chain_id === 1
                    ? "ethereum"
                    : aaveToken.chain_id === 56
                      ? "bsc"
                      : aaveToken.chain_id === 137
                        ? "polygon"
                        : aaveToken.chain
                const coinId = `${chain}:${aaveToken.address.toLowerCase()}`
                priceMap.set(coinId, underlyingPrice)
                console.log(
                  `Set price for ${aaveToken.symbol} (${coinId}): $${underlyingPrice.price}`
                )
              }
            }
          }

          // Update balances with DeFiLlama prices
          enrichedBalances = allTokensToEnrich.map((token) => {
            // Skip if token already has a logo and price
            if (token.token_metadata?.logo && token.price_usd && token.price_usd > 0) {
              return token
            }

            // Look up price in DeFiLlama using token's own address
            const chainPrefixes = [
              token.chain_id === 1
                ? "ethereum"
                : token.chain_id === 56
                  ? "bsc"
                  : token.chain_id === 137
                    ? "polygon"
                    : token.chain_id === 42161
                      ? "arbitrum"
                      : token.chain_id === 10
                        ? "optimism"
                        : token.chain_id === 8453
                          ? "base"
                          : token.chain_id === 43114
                            ? "avax"
                            : token.chain_id === 250
                              ? "fantom"
                              : token.chain_id === 100
                                ? "xdai"
                                : token.chain_id === 42220
                                  ? "celo"
                                  : token.chain
            ]

            let priceData = null
            let matchedCoinId = null
            for (const prefix of chainPrefixes) {
              const coinId = `${prefix}:${token.address.toLowerCase()}`
              priceData = priceMap.get(coinId)
              if (priceData) {
                matchedCoinId = coinId
                break
              }
            }

            if (priceData && priceData.price > 0) {
              // Calculate USD value with DeFiLlama price
              const usdValue = calculateUsdValue(token.amount, token.decimals, priceData.price)

              const isAave = isAaveTokenBalance(token)
              console.log(
                `Enriched ${token.symbol} (${matchedCoinId}${isAave ? " [Aave]" : ""}): $${priceData.price.toFixed(4)} -> $${usdValue.toFixed(2)}`
              )

              return {
                ...token,
                price_usd: priceData.price,
                value_usd: usdValue,
                symbol: token.symbol, // Keep original symbol
                token_metadata: {
                  ...token.token_metadata,
                  logo: token.token_metadata?.logo // Keep existing logo if any
                }
              }
            }

            return token
          })
        }

        // Combine enriched balances and DeFi positions (no more separate Aave array)
        const allBalances = [...enrichedBalances, ...defiBalances]

        // Sort by USD value (descending - highest first)
        const sortedBalances = allBalances.sort((a, b) => {
          const valueA = a.value_usd || 0
          const valueB = b.value_usd || 0
          return valueB - valueA
        })

        setBalances(sortedBalances)

        // Calculate total USD value
        // For enriched tokens (includes regular + Aave from non-DeFi chains): sum their value_usd
        const enrichedTotal = enrichedBalances.reduce((sum, token) => {
          return sum + (token.value_usd || 0)
        }, 0)

        // For DeFi positions: use the aggregated total from API
        const defiTotal = defiResponse.aggregations?.total_usd_value || 0

        // Filter out Aave from defi total (only from DeFi-supported chains)
        const aaveTotal = defiResponse.positions
          .filter(isAaveToken)
          .reduce((sum, pos) => sum + (pos.usd_value || 0), 0)

        const total = enrichedTotal + (defiTotal - aaveTotal)
        setTotalValueUSD(total)

        console.log(
          `Total balance: $${total.toFixed(2)} (Enriched: $${enrichedTotal.toFixed(2)}, DeFi: $${(defiTotal - aaveTotal).toFixed(2)})`
        )
      } catch (err) {
        console.error("Error loading wallet balances:", err)
        setError(err instanceof Error ? err.message : "Failed to load wallet balances")
      } finally {
        setLoading(false)
        isLoadingRef.current = false
      }
    },
    [address, balanceChainIds, knownTokenOverrides.get]
  )

  useEffect(() => {
    // Only load if address changed
    if (address !== lastAddressRef.current) {
      loadBalances()
    }
  }, [address, loadBalances])

  const refetch = useCallback(() => {
    loadBalances(true)
  }, [loadBalances])

  return {
    balances,
    loading,
    error,
    totalValueUSD,
    refetch
  }
}
