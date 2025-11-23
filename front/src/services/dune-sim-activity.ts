/**
 * Dune Sim Activity API Service
 * Documentation: https://docs.sim.dune.com/evm/activity
 */

export interface ActivityItem {
  chain_id: number
  block_number: number
  block_time: string
  tx_hash: string
  type: string // 'transfer', 'call', 'mint', 'receive', 'send', 'swap', 'approve', etc.
  asset_type: string // 'native', 'erc20', 'erc721', 'erc1155'
  token_address?: string
  from?: string
  to?: string
  value?: string
  value_usd?: number
  id?: string // Token ID for NFTs
  spender?: string
  token_metadata?: {
    symbol?: string
    decimals?: number
    name?: string
    logo?: string
    price_usd?: number
    pool_size?: number
    standard?: string
  }
  function?: {
    signature?: string
    name?: string
    inputs?: Array<{
      name: string
      type: string
      value: string
    }>
  }
  contract_metadata?: {
    name?: string
  }
  // For swaps
  from_token_address?: string
  from_token_value?: string
  from_token_metadata?: {
    symbol?: string
    decimals?: number
    name?: string
    logo?: string
  }
  to_token_address?: string
  to_token_value?: string
  to_token_metadata?: {
    symbol?: string
    decimals?: number
    name?: string
    logo?: string
  }
}

export interface ActivityResponse {
  activity: ActivityItem[]
  next_offset?: string
  request_time: string
  response_time: string
}

export interface FetchActivityOptions {
  chainIds?: string // e.g., "1,8543" or "mainnet,testnet"
  offset?: string
  limit?: number // Max 100, default 20
}

/**
 * Fetch wallet activity via our backend API
 * This ensures the Dune Sim API key is kept secure on the server
 */
export async function fetchWalletActivity(
  address: string,
  options: FetchActivityOptions = {}
): Promise<ActivityResponse> {
  const params = new URLSearchParams({
    address
  })

  if (options.chainIds) {
    params.append("chain_ids", options.chainIds)
  }

  if (options.offset) {
    params.append("offset", options.offset)
  }

  if (options.limit) {
    params.append("limit", String(Math.min(options.limit, 100)))
  }

  const url = `/api/activity?${params.toString()}`

  const response = await fetch(url, {
    cache: "no-store" // Always get fresh activity
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.error || `Failed to fetch activity: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  return data
}

/**
 * Format activity item for display
 */
export function formatActivityValue(item: ActivityItem): string {
  if (!item.value || !item.token_metadata?.decimals) {
    return "0"
  }

  const value = Number(item.value) / 10 ** item.token_metadata.decimals

  // Format large numbers with commas
  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    })
  }

  // Format smaller numbers with more precision
  if (value >= 1) {
    return value.toLocaleString("en-US", {
      maximumFractionDigits: 4,
      minimumFractionDigits: 2
    })
  }

  // Format very small numbers with more precision
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0
  })
}

/**
 * Get chain name from chain ID
 * @deprecated Use getChainName from @/constants/chains instead
 */
export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    56: "BSC",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base"
  }
  return chains[chainId] || `Chain ${chainId}`
}
