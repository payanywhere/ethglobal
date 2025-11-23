"use client"

import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { ArrowUpRight, Check, Loader2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import { isAddress } from "viem"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TokenBalance } from "@/services/dune-sim"
import { formatTokenAmount } from "@/services/dune-sim"

interface SendOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: TokenBalance[]
  onSuccess?: () => void
}

export function SendOverlay({ open, onOpenChange, tokens, onSuccess }: SendOverlayProps) {
  const { primaryWallet } = useDynamicContext()
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Filter tokens with balance > 0
  const availableTokens = useMemo(() => {
    return tokens.filter((token) => {
      const balance = Number(token.amount) / 10 ** token.decimals
      return balance > 0
    })
  }, [tokens])

  // Auto-select first token if available
  useEffect(() => {
    if (open && availableTokens.length > 0 && !selectedToken) {
      setSelectedToken(availableTokens[0])
    }
  }, [open, availableTokens, selectedToken])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedToken(null)
      setRecipientAddress("")
      setAmount("")
      setError(null)
      setSuccess(false)
      setTxHash(null)
    }
  }, [open])

  const handleSend = useCallback(async () => {
    if (!selectedToken) {
      setError("Please select a token")
      return
    }

    if (
      !recipientAddress ||
      typeof recipientAddress !== "string" ||
      recipientAddress.trim() === ""
    ) {
      setError("Please enter a recipient address")
      return
    }

    // Validate address format
    try {
      if (!isAddress(recipientAddress.trim())) {
        setError("Please enter a valid recipient address")
        return
      }
    } catch (_err) {
      setError("Please enter a valid recipient address")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const tokenBalance = Number(selectedToken.amount) / 10 ** selectedToken.decimals
    if (Number(amount) > tokenBalance) {
      setError(
        `Insufficient balance. Available: ${tokenBalance.toFixed(6)} ${selectedToken.symbol}`
      )
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!primaryWallet) {
        throw new Error("No wallet connected. Please connect your wallet first.")
      }

      if (typeof primaryWallet.sendBalance !== "function") {
        throw new Error(
          "Send functionality not available. Please ensure you're using a compatible wallet (MetaMask, Coinbase Wallet, WalletConnect, etc.)"
        )
      }

      const isNativeToken =
        !selectedToken.address ||
        selectedToken.address === "0x0000000000000000000000000000000000000000"

      console.log("Sending transaction:", {
        amount,
        toAddress: recipientAddress.trim(),
        token: isNativeToken ? "native" : selectedToken.address,
        symbol: selectedToken.symbol,
        chainId: selectedToken.chain_id,
        chain: selectedToken.chain
      })

      // Try to switch network if needed
      if (primaryWallet.connector?.switchNetwork && selectedToken.chain_id) {
        try {
          console.log(
            `Attempting to switch to network ${selectedToken.chain} (Chain ID: ${selectedToken.chain_id})`
          )
          await primaryWallet.connector.switchNetwork({
            networkChainId: selectedToken.chain_id
          })
          console.log("Network switched successfully")
          // Small delay to let the wallet update
          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (switchError) {
          console.warn("Failed to switch network automatically:", switchError)
          // Don't throw here - let the sendBalance attempt proceed
          // The user might have already switched manually
        }
      }

      let txHash: string

      try {
        txHash = await primaryWallet.sendBalance({
          amount,
          toAddress: recipientAddress.trim(),
          token: isNativeToken
            ? undefined
            : {
                address: selectedToken.address,
                decimals: selectedToken.decimals
              }
        })
      } catch (sendError) {
        console.error("sendBalance error:", sendError)

        // Provide more specific error messages
        const errorMessage = sendError instanceof Error ? sendError.message : String(sendError)

        if (errorMessage.includes("Failed to fetch") || errorMessage.includes("fetch")) {
          throw new Error(
            "Network connection failed. Please check your internet connection and try again."
          )
        }

        if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected")) {
          throw new Error("Transaction was rejected. Please try again if you want to proceed.")
        }

        if (errorMessage.includes("insufficient funds")) {
          throw new Error("Insufficient funds to complete this transaction (including gas fees).")
        }

        if (errorMessage.includes("gas required exceeds allowance")) {
          throw new Error(
            `Wrong network. This token is on ${selectedToken.chain} (Chain ID: ${selectedToken.chain_id}). Please switch your wallet to the correct network manually and try again.`
          )
        }

        if (errorMessage.includes("chain mismatch") || errorMessage.includes("wrong chain")) {
          throw new Error(
            `Network mismatch. Please switch your wallet to ${selectedToken.chain} (Chain ID: ${selectedToken.chain_id}).`
          )
        }

        // Re-throw with original message if no specific case matched
        throw new Error(`Transaction failed: ${errorMessage}`)
      }

      if (!txHash || typeof txHash !== "string") {
        throw new Error("Transaction hash not returned. Please check your wallet and try again.")
      }

      console.log("Transaction successful:", txHash)

      setTxHash(txHash)
      setSuccess(true)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Error sending transaction:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to send transaction"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [selectedToken, recipientAddress, amount, primaryWallet, onSuccess])

  const handleMax = useCallback(() => {
    if (selectedToken) {
      const balance = Number(selectedToken.amount) / 10 ** selectedToken.decimals
      setAmount(balance.toString())
    }
  }, [selectedToken])

  const selectedTokenBalance = useMemo(() => {
    if (!selectedToken) return "0"
    return formatTokenAmount(selectedToken.amount, selectedToken.decimals)
  }, [selectedToken])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
          <DialogDescription>Send tokens to another wallet address</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {success ? (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-heading font-semibold text-lg mb-2">Transaction Sent!</p>
                <p className="text-sm text-foreground/50 mb-4">
                  Your transaction has been submitted successfully.
                </p>
                {txHash && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      window.open(
                        `https://etherscan.io/tx/${txHash}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }}
                    className="gap-2"
                  >
                    View on Explorer
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Token Selection */}
              <div className="space-y-2">
                <Label htmlFor="token">Select Token</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTokens.length === 0 ? (
                    <p className="text-sm text-foreground/50 text-center py-4">
                      No tokens available
                    </p>
                  ) : (
                    availableTokens.map((token) => {
                      const balance = formatTokenAmount(token.amount, token.decimals)
                      const isSelected =
                        selectedToken?.address === token.address &&
                        selectedToken?.chain_id === token.chain_id

                      return (
                        <button
                          key={`${token.chain_id}-${token.address}`}
                          type="button"
                          onClick={() => setSelectedToken(token)}
                          className={`w-full p-3 rounded-base border-2 transition-all text-left ${
                            isSelected
                              ? "border-[#00D696] bg-[#00D696]/10"
                              : "border-border bg-secondary-background hover:border-foreground/20"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {token.token_metadata?.logo ? (
                              <Image
                                src={token.token_metadata.logo}
                                alt={token.symbol}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                                <span className="text-xs font-bold">
                                  {token.symbol.slice(0, 2)}
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-heading font-semibold text-sm">{token.symbol}</p>
                              <p className="text-xs text-foreground/50">
                                Balance: {balance} {token.symbol}
                              </p>
                            </div>
                            {isSelected && <Check className="h-5 w-5 text-[#00D696]" />}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  disabled={loading}
                  className="font-mono"
                />
              </div>

              {/* Amount */}
              {selectedToken && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="amount">Amount</Label>
                    <button
                      type="button"
                      onClick={handleMax}
                      className="text-xs text-foreground/50 hover:text-foreground transition-colors"
                    >
                      Max: {selectedTokenBalance} {selectedToken.symbol}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={loading}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-sm font-medium text-foreground/50">
                        {selectedToken.symbol}
                      </span>
                    </div>
                  </div>
                  {selectedToken && amount && Number(amount) > 0 && (
                    <p className="text-xs text-foreground/50">
                      ≈ ${((selectedToken.price_usd || 0) * Number(amount)).toFixed(2)} USD
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-base border border-red-500/50 bg-red-50 dark:bg-red-950 max-w-full">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Send Button */}
              <Button
                variant="default"
                size="lg"
                onClick={handleSend}
                disabled={
                  loading ||
                  !selectedToken ||
                  !recipientAddress ||
                  !amount ||
                  !primaryWallet?.sendBalance
                }
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-5 w-5" />
                    Send {selectedToken?.symbol || "Tokens"}
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
