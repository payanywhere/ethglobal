import { encodeAbiParameters, isAddress, padHex, zeroAddress, type Address, type Hex } from "viem"
import type { PublicClient, WalletClient } from "viem"
import { Options } from "@layerzerolabs/lz-v2-utilities"
import { DESTINATION_ADDRESS, ENDPOINT_ID, getOFTAddressByChainId } from "@/constants/lz-config"

const DEFAULT_MERCHANT_ADDRESS = "0xf080d5b40C370a5148a9848A869eb3Aaf7d5E146" as Address

const STARGATE_POOL_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "dstEid", type: "uint32" },
          { internalType: "bytes32", name: "to", type: "bytes32" },
          { internalType: "uint256", name: "amountLD", type: "uint256" },
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "bytes", name: "extraOptions", type: "bytes" },
          { internalType: "bytes", name: "composeMsg", type: "bytes" },
          { internalType: "bytes", name: "oftCmd", type: "bytes" }
        ],
        internalType: "struct SendParam",
        name: "_sendParam",
        type: "tuple"
      }
    ],
    name: "quoteOFT",
    outputs: [
      { internalType: "uint256", name: "amountSentLD", type: "uint256" },
      { internalType: "uint256", name: "amountReceivedLD", type: "uint256" },
      {
        components: [
          { internalType: "uint256", name: "dstPriceRatio", type: "uint256" },
          { internalType: "uint256", name: "dstGasPriceInToken", type: "uint256" },
          { internalType: "uint256", name: "srcPoolSizeLD", type: "uint256" },
          { internalType: "uint256", name: "dstPoolSizeLD", type: "uint256" },
          { internalType: "uint256", name: "dstImBalance", type: "uint256" },
          { internalType: "uint256", name: "amountReceivedLD", type: "uint256" }
        ],
        internalType: "struct OFTReceipt",
        name: "receipt",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "dstEid", type: "uint32" },
          { internalType: "bytes32", name: "to", type: "bytes32" },
          { internalType: "uint256", name: "amountLD", type: "uint256" },
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "bytes", name: "extraOptions", type: "bytes" },
          { internalType: "bytes", name: "composeMsg", type: "bytes" },
          { internalType: "bytes", name: "oftCmd", type: "bytes" }
        ],
        internalType: "struct SendParam",
        name: "_sendParam",
        type: "tuple"
      },
      { internalType: "bool", name: "_payInLzToken", type: "bool" }
    ],
    name: "quoteSend",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "nativeFee", type: "uint256" },
          { internalType: "uint256", name: "lzTokenFee", type: "uint256" }
        ],
        internalType: "struct MessagingFee",
        name: "fee",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint32", name: "dstEid", type: "uint32" },
          { internalType: "bytes32", name: "to", type: "bytes32" },
          { internalType: "uint256", name: "amountLD", type: "uint256" },
          { internalType: "uint256", name: "minAmountLD", type: "uint256" },
          { internalType: "bytes", name: "extraOptions", type: "bytes" },
          { internalType: "bytes", name: "composeMsg", type: "bytes" },
          { internalType: "bytes", name: "oftCmd", type: "bytes" }
        ],
        internalType: "struct SendParam",
        name: "_sendParam",
        type: "tuple"
      },
      {
        components: [
          { internalType: "uint256", name: "nativeFee", type: "uint256" },
          { internalType: "uint256", name: "lzTokenFee", type: "uint256" }
        ],
        internalType: "struct MessagingFee",
        name: "_fee",
        type: "tuple"
      },
      { internalType: "address", name: "_refundAddress", type: "address" }
    ],
    name: "send",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const

