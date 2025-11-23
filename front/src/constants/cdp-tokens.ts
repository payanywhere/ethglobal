/**
 * Common token addresses for CDP Trade API
 * Supports Ethereum and Base mainnet only
 */

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logo?: string
}

/**
 * Common tokens on Ethereum mainnet
 */
export const ETHEREUM_TOKENS: TokenInfo[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/eth.svg"
  },
  {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/weth.svg"
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://cryptofonts.com/img/SVG/usdc.svg"
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logo: "https://cryptofonts.com/img/SVG/usdt.svg"
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/dai.svg"
  },
  {
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    decimals: 8,
    logo: "https://cryptofonts.com/img/SVG/wbtc.svg"
  },
  {
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    symbol: "LINK",
    name: "Chainlink",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/link.svg"
  },
  {
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/matic.svg"
  }
]

/**
 * Common tokens on Base mainnet
 */
export const BASE_TOKENS: TokenInfo[] = [
  {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/eth.svg"
  },
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/weth.svg"
  },
  {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: "https://cryptofonts.com/img/SVG/usdc.svg"
  },
  {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/dai.svg"
  },
  {
    address: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
    symbol: "cbETH",
    name: "Coinbase Wrapped Staked ETH",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/cbeth.svg"
  },
  {
    address: "0x63706e401c06ac8513145b7687A14804d17f814b",
    symbol: "AAVE",
    name: "Aave",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/aave.svg"
  },
  {
    address: "0x532f27101965dd16442E59d40670FaF5eBB142E4",
    symbol: "BRETT",
    name: "Brett",
    decimals: 18,
    logo: "https://cryptofonts.com/img/SVG/brett.svg"
  }
]

/**
 * Get token list for a specific network
 */
export function getTokensForNetwork(network: "ethereum" | "base"): TokenInfo[] {
  return network === "ethereum" ? ETHEREUM_TOKENS : BASE_TOKENS
}

/**
 * Get token info by address and network
 */
export function getTokenInfo(
  address: string,
  network: "ethereum" | "base"
): TokenInfo | undefined {
  const tokens = getTokensForNetwork(network)
  return tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}

/**
 * Get native token address for a network
 */
export function getNativeTokenAddress(network: "ethereum" | "base"): string {
  return "0x0000000000000000000000000000000000000000"
}

