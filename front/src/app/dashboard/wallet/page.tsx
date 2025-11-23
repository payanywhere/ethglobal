"use client"

import { useCallback, useState } from "react"
import { WalletHeader } from "./components/wallet-header"
import { TokenBalancesList } from "./components/token-balances-list"
import { TransactionHistory } from "./components/transaction-history"
import { ReceiveOverlay } from "./components/receive-overlay"
import { SendOverlay } from "./components/send-overlay"
import { SwapOverlay } from "./components/swap-overlay"
import { useMerchantWallet } from "./hooks/use-merchant-wallet"
import { useWalletBalances } from "./hooks/use-wallet-balances"
import { useWalletTransactions } from "./hooks/use-wallet-transactions"

export default function WalletPage() {
  const { walletAddress, ready } = useMerchantWallet()
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showSwapModal, setShowSwapModal] = useState(false)

  // Custom hooks
  const {
    balances,
    loading: loadingBalances,
    error: balancesError,
    totalValueUSD,
    refetch: refetchBalances
  } = useWalletBalances(walletAddress)

  const {
    transactions,
    loading: loadingTransactions,
    error: transactionsError
  } = useWalletTransactions(walletAddress)

  // Handlers
  const handleSend = useCallback(() => {
    setShowSendModal(true)
  }, [])

  const handleSendSuccess = useCallback(() => {
    // Refresh balances after successful send
    refetchBalances()
  }, [refetchBalances])

  const handleReceive = useCallback(() => {
    setShowReceiveModal(true)
  }, [])

  const handleSwap = useCallback(() => {
    setShowSwapModal(true)
  }, [])

  const handleSwapSuccess = useCallback(() => {
    // Refresh balances after successful swap
    refetchBalances()
  }, [refetchBalances])

  if (!ready) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">Wallet</h1>
          <p className="text-foreground/50 text-sm">Manage your crypto wallet and transactions</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 animate-spin mx-auto text-foreground/50 border-4 border-foreground/20 border-t-foreground rounded-full" />
            <p className="text-foreground/70">Loading wallet...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold">Wallet</h1>
          <p className="text-foreground/50 text-sm">Manage your crypto wallet and transactions</p>
        </div>
        <div className="py-12 text-center">
          <p className="text-foreground/50 mb-4">No wallet connected</p>
          <p className="text-sm text-foreground/50">
            Please connect your wallet in settings or create an embedded wallet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-bold">Wallet</h1>
        <p className="text-foreground/50 text-sm">Manage your crypto wallet and transactions</p>
      </div>

      {/* Wallet Header with Total Balance and Quick Actions */}
      <WalletHeader
        totalValueUSD={totalValueUSD}
        loading={loadingBalances}
        onSend={handleSend}
        onReceive={handleReceive}
        onSwap={handleSwap}
      />

      {/* Token Balances and Transaction History - Side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TokenBalancesList
          tokens={balances}
          loading={loadingBalances}
          error={balancesError}
          onRefresh={refetchBalances}
        />
        <TransactionHistory
          transactions={transactions}
          loading={loadingTransactions}
          error={transactionsError}
          address={walletAddress}
        />
      </div>

      {/* Receive Overlay */}
      <ReceiveOverlay
        open={showReceiveModal}
        onOpenChange={setShowReceiveModal}
        address={walletAddress}
      />

      {/* Send Overlay */}
      <SendOverlay
        open={showSendModal}
        onOpenChange={setShowSendModal}
        tokens={balances}
        onSuccess={handleSendSuccess}
      />

      {/* Swap Overlay */}
      <SwapOverlay
        open={showSwapModal}
        onOpenChange={setShowSwapModal}
        tokens={balances}
        onSuccess={handleSwapSuccess}
      />
    </div>
  )
}
