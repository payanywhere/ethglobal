import { useCallback, useEffect, useState } from "react"
import { fetchWalletBalances, type TokenBalance } from "@/services/dune-sim"

export function useWalletBalances(address: string | null) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalValueUSD, setTotalValueUSD] = useState<number>(0)

  const loadBalances = useCallback(async () => {
    if (!address) {
      setBalances([])
      setTotalValueUSD(0)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetchWalletBalances(address, {
        excludeSpamTokens: true,
        metadata: ["logo"],
        limit: 1000
      })

      setBalances(response.balances)

      // Calculate total USD value
      const total = response.balances.reduce((sum, token) => {
        return sum + (token.value_usd || 0)
      }, 0)
      setTotalValueUSD(total)
    } catch (err) {
      console.error("Error loading wallet balances:", err)
      setError(err instanceof Error ? err.message : "Failed to load wallet balances")
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    loadBalances()
  }, [loadBalances])

  return {
    balances,
    loading,
    error,
    totalValueUSD,
    refetch: loadBalances
  }
}

