"use client"

import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { useMemo } from "react"

export function useMerchantWallet() {
  const { primaryWallet, isAuthenticated, isAuthLoading } = useDynamicContext()

  const { walletAddress, walletId } = useMemo(() => {
    if (!primaryWallet) {
      return { walletAddress: null, walletId: null }
    }

    const address = primaryWallet.address ?? null
    const id =
      (primaryWallet as { walletId?: string }).walletId ??
      (primaryWallet as { id?: string }).id ??
      null

    return { walletAddress: address, walletId: id }
  }, [primaryWallet])

  return {
    walletAddress,
    walletId,
    ready: !isAuthLoading,
    isAuthenticated
  }
}
