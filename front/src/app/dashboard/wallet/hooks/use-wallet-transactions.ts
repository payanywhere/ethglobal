import { useCallback, useEffect, useState } from "react"

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

export function useWalletTransactions(address: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = useCallback(async () => {
    if (!address) {
      setTransactions([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      // TODO: Replace with actual Dune Sim transactions API when available
      // For now, return empty array or mock data
      // const response = await fetch(`/api/transactions?address=${address}`)
      // const data = await response.json()
      // setTransactions(data.transactions)

      // Mock empty for now - will be implemented when Dune Sim transactions API is available
      setTransactions([])
    } catch (err) {
      console.error("Error loading transactions:", err)
      setError(err instanceof Error ? err.message : "Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  return {
    transactions,
    loading,
    error,
    refetch: loadTransactions
  }
}

