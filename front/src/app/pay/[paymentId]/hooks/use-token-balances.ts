import { useCallback, useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { getFriendlyErrorMessage } from "@/lib/error-utils"
import { fetchWalletBalances, type TokenBalance } from "@/services/dune-sim"
import type { PaymentDetails } from "../types"

export function useTokenBalances(payment: PaymentDetails | null) {
  const { address, isConnected } = useAccount()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null)
  const selectedTokenRef = useRef<TokenBalance | null>(null)
  const isLoadingRef = useRef(false)
  const lastKeyRef = useRef<string | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    selectedTokenRef.current = selectedToken
  }, [selectedToken])

  const loadBalances = useCallback(async () => {
    if (!address || !payment) return

    // Create a unique key for this request
    const requestKey = `${address}-${payment.payment_id}`

    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return
    }

    // Skip if same address and payment_id
    if (requestKey === lastKeyRef.current && lastKeyRef.current !== null) {
      return
    }

    try {
      isLoadingRef.current = true
      lastKeyRef.current = requestKey
      setLoading(true)
      setError(null)

      const response = await fetchWalletBalances(address, {
        excludeSpamTokens: true,
        metadata: ["logo"],
        limit: 100
      })

      // Filter out tokens with zero value, but show all tokens regardless of whether
      // they cover the full payment amount (user might want to see what they have)
      const availableTokens = response.balances.filter((token) => (token.value_usd || 0) > 0)

      // Prioritize Base (8453) and Ethereum (1) tokens
      availableTokens.sort((a, b) => {
        const isABaseOrEth = a.chain_id === 8453 || a.chain_id === 1
        const isBBaseOrEth = b.chain_id === 8453 || b.chain_id === 1

        if (isABaseOrEth && !isBBaseOrEth) return -1
        if (!isABaseOrEth && isBBaseOrEth) return 1

        // Secondary sort by value (desc)
        return (b.value_usd || 0) - (a.value_usd || 0)
      })

      setBalances(availableTokens)

      // Only auto-select if no token is currently selected and we have tokens
      if (availableTokens.length > 0 && !selectedTokenRef.current) {
        // Prefer tokens that have sufficient balance
        const sufficientToken = availableTokens.find(
          (t) => (t.value_usd || 0) >= payment.amount_usd
        )
        setSelectedToken(sufficientToken || availableTokens[0])
      }
    } catch (err) {
      console.error("Error loading balances:", err)
      setError(getFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [address, payment])

  useEffect(() => {
    if (isConnected && address && payment) {
      // Only load if address or payment_id changed
      const requestKey = `${address}-${payment.payment_id}`
      if (requestKey !== lastKeyRef.current) {
        loadBalances()
      }
    } else {
      setBalances([])
      setSelectedToken(null)
      lastKeyRef.current = null
    }
  }, [isConnected, address, payment?.payment_id, loadBalances, payment])

  return {
    balances,
    loading,
    error,
    selectedToken,
    setSelectedToken,
    loadBalances
  }
}
