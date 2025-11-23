/**
 * CDP Trade API Service
 * Documentation: https://docs.cdp.coinbase.com/trade-api/quickstart
 *
 * Supports onchain token swaps (trades) on Ethereum and Base networks.
 * Provides price estimation, swap quotes, and execution for both:
 * - Regular Accounts (EOAs)
 * - Smart Accounts (ERC-4337)
 */

/**
 * CDP-supported networks
 * Beta launch supports Ethereum and Base mainnet only
 */
export type CdpSupportedNetwork = "ethereum" | "base"

/**
 * Swap price estimation result
 * Used for UI displays, real-time rates, and liquidity checks
 */
export interface SwapPriceEstimate {
  /** Amount of tokens you'll receive */
  toAmount: bigint
  /** Minimum amount after slippage protection */
  minToAmount: bigint
  /** Whether sufficient liquidity is available */
  liquidityAvailable: boolean
}

/**
 * Swap quote result
 * Used for pre-execution, approvals, and custom handling
 * May reserve funds onchain and is rate-limited
 */
export interface SwapQuote {
  /** Expected output amount */
  toAmount: bigint
  /** Minimum output amount after slippage */
  minToAmount: bigint
  /** Whether sufficient liquidity is available */
  liquidityAvailable: boolean
  /** Execute the swap using this quote */
  execute: () => Promise<SwapExecutionResult>
}

/**
 * Swap execution result
 */
export interface SwapExecutionResult {
  /** Transaction hash (for EOAs) or user operation hash (for Smart Accounts) */
  transactionHash?: string
  userOpHash?: string
  /** Whether this is a Smart Account user operation */
  isUserOperation: boolean
}

/**
 * Swap parameters for price estimation
 */
export interface SwapPriceParams {
  /** Source token contract address */
  fromToken: string
  /** Destination token contract address */
  toToken: string
  /** Amount to swap (in token's smallest unit, e.g., wei) */
  fromAmount: bigint
  /** Network to execute on */
  network: CdpSupportedNetwork
  /** Taker address (EOA or Smart Account) */
  taker: string
}

/**
 * Swap quote parameters
 */
export interface SwapQuoteParams {
  /** Source token contract address */
  fromToken: string
  /** Destination token contract address */
  toToken: string
  /** Amount to swap (in token's smallest unit) */
  fromAmount: bigint
  /** Network to execute on */
  network: CdpSupportedNetwork
  /** Slippage tolerance in basis points (100 = 1%) */
  slippageBps: number
  /** Optional paymaster URL for gas sponsorship (Smart Accounts only) */
  paymasterUrl?: string
}

/**
 * All-in-one swap parameters
 */
export interface SwapParams extends SwapQuoteParams {
  /** Optional paymaster URL for gas sponsorship */
  paymasterUrl?: string
}

/**
 * Map chain ID to CDP network name
 * CDP Trade API currently supports Ethereum and Base mainnet only
 */
export function getCdpNetwork(chainId: number): CdpSupportedNetwork | null {
  const networkMap: Record<number, CdpSupportedNetwork> = {
    1: "ethereum",
    8453: "base"
  }
  return networkMap[chainId] || null
}

/**
 * Check if a chain ID is supported by CDP Trade API
 */
export function isCdpSupportedChain(chainId: number): boolean {
  return getCdpNetwork(chainId) !== null
}

/**
 * Validate network is supported by CDP Trade API
 */
function validateNetwork(network: string): asserts network is CdpSupportedNetwork {
  if (network !== "ethereum" && network !== "base") {
    throw new Error(
      `Unsupported network: ${network}. CDP Trade API currently supports "ethereum" and "base" mainnet only.`
    )
  }
}

/**
 * Estimate swap price
 *
 * Provides quick estimates for UI displays, real-time rates, and liquidity checks.
 * Does NOT reserve funds and may be less precise than creating a swap quote.
 * Suitable for frequent price updates.
 *
 * @param params Swap parameters
 * @returns Price estimate with output amounts and liquidity status
 *
 * @example
 * ```typescript
 * const estimate = await estimateSwapPrice({
 *   fromToken: "0x4200000000000000000000000000000000000006", // WETH
 *   toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // USDC
 *   fromAmount: BigInt("1000000000000000000"), // 1 WETH
 *   network: "base",
 *   taker: "0x1234..."
 * });
 * ```
 */
export async function estimateSwapPrice(params: SwapPriceParams): Promise<SwapPriceEstimate> {
  validateNetwork(params.network)

  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount.toString(),
      network: params.network,
      taker: params.taker
    })

    // Call our backend API which handles CDP authentication
    const response = await fetch(`/api/swap?${queryParams.toString()}`, {
      method: "GET",
      cache: "no-store" // Always get fresh prices
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to get price estimate: ${response.status}`)
    }

    const priceData = await response.json()

    // Return formatted price estimate
    return {
      toAmount: BigInt(priceData.toAmount || "0"),
      minToAmount: BigInt(priceData.minToAmount || "0"),
      liquidityAvailable: priceData.liquidityAvailable !== false
    }
  } catch (error) {
    console.error("Error estimating swap price:", error)
    throw new Error(
      `Failed to estimate swap price: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}
