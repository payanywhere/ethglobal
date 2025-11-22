import { type NextRequest, NextResponse } from "next/server"

const DUNE_SIM_API_BASE = "https://api.sim.dune.com"

/**
 * GET /api/balances?address=0x...&chain_ids=1,137&exclude_spam=true&limit=100
 *
 * Serverless wrapper for Dune Sim Balances API
 * Securely handles API key on the server side
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    // Validate required parameters
    if (!address) {
      return NextResponse.json({ error: "Missing required parameter: address" }, { status: 400 })
    }

    // Validate address format (basic check)
    if (!address.startsWith("0x") || address.length !== 42) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 })
    }

    // Get API key from environment
    const apiKey = process.env.DUNE_SIM_KEY

    if (!apiKey) {
      console.error("DUNE_SIM_KEY is not configured in environment variables")
      return NextResponse.json(
        { error: "Server configuration error: API key not found" },
        { status: 500 }
      )
    }

    // Build query parameters for Dune API
    const duneParams = new URLSearchParams()

    // Optional parameters
    const chainIds = searchParams.get("chain_ids")
    if (chainIds) {
      duneParams.append("chain_ids", chainIds)
    }

    const filters = searchParams.get("filters")
    if (filters && (filters === "erc20" || filters === "native")) {
      duneParams.append("filters", filters)
    }

    const metadata = searchParams.get("metadata")
    if (metadata) {
      duneParams.append("metadata", metadata)
    }

    const excludeSpam = searchParams.get("exclude_spam_tokens")
    if (excludeSpam) {
      duneParams.append("exclude_spam_tokens", excludeSpam)
    }

    const limit = searchParams.get("limit")
    if (limit) {
      const limitNum = Number.parseInt(limit, 10)
      if (!Number.isNaN(limitNum) && limitNum > 0 && limitNum <= 1000) {
        duneParams.append("limit", String(limitNum))
      }
    }

    const offset = searchParams.get("offset")
    if (offset) {
      duneParams.append("offset", offset)
    }

    // Make request to Dune Sim API
    const duneUrl = `${DUNE_SIM_API_BASE}/v1/evm/balances/${address}?${duneParams.toString()}`

    const response = await fetch(duneUrl, {
      headers: {
        "X-Sim-Api-Key": apiKey
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Dune Sim API error: ${response.status} ${errorText}`)

      return NextResponse.json(
        {
          error: `Failed to fetch balances from Dune Sim API: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Return the data
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60"
      }
    })
  } catch (error) {
    console.error("Error in balances API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
