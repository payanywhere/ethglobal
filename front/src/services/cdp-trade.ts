/**
 * CDP Trade API Service
 * Documentation: https://docs.cdp.coinbase.com/trade-api/quickstart
 *
 * Supports onchain token swaps (trades) on Ethereum and Base networks.
 * Provides price estimation, swap quotes, and execution for both:
 * - Regular Accounts (EOAs)
 * - Smart Accounts (ERC-4337)
 */

import type { Account } from "@coinbase/cdp-sdk"
import { CdpClient } from "@coinbase/cdp-sdk"

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
 * Get CDP client instance
 * Creates a singleton client for reuse across requests
 *
 * Configuration via environment variables:
 * - CDP_API_KEY_APPID: Your CDP API key ID
 * - CDP_API_KEY_SECRET: Your CDP API key secret
 * - CDP_WALLET_SECRET: Your CDP wallet secret
 *
 * Get credentials from: https://portal.cdp.coinbase.com/
 */
let cdpClientInstance: CdpClient | null = null

function getCdpClient(): CdpClient {
  if (!cdpClientInstance) {
    const apiKeyId = process.env.CDP_API_KEY_APPID
    const apiKeySecret = process.env.CDP_API_KEY_SECRET
    const walletSecret = process.env.CDP_WALLET_SECRET

    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      console.warn(
        "CDP API credentials not configured. Set CDP_API_KEY_APPID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET environment variables. " +
          "Get credentials from: https://portal.cdp.coinbase.com/"
      )
    }

    cdpClientInstance = new CdpClient({
      apiKeyId: apiKeyId || "",
      apiKeySecret: apiKeySecret || "",
      walletSecret: walletSecret || ""
    })
  }
  return cdpClientInstance
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

/**
 * Create a swap quote
 *
 * Provides transaction data needed for execution. More precise than price estimation.
 * May reserve funds onchain and is strictly rate-limited.
 * Use this when ready to commit to a swap.
 *
 * @param account CDP account instance (EOA or Smart Account)
 * @param params Swap quote parameters
 * @returns Swap quote with execution method
 *
 * @example
 * ```typescript
 * const account = await cdp.evm.getOrCreateAccount({ name: "MyAccount" });
 * const quote = await createSwapQuote(account, {
 *   fromToken: "0x4200000000000000000000000000000000000006", // WETH
 *   toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // USDC
 *   fromAmount: BigInt("1000000000000000000"), // 1 WETH
 *   network: "base",
 *   slippageBps: 100 // 1% slippage
 * });
 * ```
 */
