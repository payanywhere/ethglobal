import { usePrivy } from "@privy-io/react-auth"
import { useMemo } from "react"

/**
 * Hook to get wallet address from Privy user
 * Handles both embedded wallets and linked accounts
 */
export function usePrivyWallet() {
  const { user, ready } = usePrivy()

  const walletAddress = useMemo(() => {
    if (!user || !ready) return null

    // Try embedded wallet first
    if (user.wallet?.address) {
      return user.wallet.address
    }

    // Try linked accounts
    const walletAccount = user.linkedAccounts?.find((account) => account.type === "wallet")

    if (walletAccount && "address" in walletAccount && walletAccount.address) {
      return walletAccount.address
    }

    return null
  }, [user, ready])

  return {
    walletAddress,
    ready,
    user
  }
}

