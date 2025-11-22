"use client"

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"

export function DynamicProvider({ children }: { children: React.ReactNode }) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || ""

  return (
    <DynamicContextProvider
      settings={{
        environmentId,
        walletConnectors: [EthereumWalletConnectors],
        appName: "PayAnyWhere",
        initialAuthenticationMode: "connect-and-sign",
        // Configure supported EVM networks
        overrides: {
          evmNetworks: [
            // Ethereum Mainnet
            {
              blockExplorerUrls: ["https://etherscan.io/"],
              chainId: 1,
              chainName: "Ethereum Mainnet",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/eth.svg"],
              name: "Ethereum",
              nativeCurrency: {
                decimals: 18,
                name: "Ether",
                symbol: "ETH"
              },
              networkId: 1,
              rpcUrls: ["https://eth.llamarpc.com"],
              vanityName: "Ethereum"
            },
            // Binance Smart Chain
            {
              blockExplorerUrls: ["https://bscscan.com/"],
              chainId: 56,
              chainName: "BNB Smart Chain",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/bsc.svg"],
              name: "BNB Chain",
              nativeCurrency: {
                decimals: 18,
                name: "BNB",
                symbol: "BNB"
              },
              networkId: 56,
              rpcUrls: ["https://bsc-dataseed.binance.org/"],
              vanityName: "BSC"
            },
            // Polygon
            {
              blockExplorerUrls: ["https://polygonscan.com/"],
              chainId: 137,
              chainName: "Polygon Mainnet",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/polygon.svg"],
              name: "Polygon",
              nativeCurrency: {
                decimals: 18,
                name: "MATIC",
                symbol: "MATIC"
              },
              networkId: 137,
              rpcUrls: ["https://polygon-rpc.com/"],
              vanityName: "Polygon"
            },
            // Arbitrum
            {
              blockExplorerUrls: ["https://arbiscan.io/"],
              chainId: 42161,
              chainName: "Arbitrum One",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/arbitrum.svg"],
              name: "Arbitrum",
              nativeCurrency: {
                decimals: 18,
                name: "Ether",
                symbol: "ETH"
              },
              networkId: 42161,
              rpcUrls: ["https://arb1.arbitrum.io/rpc"],
              vanityName: "Arbitrum"
            },
            // Optimism
            {
              blockExplorerUrls: ["https://optimistic.etherscan.io/"],
              chainId: 10,
              chainName: "Optimism",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/optimism.svg"],
              name: "Optimism",
              nativeCurrency: {
                decimals: 18,
                name: "Ether",
                symbol: "ETH"
              },
              networkId: 10,
              rpcUrls: ["https://mainnet.optimism.io"],
              vanityName: "Optimism"
            },
            // Base
            {
              blockExplorerUrls: ["https://basescan.org/"],
              chainId: 8453,
              chainName: "Base",
              iconUrls: ["https://app.dynamic.xyz/assets/networks/base.svg"],
              name: "Base",
              nativeCurrency: {
                decimals: 18,
                name: "Ether",
                symbol: "ETH"
              },
              networkId: 8453,
              rpcUrls: ["https://mainnet.base.org"],
              vanityName: "Base"
            }
          ]
        }
      }}
    >
      {children}
    </DynamicContextProvider>
  )
}