export async function createSwapQuote(
  account: Account,
  params: SwapQuoteParams
): Promise<SwapQuote> {
  validateNetwork(params.network)

  try {
    const swapQuote = await account.quoteSwap({
      network: params.network,
      toToken: params.toToken,
      fromToken: params.fromToken,
      fromAmount: params.fromAmount,
      slippageBps: params.slippageBps,
      paymasterUrl: params.paymasterUrl
    })

    return {
      toAmount: swapQuote.toAmount,
      minToAmount: swapQuote.minToAmount,
      liquidityAvailable: swapQuote.liquidityAvailable,
      execute: async () => {
        const result = await swapQuote.execute()
        return {
          transactionHash: result.transactionHash,
          userOpHash: result.userOpHash,
          isUserOperation: !!result.userOpHash
        }
      }
    }
  } catch (error) {
    console.error("Error creating swap quote:", error)
    throw new Error(
      `Failed to create swap quote: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Execute a swap using CDP account
 *
 * All-in-one method that creates a quote and executes it in a single call.
 * Convenient for simple swap operations.
 *
 * @param account CDP account instance (EOA or Smart Account)
 * @param params Swap parameters
 * @returns Execution result with transaction or user operation hash
 *
 * @example
 * ```typescript
 * const account = await cdp.evm.getOrCreateAccount({ name: "MyAccount" });
 * const result = await executeSwap(account, {
 *   fromToken: "0x4200000000000000000000000000000000000006", // WETH
 *   toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",   // USDC
 *   fromAmount: BigInt("1000000000000000000"), // 1 WETH
 *   network: "base",
 *   slippageBps: 100 // 1% slippage
 * });
 * ```
 */
export async function executeSwap(
  account: Account,
  params: SwapParams
): Promise<SwapExecutionResult> {
  validateNetwork(params.network)

  try {
    const result = await account.swap({
      network: params.network,
      toToken: params.toToken,
      fromToken: params.fromToken,
      fromAmount: params.fromAmount,
      slippageBps: params.slippageBps,
      paymasterUrl: params.paymasterUrl
    })

    return {
      transactionHash: result.transactionHash,
      userOpHash: result.userOpHash,
      isUserOperation: !!result.userOpHash
    }
  } catch (error) {
    console.error("Error executing swap:", error)
    throw new Error(
      `Failed to execute swap: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Wait for user operation completion (Smart Accounts only)
 *
 * After executing a swap with a Smart Account, wait for the user operation
 * to be mined and confirmed onchain.
 *
 * @param account CDP Smart Account instance
 * @param userOpHash User operation hash from swap execution
 * @returns Receipt with transaction hash and status
 *
 * @example
 * ```typescript
 * const result = await executeSwap(smartAccount, swapParams);
 * if (result.isUserOperation) {
 *   const receipt = await waitForUserOperation(smartAccount, result.userOpHash!);
 *   if (receipt.status === "complete") {
 *     console.log(`Swap completed: ${receipt.transactionHash}`);
 *   }
 * }
 * ```
 */
export async function waitForUserOperation(
  account: Account,
  userOpHash: string
): Promise<{
  status: "complete" | "failed" | "pending"
  transactionHash?: string
}> {
  try {
    const receipt = await account.waitForUserOperation({
      userOpHash
    })

    return {
      status: receipt.status as "complete" | "failed" | "pending",
      transactionHash: receipt.transactionHash
    }
  } catch (error) {
    console.error("Error waiting for user operation:", error)
    throw new Error(
      `Failed to wait for user operation: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Get swap transaction data for external wallets (client-side)
 *
 * For use with external wallets (e.g., Dynamic.xyz, MetaMask, etc.)
 * Calls the API endpoint which handles CDP authentication server-side
 *
 * @param params Swap parameters including taker address
 * @returns Transaction data ready to be sent
 */
export async function getSwapTransaction(params: SwapParams & { taker: string }): Promise<{
  to: string
  data: string
  value: string
  gasLimit?: string
}> {
  validateNetwork(params.network)

  try {
    const response = await fetch("/api/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fromToken: params.fromToken,
        toToken: params.toToken,
        fromAmount: params.fromAmount.toString(),
        network: params.network,
        slippageBps: params.slippageBps,
        taker: params.taker
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()

    return {
      to: data.to,
      data: data.data,
      value: data.value || "0",
      gasLimit: data.gasLimit
    }
  } catch (error) {
    console.error("Error getting swap transaction:", error)
    throw new Error(
      `Failed to get swap transaction: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Execute swap with external wallet (Dynamic.xyz, MetaMask, etc.)
 *
 * Gets transaction data from CDP and sends it using the provided wallet
 *
 * @param walletProvider Wallet provider from Dynamic.xyz or other wallet
 * @param walletAddress User's wallet address
 * @param params Swap parameters
 * @returns Transaction hash
 */
export async function executeSwapWithExternalWallet(
  walletProvider: any,
  walletAddress: string,
  params: SwapParams
): Promise<string> {
  validateNetwork(params.network)

  try {
    // Get transaction data from CDP
    const txData = await getSwapTransaction({
      ...params,
      taker: walletAddress
    })

    // Send transaction using wallet provider
    const txHash = await walletProvider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: walletAddress,
          to: txData.to,
          data: txData.data,
          value: txData.value,
          gas: txData.gasLimit ? `0x${BigInt(txData.gasLimit).toString(16)}` : undefined
        }
      ]
    })

    return txHash
  } catch (error) {
    console.error("Error executing swap with external wallet:", error)
    throw new Error(
      `Failed to execute swap: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Get or create a CDP account
 *
 * Helper function to get an existing account or create a new one.
 * NOTE: This requires CDP API credentials. Use executeSwapWithExternalWallet
 * for external wallets (Dynamic.xyz, MetaMask, etc.)
 *
 * @param accountName Unique name for the account
 * @returns CDP account instance
 */
export async function getOrCreateAccount(accountName: string): Promise<Account> {
  try {
    const cdp = getCdpClient()
    return await cdp.evm.getOrCreateAccount({ name: accountName })
  } catch (error) {
    console.error("Error getting or creating account:", error)
    throw new Error(
      `Failed to get or create account: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

/**
 * Get or create a Smart Account
 *
 * Helper function to get an existing Smart Account or create a new one.
 * Smart Accounts support gas sponsorship, batch operations, and enhanced security.
 * NOTE: This requires CDP API credentials. Use executeSwapWithExternalWallet
 * for external wallets (Dynamic.xyz, MetaMask, etc.)
 *
 * @param accountName Unique name for the account
 * @returns CDP Smart Account instance
 */
export async function getOrCreateSmartAccount(accountName: string): Promise<Account> {
  try {
    const cdp = getCdpClient()
    // Smart Accounts are created the same way as regular accounts
    // The SDK handles the Smart Account creation automatically
    return await cdp.evm.getOrCreateAccount({ name: accountName })
  } catch (error) {
    console.error("Error getting or creating Smart Account:", error)
    throw new Error(
      `Failed to get or create Smart Account: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}
