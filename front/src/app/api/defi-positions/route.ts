import { type NextRequest, NextResponse } from "next/server"

const DUNE_SIM_KEY = process.env.DUNE_SIM_KEY
const DUNE_API_BASE = "https://api.sim.dune.com"

export async function GET(request: NextRequest) {
  if (!DUNE_SIM_KEY) {
    return NextResponse.json({ error: "Missing Dune Sim API key" }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
  }

  // Build query parameters
  const params = new URLSearchParams()

  const chainIds = searchParams.get("chain_ids")
  if (chainIds) {
    params.append("chain_ids", chainIds)
  }

  const queryString = params.toString()
  const url = `${DUNE_API_BASE}/beta/evm/defi/positions/${address}${queryString ? `?${queryString}` : ""}`

  try {
    const response = await fetch(url, {
      headers: {
        "X-Sim-Api-Key": DUNE_SIM_KEY,
        Accept: "application/json"
      },
      next: { revalidate: 0 } // Don't cache
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Dune Sim API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Dune Sim API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching DeFi positions from Dune Sim:", error)
    return NextResponse.json(
      { error: "Failed to fetch DeFi positions from Dune Sim API" },
      { status: 500 }
    )
  }
}
