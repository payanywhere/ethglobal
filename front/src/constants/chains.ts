/**
 * Supported chains configuration
 * Based on Dune Sim default chains
 */

export interface ChainConfig {
  name: string
  chain_id: number
  tags: string[]
  explorer_url: string
  rpc_url?: string
}

/**
 * Chains supported by Dune Sim DeFi Positions API (default tag)
 * These chains have full DeFi position support
 */
export const DEFI_SUPPORTED_CHAINS: ChainConfig[] = [
  {
    name: "ethereum",
    chain_id: 1,
    tags: ["default", "mainnet"],
    explorer_url: "https://etherscan.io",
    rpc_url: "https://eth.llamarpc.com"
  },
  {
    name: "optimism",
    chain_id: 10,
    tags: ["default"],
    explorer_url: "https://optimistic.etherscan.io"
  },
  {
    name: "world",
    chain_id: 480,
    tags: ["default"],
    explorer_url: "https://worldscan.org"
  },
  {
    name: "base",
    chain_id: 8453,
    tags: ["default"],
    explorer_url: "https://basescan.org",
    rpc_url: "https://base-rpc.publicnode.com"
  },
  {
    name: "mode",
    chain_id: 34443,
    tags: ["default"],
    explorer_url: "https://explorer.mode.network"
  },
  {
    name: "arbitrum",
    chain_id: 42161,
    tags: ["default"],
    explorer_url: "https://arbiscan.io"
  },
  {
    name: "ink",
    chain_id: 57073,
    tags: ["default"],
    explorer_url: "https://explorer.inkonchain.com"
  },
  {
    name: "bob",
    chain_id: 60808,
    tags: ["default"],
    explorer_url: "https://explorer.gobob.xyz"
  },
  {
    name: "base_sepolia",
    chain_id: 84532,
    tags: ["default", "testnet"],
    explorer_url: "https://sepolia.basescan.org"
  },
  {
    name: "zora",
    chain_id: 7777777,
    tags: ["default"],
    explorer_url: "https://explorer.zora.energy"
  },
  {
    name: "shape",
    chain_id: 360,
    tags: ["default"],
    explorer_url: "https://shapescan.xyz"
  },
  {
    name: "soneium",
    chain_id: 1868,
    tags: ["default"],
    explorer_url: "https://soneium.org/explorer"
  },
  {
    name: "unichain",
    chain_id: 130,
    tags: ["default"],
    explorer_url: "https://unichain-sepolia.blockscout.com"
  }
]

/**
 * Additional chains with limited DeFi support
 * These chains are supported by Dune Sim but may not have DeFi positions
 */
export const ADDITIONAL_CHAINS: ChainConfig[] = [
  {
    name: "polygon",
    chain_id: 137,
    tags: [],
    explorer_url: "https://polygonscan.com"
  },
  {
    name: "bsc",
    chain_id: 56,
    tags: [],
    explorer_url: "https://bscscan.com"
  },
  {
    name: "avalanche",
    chain_id: 43114,
    tags: [],
    explorer_url: "https://snowtrace.io"
  },
  {
    name: "fantom",
    chain_id: 250,
    tags: [],
    explorer_url: "https://ftmscan.com"
  },
  {
    name: "gnosis",
    chain_id: 100,
    tags: [],
    explorer_url: "https://gnosisscan.io"
  },
  {
    name: "celo",
    chain_id: 42220,
    tags: [],
    explorer_url: "https://celoscan.io"
  }
]

/**
 * All supported chains
 */
export const ALL_CHAINS = [...DEFI_SUPPORTED_CHAINS, ...ADDITIONAL_CHAINS]

/**
 * Get chain config by chain ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return ALL_CHAINS.find((chain) => chain.chain_id === chainId)
}

/**
 * Get chain name by chain ID
 */
export function getChainName(chainId: number): string {
  const chain = getChainConfig(chainId)
  return chain?.name || `Chain ${chainId}`
}

/**
 * Get explorer URL by chain ID
 */
export function getExplorerUrl(chainId: number): string {
  const chain = getChainConfig(chainId)
  return chain?.explorer_url || "https://etherscan.io"
}

/**
 * Check if chain supports DeFi positions
 */
export function isDefiSupportedChain(chainId: number): boolean {
  return DEFI_SUPPORTED_CHAINS.some((chain) => chain.chain_id === chainId)
}

/**
 * Get chain IDs that support DeFi positions
 */
export function getDefiSupportedChainIds(): number[] {
  return DEFI_SUPPORTED_CHAINS.map((chain) => chain.chain_id)
}

/**
 * Get all known chain IDs (DeFi-supported + additional chains)
 * Useful for balance lookups where we want broad coverage
 */
export function getAllChainIds(): number[] {
  return ALL_CHAINS.map((chain) => chain.chain_id)
}