const ERC20_ABI = [
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

type SendParamStruct = {
  dstEid: number
  to: Hex
  amountLD: bigint
  minAmountLD: bigint
  extraOptions: Hex
  composeMsg: Hex
  oftCmd: Hex
}

type MessagingFeeStruct = {
  nativeFee: bigint
  lzTokenFee: bigint
}

export interface SendStargatePaymentArgs {
  account: Address
  amountLD: bigint
  chainId: number
  walletClient: WalletClient
  publicClient: PublicClient
  refundAddress?: Address
  destinationComposer?: Address
  tokenReceiver?: Address
  payInLzToken?: boolean
  composeGasLimit?: bigint
  extraOptions?: Hex
}

function encodeAddressToBytes32(address: Address): Hex {
  return padHex(address, { size: 32 })
}

/**
 * Build LayerZero v2 extraOptions for lzCompose
 * Using the official LayerZero utilities library (same as Hardhat example)
 */
function buildComposeOptions(composeIndex: number, gasLimit: string, value: string = "0"): Hex {
  const extraOptions = Options.newOptions()
    .addExecutorComposeOption(
      composeIndex,
      gasLimit,
      value
    )
    .toHex()
  
  return extraOptions as Hex
}

// Helper function to check if receipt is an object with amountReceivedLD (following Hardhat example)
const isReceiptObject = (value: unknown): value is { amountReceivedLD?: bigint } => {
  if (!value || typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as { amountReceivedLD?: unknown }
  if (!("amountReceivedLD" in candidate)) {
    return false
  }

  const { amountReceivedLD } = candidate
  return amountReceivedLD === undefined || typeof amountReceivedLD === "bigint"
}

// Helper function to extract amount from array (following Hardhat example)
const getAmountFromArray = (values: unknown[]): bigint | undefined => {
  const candidate = values[1] ?? values[0]
  return typeof candidate === "bigint" ? candidate : undefined
}

export async function sendStargatePayment({
  account,
  amountLD,
  chainId,
  walletClient,
  publicClient,
  refundAddress: _refundAddress,
  destinationComposer,
  tokenReceiver: _tokenReceiver,
  payInLzToken = false,
  composeGasLimit,
  extraOptions
}: SendStargatePaymentArgs) {
  if (amountLD <= BigInt(0)) {
    throw new Error("Amount must be greater than zero")
  }

  const srcOftAddress = getOFTAddressByChainId(chainId)
  if (!srcOftAddress || !isAddress(srcOftAddress)) {
    throw new Error(`No Stargate pool configured for chain ${chainId}`)
  }

  const composerAddress = destinationComposer ?? (DESTINATION_ADDRESS as Address | undefined)
  if (!composerAddress || !isAddress(composerAddress)) {
    throw new Error("Destination composer address is not configured")
  }

  const dstEid = Number(ENDPOINT_ID)
  if (!Number.isSafeInteger(dstEid)) {
    throw new Error(`dstEid must be a safe integer: got ${ENDPOINT_ID}`)
  }

  // Set refundAddress to merchant if not provided
  const refundAddress = _refundAddress ?? DEFAULT_MERCHANT_ADDRESS

  // Determine the token receiver - use provided tokenReceiver or default to merchant
  const tokenReceiver = _tokenReceiver && isAddress(_tokenReceiver) 
    ? (_tokenReceiver as Address) 
     : DEFAULT_MERCHANT_ADDRESS

  // 1. Build compose message payload expected by Composer (address)
  // Following Hardhat example: only encode the receiver address
  const composeMsg = encodeAbiParameters(
    [{ type: "address" }],
    [tokenReceiver]
  ) as Hex

  // Build extraOptions for lzCompose (following Hardhat example pattern)
  // Default gas limit is 395000 (same as Hardhat example)
  const resolvedComposeGasLimit = composeGasLimit ?? BigInt(395000)
  const resolvedExtraOptions = extraOptions ?? buildComposeOptions(
    0, // compose index
    resolvedComposeGasLimit.toString(),
    "0" // no native drop
  )

  // 2. Assemble initial SendParam tuple (minAmountLD will be filled after quoteOFT)
  const to = encodeAddressToBytes32(composerAddress as Address)
  const sendParam: SendParamStruct = {
    dstEid,
    to,
    amountLD,
    minAmountLD: BigInt(0), // Will be updated after quoteOFT
    extraOptions: resolvedExtraOptions,
    composeMsg,
    oftCmd: "0x"
  }

  // 3. Call quoteOFT
  const quoteResult = await publicClient.readContract({
    address: srcOftAddress as Address,
    abi: STARGATE_POOL_ABI,
    functionName: "quoteOFT",
    args: [sendParam]
  })

  // quoteOFT returns [amountSentLD, amountReceivedLD, receipt]
  const [amountSentLD, amountReceivedLD, receipt] = quoteResult as readonly [bigint, bigint, unknown]

  console.log("quoteOFT result:", { amountSentLD, amountReceivedLD, receipt })

  // 4. Extract amountReceivedLD using the same logic as Hardhat example
  // First try the direct amountReceivedLD return value (index 1)
  let extractedAmountReceivedLD: bigint | undefined = amountReceivedLD

  // If that's not available, try extracting from receipt
  if (!extractedAmountReceivedLD || extractedAmountReceivedLD === BigInt(0)) {
    const fromReceipt = (() => {
      if (isReceiptObject(receipt)) {
        return receipt.amountReceivedLD
      }

      if (Array.isArray(receipt)) {
        return getAmountFromArray(receipt)
      }

      return undefined
    })()
    
    if (fromReceipt) {
      extractedAmountReceivedLD = fromReceipt
    }
  }

  // Final fallback to amountSentLD
  if (!extractedAmountReceivedLD || extractedAmountReceivedLD === BigInt(0)) {
    extractedAmountReceivedLD = amountSentLD
  }

  if (!extractedAmountReceivedLD) {
    throw new Error("quoteOFT returned an unexpected receipt format")
  }

  console.log("Extracted amountReceivedLD:", extractedAmountReceivedLD.toString())
  console.log("Original amountLD:", amountLD.toString())

  // Sanity check: if extracted amount is way larger than input amount (more than 10% diff), 
  // it's likely a unit mismatch or error. Fallback to amountLD with slippage.
  // Also apply a default 0.5% slippage tolerance
  const slippageBps = BigInt(50) // 0.5%
  const amountWithSlippage = (amountLD * (BigInt(10000) - slippageBps)) / BigInt(10000)
  
  // Use the smaller of the two to avoid SlippageTooHigh revert
  let finalMinAmountLD = extractedAmountReceivedLD
  
  if (extractedAmountReceivedLD > amountLD) {
    console.warn("Extracted amount > amountLD, capping at amountLD with slippage")
    finalMinAmountLD = amountWithSlippage
  } else {
    // Apply slippage to the quoted amount
    finalMinAmountLD = (extractedAmountReceivedLD * (BigInt(10000) - slippageBps)) / BigInt(10000)
  }

  console.log("Final minAmountLD used:", finalMinAmountLD.toString())

  // 5. Update minAmountLD (index 3 in the Hardhat example)
  sendParam.minAmountLD = finalMinAmountLD

  // 6. Quote send to get messaging fee
  const messagingFee = (await publicClient.readContract({
    address: srcOftAddress as Address,
    abi: STARGATE_POOL_ABI,
    functionName: "quoteSend",
    args: [sendParam, payInLzToken]
  })) as MessagingFeeStruct

  const valueToSend = messagingFee.nativeFee

  // 7. Get token address and approve if needed
  const tokenAddress = (await publicClient.readContract({
    address: srcOftAddress as Address,
    abi: STARGATE_POOL_ABI,
    functionName: "token"
  })) as Address

  // 8. Ensure ERC20 approval if stargatePool is token-based
  if (tokenAddress !== zeroAddress) {
    const currentAllowance = (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [account, srcOftAddress as Address]
    })) as bigint

    if (currentAllowance < amountLD) {
      const approvalHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [srcOftAddress as Address, amountLD],
        account,
        chain: walletClient.chain
      })

      await publicClient.waitForTransactionReceipt({ hash: approvalHash })
    }
  }

  // 9. Execute Stargate send with computed params and fees
  const txHash = await walletClient.writeContract({
    address: srcOftAddress as Address,
    abi: STARGATE_POOL_ABI,
    functionName: "send",
    args: [sendParam, messagingFee, refundAddress],
    account,
    chain: walletClient.chain,
    value: valueToSend
  })

  await publicClient.waitForTransactionReceipt({ hash: txHash })
  return txHash
}


