"use client"

import { createContext, useContext, useCallback, useState, type ReactNode } from "react"
import type { Cashier, Merchant, Payment } from "@/services/api"

interface MerchantContextValue {
  merchant: Merchant | null
  walletAddress: string | null
  cashiers: Cashier[]
  payments: Payment[]
  isLoading: boolean
  error: string | null
  setMerchant: (merchant: Merchant | null) => void
  setWalletAddress: (address: string | null) => void
  setCashiers: (cashiers: Cashier[]) => void
  setPayments: (payments: Payment[]) => void
  setError: (error: string | null) => void
  setIsLoading: (loading: boolean) => void
  refreshCashiers: () => Promise<void>
  refreshPayments: () => Promise<void>
}

const MerchantContext = createContext<MerchantContextValue | undefined>(undefined)

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [cashiers, setCashiers] = useState<Cashier[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshCashiers = useCallback(async () => {
    if (!walletAddress) {
      console.warn("[MerchantContext] No walletAddress to refresh cashiers")
      return
    }

    try {
      setIsLoading(true)
      const { getCashiersByMerchantAddress } = await import("@/services/api")
      const cashiersList = await getCashiersByMerchantAddress(walletAddress)
      setCashiers(cashiersList)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar cashiers")
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  const refreshPayments = useCallback(async () => {
    if (!walletAddress) {
      console.warn("[MerchantContext] No walletAddress to refresh payments")
      return
    }

    try {
      setIsLoading(true)
      const { getPaymentsByMerchantAddress } = await import("@/services/api")
      const paymentsList = await getPaymentsByMerchantAddress(walletAddress)
      setPayments(paymentsList)
      console.log("Payments refreshed:", paymentsList.length)
    } catch (err) {
      console.error("[MerchantContext] Error refreshing payments:", err)
      setError(err instanceof Error ? err.message : "Error loading payments")
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        walletAddress,
        cashiers,
        payments,
        isLoading,
        error,
        setMerchant,
        setWalletAddress,
        setCashiers,
        setPayments,
        setError,
        setIsLoading,
        refreshCashiers,
        refreshPayments
      }}
    >
      {children}
    </MerchantContext.Provider>
  )
}

export function useMerchant() {
  const context = useContext(MerchantContext)
  if (context === undefined) {
    throw new Error("useMerchant must be used within a MerchantProvider")
  }
  return context
}
