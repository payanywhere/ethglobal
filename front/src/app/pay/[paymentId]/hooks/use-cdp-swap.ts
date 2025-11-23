import { useCallback, useState } from "react"
import { usePublicClient, useWalletClient } from "wagmi"
import { erc20Abi, formatUnits, parseUnits } from "viem"
import { type CdpSupportedNetwork, estimateSwapPrice, getCdpNetwork } from "@/services/cdp-trade"
import type { TokenBalance } from "@/services/dune-sim"
import { DEFAULT_MERCHANT_ADDRESS } from "@/lib/lz/send-stargate-payment"

// USDC Addresses
const USDC_ADDRESSES: Record<CdpSupportedNetwork, string> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
}

const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3"

export function useCdpSwap() {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const getRequiredInputAmount = useCallback(async ({
    fromToken,
    toToken,
    targetAmountOut,
    network,
    address,
    decimals
  }: {
    fromToken: string
    toToken: string
    targetAmountOut: bigint
    network: CdpSupportedNetwork
    address: string
    decimals: number
  }) => {
    // Initial guess: we assume 1:1 for stablecoins or use a small amount to get price
    // Since we don't have price in this function, we'll start with a probe
    // We'll use 1 unit of fromToken to get a rate
    
    // If fromToken is ETH/WETH and target is USDC
    // 1 ETH ~ 3000 USDC.
    // If we need 10 USDC.
    // We can't easily guess without price.
    // However, the calling component usually has `token.price_usd`.
    // We can let the caller pass an initial guess, or we can probe.
    
    // Let's try to probe with a reasonable amount, e.g. 1 unit (10^decimals)
    const probeAmount = parseUnits("1", decimals)
    
    try {
      // Fix for "native" token error
      let fromTokenAddress = fromToken
      if (fromTokenAddress === "0x0000000000000000000000000000000000000000" || fromTokenAddress === "native") {
        fromTokenAddress = network === "base"
          ? "0x4200000000000000000000000000000000000006" // WETH on Base
          : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH on Ethereum
      }

      const quote = await estimateSwapPrice({
        fromToken: fromTokenAddress,
        toToken,
        fromAmount: probeAmount,
        network,
        taker: address
      })
      
      const rate = Number(quote.toAmount) / Number(probeAmount) // output per input
      
      if (rate === 0) throw new Error("Zero rate returned")
      
      // Calculate required input
      // Target = Input * Rate
      // Input = Target / Rate
      let requiredInput = BigInt(Math.floor(Number(targetAmountOut) / rate))
      
      // Add 1% buffer for safety/slippage
      requiredInput = (requiredInput * 101n) / 100n
      
      // Verify with a second quote
      const verifyQuote = await estimateSwapPrice({
        fromToken: fromTokenAddress,
        toToken,
        fromAmount: requiredInput,
        network,
        taker: address
      })
      
      if (verifyQuote.minToAmount < targetAmountOut) {
        // If still not enough (due to slippage or price impact), adjust
        const ratio = Number(targetAmountOut) / Number(verifyQuote.minToAmount)
        // Multiply by ratio and add another small buffer
        requiredInput = BigInt(Math.floor(Number(requiredInput) * ratio * 1.005))
      }
      
      return requiredInput
    } catch (error) {
      console.error("Error calculating required input:", error)
      throw error
    }
  }, [])

  const executeSwap = useCallback(async ({
    fromToken,
    fromAmount,
    network,
    address
  }: {
    fromToken: TokenBalance
    fromAmount: bigint
    network: CdpSupportedNetwork
    address: string
  }) => {
    if (!walletClient || !publicClient) throw new Error("Wallet not connected")

    setLoading(true)
    setStatus("Preparing swap...")

    try {
      const usdcAddress = USDC_ADDRESSES[network]
      let fromTokenAddress = fromToken.address
      
      // Handle Native ETH
      if (fromToken.address === "0x0000000000000000000000000000000000000000") {
        // Use WETH address for the swap quote
        fromTokenAddress = network === "base" 
          ? "0x4200000000000000000000000000000000000006"
          : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
      }

      // 1. Check Permit2 Allowance (skip for Native ETH)
      const isNative = fromToken.address === "0x0000000000000000000000000000000000000000"
      
      if (!isNative) {
        setStatus("Checking allowance...")
        const allowance = await publicClient.readContract({
          address: fromTokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address as `0x${string}`, PERMIT2_ADDRESS]
        })

        if (allowance < fromAmount) {
          setStatus("Approving token...")
          const hash = await walletClient.writeContract({
            address: fromTokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [PERMIT2_ADDRESS, fromAmount],
            account: address as `0x${string}`
          })
          await publicClient.waitForTransactionReceipt({ hash })
        }
      }

      // 2. Get Swap Quote
      setStatus("Getting swap quote...")
      const response = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromToken: fromTokenAddress,
          toToken: usdcAddress,
          fromAmount: fromAmount.toString(),
          network,
          slippageBps: 100, // 1%
          taker: address
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to get swap quote")
      }

      const txData = await response.json()

      // 3. Sign Permit2 if needed
      let transactionData = txData.data as `0x${string}`
      
      if (txData.permit2?.eip712) {
        setStatus("Signing permit...")
        const signature = await walletClient.signTypedData({
          account: address as `0x${string}`,
          domain: txData.permit2.eip712.domain,
          types: txData.permit2.eip712.types,
          primaryType: txData.permit2.eip712.primaryType,
          message: txData.permit2.eip712.message
        })
        
        const signatureLengthHex = (signature.length / 2 - 1).toString(16).padStart(64, "0")
        transactionData = `${transactionData}${signatureLengthHex}${signature.slice(2)}` as `0x${string}`
      }

      // 4. Execute Swap
      setStatus("Executing swap...")
      const swapHash = await walletClient.sendTransaction({
        account: address as `0x${string}`,
        to: txData.to as `0x${string}`,
        data: transactionData,
        value: BigInt(txData.value)
      })

      setStatus("Waiting for swap confirmation...")
      await publicClient.waitForTransactionReceipt({ hash: swapHash })

      return swapHash

    } catch (error) {
      console.error("Swap execution failed:", error)
      throw error
    } finally {
      setLoading(false)
      setStatus(null)
    }
  }, [walletClient, publicClient])

  return {
    getRequiredInputAmount,
    executeSwap,
    loading,
    status
  }
}
