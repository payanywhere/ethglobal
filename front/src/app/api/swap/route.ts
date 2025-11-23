import { NextRequest, NextResponse } from "next/server"
import { CdpClient } from "@coinbase/cdp-sdk"

function getCdpClient(): CdpClient {
  const apiKeyId = process.env.CDP_API_KEY_APPID
  const apiKeySecret = process.env.CDP_API_KEY_SECRET  
  const walletSecret = process.env.CDP_WALLET_SECRET

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    throw new Error("Missing CDP credentials")
  }

  return new CdpClient({
    apiKeyId,
    apiKeySecret,
    walletSecret
  })
}

/**
 * GET /api/swap - Get price estimate for a swap
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromToken = searchParams.get('fromToken')
    const toToken = searchParams.get('toToken')
    const fromAmount = searchParams.get('fromAmount')
    const network = searchParams.get('network')
    const taker = searchParams.get('taker')
    const slippageBps = searchParams.get('slippageBps') || '100'

    if (!fromToken || !toToken || !fromAmount || !network || !taker) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    try {
      const cdp = getCdpClient()
      
      const priceData = await cdp.evm.getSwapPrice({
        network: network as any,
        fromToken: fromToken as `0x${string}`,
        toToken: toToken as `0x${string}`,
        fromAmount: BigInt(fromAmount),
        taker: taker as `0x${string}`
      })

      if (!priceData.liquidityAvailable) {
        return NextResponse.json({ liquidityAvailable: false })
      }

      return NextResponse.json({
        fromToken,
        fromAmount,
        toToken,
        toAmount: 'toAmount' in priceData ? priceData.toAmount.toString() : '0',
        minToAmount: 'minToAmount' in priceData ? priceData.minToAmount.toString() : '0',
        liquidityAvailable: true
      })
    } catch (cdpError) {
      console.error('CDP price estimate error:', cdpError)
      return NextResponse.json({
        error: 'Price estimate failed',
        message: cdpError instanceof Error ? cdpError.message : 'Unknown error',
        liquidityAvailable: false
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in price estimate:', error)
    return NextResponse.json(
      { error: 'Price estimate failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/swap - Create swap quote with Permit2
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fromToken, toToken, fromAmount, network, slippageBps, taker } = body

    if (!fromToken || !toToken || !fromAmount || !network || !taker) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const cdp = getCdpClient()
      
      console.log('Requesting CDP swap quote for taker:', taker)
      
      // Use createSwapQuote directly with the user's wallet address as taker
      // This ensures the swapped tokens go to the USER's wallet, not a CDP account!
      const swapQuote = await cdp.evm.createSwapQuote({
        network: network as any,
        fromToken: fromToken as `0x${string}`,
        toToken: toToken as `0x${string}`,
        fromAmount: BigInt(fromAmount),
        taker: taker as `0x${string}`, // USER'S WALLET ADDRESS - receives the output tokens!
        slippageBps: parseInt(slippageBps) || 100
      })
      
      if (!swapQuote || typeof swapQuote !== 'object') {
        return NextResponse.json({
          error: "Invalid swap quote"
        }, { status: 500 })
      }
      
      // Extract transaction data
      const transactionData: any = {
        liquidityAvailable: true
      }
      
      if ('transaction' in swapQuote && swapQuote.transaction) {
        const tx = swapQuote.transaction as any
        transactionData.to = tx.to || ""
        transactionData.data = tx.data || ""
        transactionData.value = tx.value ? String(tx.value) : "0"
        transactionData.gasLimit = tx.gasLimit ? String(tx.gasLimit) : (tx.gas ? String(tx.gas) : undefined)
      }
      
      if ('toAmount' in swapQuote) {
        transactionData.toAmount = String(swapQuote.toAmount)
      }
      if ('minToAmount' in swapQuote) {
        transactionData.minToAmount = String(swapQuote.minToAmount)
      }
      if ('liquidityAvailable' in swapQuote) {
        transactionData.liquidityAvailable = swapQuote.liquidityAvailable
      }
      
      // Include Permit2 data if present
      if ('permit2' in swapQuote && swapQuote.permit2) {
        console.log('Permit2 data included in swap quote')
        transactionData.permit2 = swapQuote.permit2
      }
      
      return NextResponse.json(transactionData)
      
    } catch (cdpError) {
      console.error('CDP swap quote error:', cdpError)
      return NextResponse.json({
        error: 'Swap quote failed',
        message: cdpError instanceof Error ? cdpError.message : 'Unknown error'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in swap quote:', error)
    return NextResponse.json(
      { error: 'Swap quote failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
