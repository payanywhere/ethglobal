import { useCallback, useEffect, useRef, useState } from "react"
import { useAccount } from "wagmi"
import { getFriendlyErrorMessage } from "@/lib/error-utils"
import {
  fetchWalletBalances,
  filterTokensWithSufficientBalance,
  type TokenBalance
} from "@/services/dune-sim"
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

      const sufficientBalances = filterTokensWithSufficientBalance(
        response.balances,
        payment.amount_usd
      )

      setBalances(sufficientBalances)

      // Only auto-select if no token is currently selected
      if (sufficientBalances.length > 0 && !selectedTokenRef.current) {
        setSelectedToken(sufficientBalances[0])
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
