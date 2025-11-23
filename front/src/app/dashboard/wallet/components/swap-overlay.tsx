"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { ArrowDownUp, ArrowLeftRight, Check, ChevronDown, Loader2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TokenBalance } from "@/services/dune-sim"
import { formatTokenAmount } from "@/services/dune-sim"
import {
  estimateSwapPrice,
  getCdpNetwork,
  isCdpSupportedChain,
  type CdpSupportedNetwork
} from "@/services/cdp-trade"
import {
  getTokensForNetwork,
  type TokenInfo
} from "@/constants/cdp-tokens"

interface SwapOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tokens: TokenBalance[]
  onSuccess?: () => void
}

export function SwapOverlay({ open, onOpenChange, tokens, onSuccess }: SwapOverlayProps) {
  const { primaryWallet } = useDynamicContext()
  const [selectedFromToken, setSelectedFromToken] = useState<TokenBalance | null>(null)
  const [selectedToToken, setSelectedToToken] = useState<TokenInfo | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [approvingToken, setApprovingToken] = useState(false)
  const [priceEstimate, setPriceEstimate] = useState<{
    toAmount: bigint
    minToAmount: bigint
    liquidityAvailable: boolean | null
  } | null>(null)
  const [estimatingPrice, setEstimatingPrice] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<CdpSupportedNetwork | null>(null)
  const [showFromTokenList, setShowFromTokenList] = useState(false)
  const [showToTokenList, setShowToTokenList] = useState(false)
  const fromTokenRef = useRef<HTMLDivElement>(null)
  const toTokenRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromTokenRef.current && !fromTokenRef.current.contains(event.target as Node)) {
        setShowFromTokenList(false)
      }
      if (toTokenRef.current && !toTokenRef.current.contains(event.target as Node)) {
        setShowToTokenList(false)
      }
    }

    if (showFromTokenList || showToTokenList) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFromTokenList, showToTokenList])

  // Filter tokens by CDP-supported chains (Ethereum and Base)
  const supportedTokens = useMemo(() => {
    return tokens.filter((token) => isCdpSupportedChain(token.chain_id))
  }, [tokens])

  // Get available tokens for the selected network
  const availableToTokens = useMemo(() => {
    if (!currentNetwork) return []
    return getTokensForNetwork(currentNetwork)
  }, [currentNetwork])

  // Filter tokens with balance for from token selection
  const availableFromTokens = useMemo(() => {
    return supportedTokens.filter((token) => {
      const balance = Number(token.amount) / 10 ** token.decimals
      return balance > 0
    })
  }, [supportedTokens])

  // Determine network from selected from token
  useEffect(() => {
    if (selectedFromToken) {
      const network = getCdpNetwork(selectedFromToken.chain_id)
      if (network) {
        setCurrentNetwork(network)
        // Auto-select first available token if none selected
        if (!selectedToToken && availableToTokens.length > 0) {
          // Prefer USDC, then WETH, then first available
          const usdc = availableToTokens.find((t) => t.symbol === "USDC")
          const weth = availableToTokens.find((t) => t.symbol === "WETH")
          setSelectedToToken(usdc || weth || availableToTokens[0])
        }
      } else {
        setCurrentNetwork(null)
      }
    }
  }, [selectedFromToken, availableToTokens, selectedToToken])

  // Debug: Log wallet connection status
  useEffect(() => {
    if (open && primaryWallet) {
      console.log("Swap Overlay - Wallet Status:", {
        address: primaryWallet.address,
        hasConnector: !!primaryWallet.connector,
        hasGetProvider: !!primaryWallet.connector?.getProvider,
        hasSwitchNetwork: !!primaryWallet.connector?.switchNetwork,
        hasSendBalance: !!primaryWallet.sendBalance
      })
    }
  }, [open, primaryWallet])

  // Auto-select first token with balance when modal opens
  useEffect(() => {
    if (open && availableFromTokens.length > 0 && !selectedFromToken) {
      setSelectedFromToken(availableFromTokens[0])
    }
  }, [open, availableFromTokens, selectedFromToken])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedFromToken(null)
      setSelectedToToken(null)
      setAmount("")
      setError(null)
      setSuccess(false)
      setTxHash(null)
      setPriceEstimate(null)
      setCurrentNetwork(null)
      setShowFromTokenList(false)
      setShowToTokenList(false)
      setApprovingToken(false)
    }
  }, [open])

  // Estimate swap price when inputs change
  useEffect(() => {
    const estimatePrice = async () => {
      if (
        !selectedFromToken ||
        !selectedToToken ||
        !amount ||
        Number(amount) <= 0 ||
        !currentNetwork ||
        !primaryWallet?.address
      ) {
        setPriceEstimate(null)
        return
      }

      try {
        setEstimatingPrice(true)
        setError(null)

        // For native ETH, use WETH address for swaps
        let fromTokenAddress = selectedFromToken.address
        if (selectedFromToken.address === "0x0000000000000000000000000000000000000000") {
          const wethToken = availableToTokens.find((t) => t.symbol === "WETH")
          if (wethToken) {
            fromTokenAddress = wethToken.address
          } else {
            // Fallback to WETH addresses if not in token list
            fromTokenAddress =
              currentNetwork === "base"
                ? "0x4200000000000000000000000000000000000006"
                : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          }
        }

        const fromAmount = BigInt(
          Math.floor(Number(amount) * 10 ** selectedFromToken.decimals)
        )

        const estimate = await estimateSwapPrice({
          fromToken: fromTokenAddress,
          toToken: selectedToToken.address,
          fromAmount,
          network: currentNetwork,
          taker: primaryWallet.address
        })

        setPriceEstimate(estimate)
      } catch (err) {
        console.error("Error estimating swap price:", err)
        setPriceEstimate(null)
        // Don't set error here, just clear estimate
      } finally {
        setEstimatingPrice(false)
      }
    }

    // Debounce price estimation
    const timeoutId = setTimeout(estimatePrice, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedFromToken, selectedToToken, amount, currentNetwork, primaryWallet?.address, availableToTokens])

  const handleSwap = useCallback(async () => {
    if (!selectedFromToken || !selectedToToken || !currentNetwork) {
      setError("Please select tokens to swap")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    const tokenBalance = Number(selectedFromToken.amount) / 10 ** selectedFromToken.decimals
    if (Number(amount) > tokenBalance) {
      setError(`Insufficient balance. Available: ${tokenBalance.toFixed(6)} ${selectedFromToken.symbol}`)
      return
    }

    if (!primaryWallet?.address) {
      setError("No wallet connected")
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!primaryWallet) {
        throw new Error("No wallet connected. Please connect your wallet first.")
      }

      // For native ETH, use WETH address for swaps
      let fromTokenAddress = selectedFromToken.address
      if (selectedFromToken.address === "0x0000000000000000000000000000000000000000") {
        const wethToken = availableToTokens.find((t) => t.symbol === "WETH")
        if (wethToken) {
          fromTokenAddress = wethToken.address
        } else {
          // Fallback to WETH addresses if not in token list
          fromTokenAddress =
            currentNetwork === "base"
              ? "0x4200000000000000000000000000000000000006"
              : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
        }
      }

      const fromAmount = BigInt(
        Math.floor(Number(amount) * 10 ** selectedFromToken.decimals)
      )

      console.log("Executing swap:", {
        fromToken: fromTokenAddress,
        toToken: selectedToToken.address,
        fromAmount: fromAmount.toString(),
        network: currentNetwork,
        wallet: primaryWallet.address
      })

      // Switch to correct network if needed
      const targetChainId = currentNetwork === "base" ? 8453 : 1
      
      if (primaryWallet.connector?.switchNetwork) {
        try {
          console.log(`Attempting to switch to ${currentNetwork} network (Chain ID: ${targetChainId})`)
          await primaryWallet.connector.switchNetwork({
            networkChainId: targetChainId
          })
          console.log("Network switched successfully")
          // Give the wallet time to update
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (switchError) {
          console.warn("Failed to switch network automatically:", switchError)
          const switchErrorMsg = switchError instanceof Error ? switchError.message : String(switchError)
          
          // If user rejected, throw a clear error
          if (switchErrorMsg.includes("rejected") || switchErrorMsg.includes("denied")) {
            throw new Error(
              `You need to switch to ${currentNetwork === "base" ? "Base" : "Ethereum"} network to complete this swap. Please switch networks in your wallet and try again.`
            )
          }
          
          // Otherwise continue - user might have already switched manually
          console.log("Continuing with transaction attempt...")
        }
      } else {
        // No automatic network switching available
        console.warn("Wallet does not support automatic network switching")
        console.log(`Please ensure you are on ${currentNetwork} network (Chain ID: ${targetChainId})`)
      }
      
      // Verify we can connect to the wallet client before getting quote
      let walletClient
      try {
        walletClient = await primaryWallet.getWalletClient?.()
        if (!walletClient) {
          throw new Error("Unable to connect to wallet. Please check your wallet connection and try again.")
        }
        console.log("Wallet client connection verified")
      } catch (clientError) {
        console.error("Failed to get wallet client:", clientError)
        throw new Error(
          `Unable to connect to your wallet. Please:\n` +
          `1. Make sure your wallet is unlocked\n` +
          `2. Switch to ${currentNetwork === "base" ? "Base" : "Ethereum"} network manually in your wallet\n` +
          `3. Refresh the page and try again`
        )
      }

      // Get swap transaction data from API first to know the contract address
      console.log("Fetching swap transaction data from API...")
      let txData: {
        to: string
        data: string
        value: string
        gasLimit?: string
        permit2?: {
          hash: string
          eip712: {
            domain: any
            types: any
            primaryType: string
            message: any
          }
        }
      }

      try {
        const response = await fetch("/api/swap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fromToken: fromTokenAddress,
            toToken: selectedToToken.address,
            fromAmount: fromAmount.toString(),
            network: currentNetwork,
            slippageBps: 100, // 1% slippage
            taker: primaryWallet.address
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || `Failed to get swap quote`)
        }

        txData = await response.json()
        console.log("Got swap transaction data:", {
          to: txData.to,
          value: txData.value,
          gasLimit: txData.gasLimit,
          dataLength: txData.data?.length || 0
        })
      } catch (apiError) {
        console.error("API error:", apiError)
        throw new Error(
          apiError instanceof Error ? apiError.message : "Failed to get swap quote from API"
        )
      }

      // Handle Permit2 signature (gasless approval!)
      // Check if token approval is needed (skip for native ETH)
      const isNativeEth = selectedFromToken.address === "0x0000000000000000000000000000000000000000"
      const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3"
      
      if (!isNativeEth && walletClient && primaryWallet?.getPublicClient) {
        try {
          console.log("Checking Permit2 allowance for:", fromTokenAddress)
          setApprovingToken(true)
          
          const publicClient = await primaryWallet.getPublicClient?.()
          
          // ERC20 allowance ABI
          const allowanceAbi = [{
            name: 'allowance',
            type: 'function',
            stateMutability: 'view',
            inputs: [
              { name: 'owner', type: 'address' },
              { name: 'spender', type: 'address' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }] as const
          
          // Check current allowance for Permit2 contract
          const currentAllowance = await publicClient.readContract({
            address: fromTokenAddress as `0x${string}`,
            abi: allowanceAbi,
            functionName: 'allowance',
            args: [primaryWallet.address as `0x${string}`, PERMIT2_ADDRESS as `0x${string}`]
          })
          
          console.log("Current Permit2 allowance:", currentAllowance.toString())
          console.log("Required amount:", fromAmount.toString())
          
          // If allowance is insufficient, request approval to Permit2
          if (currentAllowance < fromAmount) {
            console.log("Insufficient Permit2 allowance, requesting approval...")
            
            // ERC20 approve ABI
            const approveAbi = [{
              name: 'approve',
              type: 'function',
              stateMutability: 'nonpayable',
              inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' }
              ],
              outputs: [{ name: '', type: 'bool' }]
            }] as const
            
            // Approve Permit2 contract to spend tokens
            console.log(`Approving Permit2 contract (${PERMIT2_ADDRESS}) for ${fromAmount.toString()} tokens`)
            
            const approvalHash = await walletClient.writeContract({
              address: fromTokenAddress as `0x${string}`,
              abi: approveAbi,
              functionName: 'approve',
              args: [PERMIT2_ADDRESS as `0x${string}`, fromAmount],
              account: primaryWallet.address as `0x${string}`
            })
            
            console.log("Approval transaction sent:", approvalHash)
            
            // Wait for approval transaction to be confirmed
            console.log("Waiting for approval confirmation...")
            const approvalReceipt = await publicClient.waitForTransactionReceipt({
              hash: approvalHash,
              timeout: 60_000
            })
            
            if (approvalReceipt.status === 'reverted') {
              throw new Error("Token approval failed. Please try again.")
            }
            
            console.log("Permit2 approval confirmed!")
          } else {
            console.log("Sufficient Permit2 allowance already exists")
          }
          
          setApprovingToken(false)
        } catch (approvalError) {
          setApprovingToken(false)
          console.error("Permit2 approval error:", approvalError)
          
          const approvalErrorMsg = approvalError instanceof Error ? approvalError.message : String(approvalError)
          
          if (approvalErrorMsg.includes("rejected") || approvalErrorMsg.includes("denied")) {
            throw new Error("Permit2 approval was rejected. You need to approve Permit2 to proceed with the swap.")
          }
          
          throw new Error(`Failed to approve Permit2: ${approvalErrorMsg}`)
        }
      }

      // Send transaction using Dynamic wallet
      // Using Dynamic's recommended Viem integration approach
      let txHash: string

      try {
        console.log("Getting wallet clients for transaction...")
        
        // Get Viem wallet client (works for all Dynamic wallet types)
        const walletClient = await primaryWallet.getWalletClient?.()
        
        if (!walletClient) {
          throw new Error("Unable to get wallet client. Please reconnect your wallet.")
        }

        // Prepare transaction data (may need to append Permit2 signature)
        let transactionData = txData.data as `0x${string}`
        
        // Handle Permit2 signature if needed
        if (txData.permit2 && txData.permit2.eip712) {
          console.log("Signing Permit2 EIP-712 message...")
          
          try {
            // Sign the Permit2 typed data
            const permit2Signature = await walletClient.signTypedData({
              account: primaryWallet.address as `0x${string}`,
              domain: txData.permit2.eip712.domain as any,
              types: txData.permit2.eip712.types as any,
              primaryType: txData.permit2.eip712.primaryType as string,
              message: txData.permit2.eip712.message as any
            })
            
            console.log("Permit2 signature obtained:", permit2Signature.substring(0, 20) + "...")
            
            // Calculate signature length as 32-byte hex value
            const signatureBytes = permit2Signature.slice(2) // Remove 0x prefix
            const signatureLength = signatureBytes.length / 2 // Convert hex chars to bytes
            const signatureLengthHex = signatureLength.toString(16).padStart(64, '0')
            
            // Append signature length and signature to transaction data
            // Format: originalData + signatureLength(32bytes) + signature
            transactionData = `${transactionData}${signatureLengthHex}${signatureBytes}` as `0x${string}`
            
            console.log("Appended Permit2 signature to transaction data")
            console.log("Signature length:", signatureLength, "bytes")
          } catch (signError) {
            console.error("Failed to sign Permit2 message:", signError)
            throw new Error("Failed to sign Permit2 approval. The swap requires your signature to proceed.")
          }
        } else {
          console.log("No Permit2 signature required")
        }

        console.log("Sending transaction via Dynamic walletClient...")
        
        // Prepare transaction parameters
        const txParams = {
          account: primaryWallet.address as `0x${string}`,
          to: txData.to as `0x${string}`,
          data: transactionData,
          value: BigInt(txData.value),
          gas: txData.gasLimit ? BigInt(txData.gasLimit) : undefined
        }
        
        console.log("Transaction params:", {
          to: txParams.to,
          value: txParams.value.toString(),
          gas: txParams.gas?.toString(),
          dataLength: txParams.data.length
        })
        
        // Send transaction using Viem's sendTransaction
        // This works universally for all wallet types (embedded, external, etc.)
        txHash = await walletClient.sendTransaction(txParams)
        
        console.log("Transaction sent successfully, hash:", txHash)
        
        // Optionally get public client to wait for confirmation
        try {
          const publicClient = await primaryWallet.getPublicClient?.()
          if (publicClient) {
            console.log("Waiting for transaction confirmation...")
            const receipt = await publicClient.waitForTransactionReceipt({ 
              hash: txHash,
              timeout: 60_000 // 60 seconds timeout
            })
            console.log("Transaction confirmed:", receipt.status)
          }
        } catch (confirmError) {
          // Don't throw if confirmation fails - we already have the hash
          console.warn("Could not confirm transaction:", confirmError)
        }
      } catch (swapError) {
        console.error("Swap execution error:", swapError)
        
        // Provide more specific error messages
        const errorMessage = swapError instanceof Error ? swapError.message : String(swapError)
        
        if (errorMessage.includes("User rejected") || errorMessage.includes("user rejected") || errorMessage.includes("denied")) {
          throw new Error("Transaction was rejected. Please try again if you want to proceed.")
        }
        
        if (errorMessage.includes("insufficient funds") || errorMessage.includes("insufficient balance")) {
          throw new Error("Insufficient funds to complete this swap (including gas fees).")
        }
        
        if (errorMessage.includes("gas required exceeds allowance") || errorMessage.includes("gas required")) {
          throw new Error(
            `Wrong network or insufficient gas. Please switch your wallet to ${currentNetwork === "base" ? "Base" : "Ethereum"} network and try again.`
          )
        }
        
        if (errorMessage.includes("chain mismatch") || errorMessage.includes("wrong chain")) {
          throw new Error(
            `Network mismatch. Please switch your wallet to ${currentNetwork} network.`
          )
        }

        if (errorMessage.includes("CDP API not configured")) {
          throw new Error(
            "Swap service not configured. Please contact support or check the CDP_SETUP.md file for configuration instructions."
          )
        }
        
        // Network connectivity errors
        if (
          errorMessage.includes("HTTP request failed") || 
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("fetch failed") ||
          errorMessage.includes("network request") ||
          errorMessage.toLowerCase().includes("mainnet.base.org") ||
          errorMessage.toLowerCase().includes("eth.llamarpc")
        ) {
          throw new Error(
            `Network connection error. The ${currentNetwork === "base" ? "Base" : "Ethereum"} RPC endpoint is not responding. Please:\n` +
            `1. Check your internet connection\n` +
            `2. Try switching your wallet to ${currentNetwork === "base" ? "Base" : "Ethereum"} network manually\n` +
            `3. Wait a moment and try again\n` +
            `4. If the issue persists, the network RPC might be experiencing issues`
          )
        }
        
        // Chain ID errors
        if (errorMessage.includes("eth_chainId")) {
          throw new Error(
            `Unable to verify network. Please make sure your wallet is connected to ${currentNetwork === "base" ? "Base" : "Ethereum"} network and try again.`
          )
        }
        
        // Execution reverted errors (on-chain failures)
        if (errorMessage.includes("execution reverted") || errorMessage.includes("Transaction reverted")) {
          throw new Error(
            "⚠️ Swap transaction failed on-chain. Common causes:\n\n" +
            "1. 💱 Price Slippage - Price moved too much. Try increasing slippage tolerance\n" +
            "2. ⏰ Quote Expired - The quote is stale. Close this modal and try again\n" +
            "3. 💰 Insufficient Balance - Not enough tokens (including gas)\n" +
            "4. ✅ Approval Issue - Token approval might have failed\n\n" +
            "💡 Solution: Close this modal and start a fresh swap"
          )
        }
        
        // Re-throw with original message if no specific case matched
        throw new Error(`Swap failed: ${errorMessage}`)
      }

      if (!txHash || typeof txHash !== "string") {
        throw new Error("Transaction hash not returned. Please check your wallet and try again.")
      }

      console.log("Swap transaction successful:", txHash)

      setTxHash(txHash)
      setSuccess(true)

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error("Error executing swap:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to execute swap"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [
    selectedFromToken,
    selectedToToken,
    amount,
    currentNetwork,
    primaryWallet?.address,
    onSuccess,
    availableToTokens
  ])

  const handleMax = useCallback(() => {
    if (selectedFromToken) {
      const balance = Number(selectedFromToken.amount) / 10 ** selectedFromToken.decimals
      setAmount(balance.toString())
    }
  }, [selectedFromToken])

  const selectedFromTokenBalance = useMemo(() => {
    if (!selectedFromToken) return "0"
    return formatTokenAmount(selectedFromToken.amount, selectedFromToken.decimals)
  }, [selectedFromToken])

  const estimatedOutput = useMemo(() => {
    if (!priceEstimate || !selectedToToken) return null
    const output = Number(priceEstimate.toAmount) / 10 ** selectedToToken.decimals
    return output.toFixed(6)
  }, [priceEstimate, selectedToToken])

  const minOutput = useMemo(() => {
    if (!priceEstimate || !selectedToToken) return null
    const min = Number(priceEstimate.minToAmount) / 10 ** selectedToToken.decimals
    return min.toFixed(6)
  }, [priceEstimate, selectedToToken])

  // Filter available "to" tokens (exclude from token)
  const filteredToTokens = useMemo(() => {
    if (!selectedFromToken) return availableToTokens
    
    // If from token is native ETH, exclude both ETH and WETH from "to" list
    if (selectedFromToken.address === "0x0000000000000000000000000000000000000000") {
      return availableToTokens.filter((token) => token.symbol !== "ETH" && token.symbol !== "WETH")
    }
    
    // Otherwise, exclude token with same address
    return availableToTokens.filter(
      (token) => token.address.toLowerCase() !== selectedFromToken.address.toLowerCase()
    )
  }, [availableToTokens, selectedFromToken])

  const noSupportedTokens = availableFromTokens.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border border-border p-0 overflow-hidden">
        <DialogHeader>
          <div className="px-6 pt-6">
            <DialogTitle>Swap Tokens</DialogTitle>
            <DialogDescription>
              Swap tokens on {currentNetwork === "base" ? "Base" : currentNetwork === "ethereum" ? "Ethereum" : "a supported network"}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6 pt-2">
          {success ? (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-heading font-semibold text-lg mb-2">Swap Executed!</p>
                <p className="text-sm text-foreground/50 mb-4">
                  Your swap transaction has been submitted successfully.
                </p>
                {txHash && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      const explorerUrl =
                        currentNetwork === "base"
                          ? `https://basescan.org/tx/${txHash}`
                          : `https://etherscan.io/tx/${txHash}`
                      window.open(explorerUrl, "_blank", "noopener,noreferrer")
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
              {noSupportedTokens && (
                <div className="rounded-base border border-border bg-secondary-background p-3 text-sm text-foreground/70">
                  This wallet does not have tokens on Ethereum or Base. Add funds on a supported network
                  to start swapping.
                </div>
              )}

              {/* From Token Section */}
              <div className="space-y-2">
                <Label>From</Label>
                <div className="space-y-2">
                  {/* Token Selector */}
                  <div className="relative" ref={fromTokenRef}>
                    <Button
                      variant="neutral"
                      className="w-full justify-between h-auto p-3"
                      disabled={noSupportedTokens}
                      onClick={() => !noSupportedTokens && setShowFromTokenList((openList) => !openList)}
                    >
                      {selectedFromToken ? (
                        <div className="flex items-center gap-3">
                          {selectedFromToken.token_metadata?.logo ? (
                            <Image
                              src={selectedFromToken.token_metadata.logo}
                              alt={selectedFromToken.symbol}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                              <span className="text-xs font-bold">{selectedFromToken.symbol.slice(0, 2)}</span>
                            </div>
                          )}
                          <div className="text-left">
                            <p className="font-heading font-semibold text-sm">{selectedFromToken.symbol}</p>
                            <p className="text-xs text-foreground/50">
                              {selectedFromTokenBalance} {selectedFromToken.symbol}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-foreground/50">Select token</span>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showFromTokenList && (
                      <div className="absolute z-10 w-full mt-1 bg-background border-2 border-border rounded-base shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                          {availableFromTokens.map((token) => {
                            const balance = formatTokenAmount(token.amount, token.decimals)
                            const isSelected =
                              selectedFromToken?.address === token.address &&
                              selectedFromToken?.chain_id === token.chain_id

                            return (
                              <button
                                key={`${token.chain_id}-${token.address}`}
                                type="button"
                                onClick={() => {
                                  setSelectedFromToken(token)
                                  setShowFromTokenList(false)
                                }}
                                className={`w-full p-2 rounded-base transition-all text-left flex items-center gap-2 ${
                                  isSelected
                                    ? "bg-[#00D696]/10"
                                    : "hover:bg-secondary-background"
                                }`}
                              >
                                {token.token_metadata?.logo ? (
                                  <Image
                                    src={token.token_metadata.logo}
                                    alt={token.symbol}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                                    <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-heading font-semibold text-xs">{token.symbol}</p>
                                  <p className="text-xs text-foreground/50">
                                    {balance} {token.symbol}
                                  </p>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-[#00D696]" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount Input */}
                  {selectedFromToken && (
                    <div className="relative">
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                        className="pr-20 text-lg"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleMax}
                          className="text-xs text-[#00D696] hover:text-[#00D696]/80 transition-colors font-medium"
                        >
                          MAX
                        </button>
                        <span className="text-sm font-medium text-foreground/50">
                          {selectedFromToken.symbol}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center -my-2">
                <div className="w-10 h-10 rounded-full bg-secondary-background border-2 border-border flex items-center justify-center">
                  <ArrowDownUp className="h-5 w-5 text-foreground/50" />
                </div>
              </div>

              {/* To Token Section */}
              <div className="space-y-2">
                <Label>To</Label>
                <div className="space-y-2">
                  {/* Token Selector */}
                  <div className="relative" ref={toTokenRef}>
                    <Button
                      variant="neutral"
                      className="w-full justify-between h-auto p-3"
                      disabled={!currentNetwork || filteredToTokens.length === 0}
                      onClick={() => currentNetwork && filteredToTokens.length > 0 && setShowToTokenList((openList) => !openList)}
                    >
                      {currentNetwork ? (
                        selectedToToken ? (
                          <div className="flex items-center gap-3">
                            {selectedToToken.logo ? (
                              <Image
                                src={selectedToToken.logo}
                                alt={selectedToToken.symbol}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                                <span className="text-xs font-bold">{selectedToToken.symbol.slice(0, 2)}</span>
                              </div>
                            )}
                            <div className="text-left">
                              <p className="font-heading font-semibold text-sm">{selectedToToken.symbol}</p>
                              <p className="text-xs text-foreground/50">{selectedToToken.name}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-foreground/50">Select token</span>
                        )
                      ) : (
                        <span className="text-foreground/50 text-left">
                          Select a Base or Ethereum token above first
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                    {showToTokenList && currentNetwork && filteredToTokens.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border-2 border-border rounded-base shadow-lg max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                          {filteredToTokens.map((token) => {
                            const isSelected = selectedToToken?.address === token.address

                            return (
                              <button
                                key={token.address}
                                type="button"
                                onClick={() => {
                                  setSelectedToToken(token)
                                  setShowToTokenList(false)
                                }}
                                className={`w-full p-2 rounded-base transition-all text-left flex items-center gap-2 ${
                                  isSelected ? "bg-[#00D696]/10" : "hover:bg-secondary-background"
                                }`}
                              >
                                {token.logo ? (
                                  <Image
                                    src={token.logo}
                                    alt={token.symbol}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center">
                                    <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-heading font-semibold text-xs">{token.symbol}</p>
                                  <p className="text-xs text-foreground/50">{token.name}</p>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-[#00D696]" />}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Estimated Output */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={
                        !currentNetwork
                          ? "Select a token above"
                          : estimatingPrice
                            ? "Calculating..."
                            : estimatedOutput || "0.00"
                      }
                      disabled
                      className="pr-20 text-lg bg-secondary-background"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-sm font-medium text-foreground/50">
                        {selectedToToken?.symbol || "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Estimate Info */}
              {priceEstimate && selectedToToken && (
                <div className="p-3 rounded-base border border-border bg-secondary-background space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/50">Minimum Output (1% slippage)</span>
                    <span className="font-medium">{minOutput} {selectedToToken.symbol}</span>
                  </div>
                  {!priceEstimate.liquidityAvailable && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      ⚠️ Insufficient liquidity for this swap
                    </p>
                  )}
                </div>
              )}

              {estimatingPrice && (
                <div className="flex items-center justify-center gap-2 text-sm text-foreground/50">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Estimating price...
                </div>
              )}

              {approvingToken && (
                <div className="p-3 rounded-base border border-border bg-secondary-background">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-[#00D696]" />
                    <div>
                      <p className="font-medium">Approving {selectedFromToken?.symbol}...</p>
                      <p className="text-xs text-foreground/50 mt-1">
                        Confirm the approval transaction in your wallet
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-base border border-red-500/50 bg-red-50 dark:bg-red-950">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Swap Button */}
              <Button
                variant="default"
                size="lg"
                onClick={handleSwap}
                disabled={Boolean(
                  loading ||
                  approvingToken ||
                  !selectedFromToken ||
                  !selectedToToken ||
                  !amount ||
                  !currentNetwork ||
                  !primaryWallet?.address ||
                  estimatingPrice ||
                  (priceEstimate && priceEstimate.liquidityAvailable === false)
                )}
                className="w-full gap-2"
              >
                {approvingToken ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Approving Token...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Executing Swap...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="h-5 w-5" />
                    Swap
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
