"use client"

import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useEffect, useRef, useState } from "react"
import {
  createCashier,
  getCashiersByMerchantAddress,
  getMerchantByAddress,
  getMerchantByEmail,
  getPaymentsByMerchantAddress,
  registerMerchant,
  type Merchant,
  type Payment,
  type RegisterMerchantRequest
} from "@/services/api"
import { useMerchant } from "@/contexts/merchant-context"

interface UseMerchantVerificationResult {
  isVerifying: boolean
  merchantVerified: boolean
  error: string | null
  walletAddress: string | null
  payments: Payment[]
}

export function useMerchantVerification(): UseMerchantVerificationResult {
  const { primaryWallet, user, isAuthenticated, isAuthLoading } = useDynamicContext()
  const merchantContext = useMerchant()
  const [isVerifying, setIsVerifying] = useState(false)
  const [merchantVerified, setMerchantVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const hasVerifiedRef = useRef(false)

  // Sync walletAddress with the context
  useEffect(() => {
    if (walletAddress && merchantContext.walletAddress !== walletAddress) {
      merchantContext.setWalletAddress(walletAddress)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]) // Only depend on walletAddress, not the entire context

  // Set the address as soon as it is available
  useEffect(() => {
    const currentAddress = primaryWallet?.address
    if (currentAddress && !walletAddress) {
      console.log("[Merchant Verification] Address detected:", currentAddress)
      setWalletAddress(currentAddress)
    }
  }, [primaryWallet?.address, walletAddress])

  // Verification and creation of the merchant process
  useEffect(() => {
    const currentAddress = primaryWallet?.address

    console.log("[Merchant Verification] Checking conditions:", {
      isAuthLoading,
      isAuthenticated,
      currentAddress,
      hasVerified: hasVerifiedRef.current
    })

    if (isAuthLoading) {
      console.log("[Merchant Verification] ⏳ Esperando que termine isAuthLoading...")
      return
    }


    if (!currentAddress) {
      console.log("no wallet")
      return 
    }

    if (hasVerifiedRef.current) {
      console.log("already verified")
      return
    }

    const verifyAndCreateMerchant = async () => {
      try {
        setIsVerifying(true)
        setError(null)
        hasVerifiedRef.current = true

        const existingMerchant = await getMerchantByAddress(currentAddress)

        if (existingMerchant) {
          console.log("merchant found", {
            _id: existingMerchant._id,
            email: existingMerchant.email,
            business_name: existingMerchant.business_name,
            wallets: existingMerchant.wallets
          })

          // Update the context with the merchant
          merchantContext.setMerchant(existingMerchant)
          merchantContext.setWalletAddress(currentAddress)

          // The merchant already exists, check if it has cashiers
          if (existingMerchant._id) {
            try {
              const cashiers = await getCashiersByMerchantAddress(currentAddress)
              console.log("cashiers found", cashiers.length)
              
              // Update the context with the cashiers
              merchantContext.setCashiers(cashiers)
              
              if (cashiers.length === 0) {
                await createCashier({
                  merchantId: existingMerchant._id,
                  name: "default",
                  status: "enabled"
                })
                const refreshedCashiers = await getCashiersByMerchantAddress(currentAddress)
                merchantContext.setCashiers(refreshedCashiers)
              } else {
                console.log("merchant already has cashiers")
              }

              const merchantPayments = await getPaymentsByMerchantAddress(currentAddress)
              setPayments(merchantPayments)
              merchantContext.setPayments(merchantPayments)
            } catch (err) {
              console.error("error", err)
            }
          }
          setMerchantVerified(true)
          return
        }

        const userEmail =
          user?.email ||
          (primaryWallet as { user?: { email?: string } }).user?.email ||
          `wallet_${currentAddress.slice(2, 10)}@payanywhere.local`
        console.log("email to verify", userEmail)
        let merchantByEmail: Merchant | null = null
        if (userEmail && userEmail.includes("@")) {
          try {
            merchantByEmail = await getMerchantByEmail(userEmail)
            if (merchantByEmail) {
              merchantContext.setMerchant(merchantByEmail)
              merchantContext.setWalletAddress(currentAddress)
              if (merchantByEmail._id) {
                try {
                  const cashiers = await getCashiersByMerchantAddress(currentAddress)
                  merchantContext.setCashiers(cashiers)
                  if (cashiers.length === 0) {
                    await createCashier({
                      merchantId: merchantByEmail._id,
                      name: "default",
                      status: "enabled"
                    })
                    const refreshedCashiers = await getCashiersByMerchantAddress(currentAddress)
                    merchantContext.setCashiers(refreshedCashiers)
                  } 

                  const merchantPayments = await getPaymentsByMerchantAddress(currentAddress)
                  setPayments(merchantPayments)
                  merchantContext.setPayments(merchantPayments)
                } catch (err) {
                  console.error("error", err)
                }
              }
              setMerchantVerified(true)
              return
            }
          } catch (err) {
            console.warn("error", err)
          }
        }

        const network = "polygon"

        const merchantData: RegisterMerchantRequest = {
          email: userEmail,
          password: "password123", // FIXME
          business_name: `Merchant ${currentAddress.slice(0, 6)}...${currentAddress.slice(-4)}`,
          wallets: [
            {
              network,
              address: currentAddress,
              tokens: ["USDC", "USDT"]
            }
          ]
        }
        const newMerchant = await registerMerchant(merchantData)
        merchantContext.setMerchant(newMerchant)
        merchantContext.setWalletAddress(currentAddress)
        try {
          const cashiers = await getCashiersByMerchantAddress(currentAddress)
          merchantContext.setCashiers(cashiers)
          const merchantPayments = await getPaymentsByMerchantAddress(currentAddress)
          merchantContext.setPayments(merchantPayments)
          setPayments(merchantPayments)
        } catch (err) {
          console.error("error", err)
        }
        
        setMerchantVerified(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error verifying merchant")
        hasVerifiedRef.current = false // Allow retry
      } finally {
        setIsVerifying(false)
      }
    }

    verifyAndCreateMerchant()
  }, [isAuthenticated, isAuthLoading, primaryWallet?.address, user])

  useEffect(() => {
    if (!isAuthenticated) {
      hasVerifiedRef.current = false
      setMerchantVerified(false)
      setError(null)
      setWalletAddress(null)
      setPayments([])
      merchantContext.setMerchant(null)
      merchantContext.setWalletAddress(null)
      merchantContext.setCashiers([])
      merchantContext.setPayments([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]) 

  return {
    isVerifying,
    merchantVerified,
    error,
    walletAddress,
    payments
  }
}

