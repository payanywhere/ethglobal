"use client"

import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { QueryClient } from "@tanstack/react-query"
import { arbitrum, base, mainnet, optimism, polygon } from "viem/chains"

// Get project ID from environment variables
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ""

if (!projectId) {
  console.warn("NEXT_PUBLIC_REOWN_PROJECT_ID is not set")
}

// Define the chains you want to support
export const chains = [mainnet, arbitrum, polygon, base, optimism]

// Create Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: chains as any
})

// Create Query Client
export const queryClient = new QueryClient()

// Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: chains as any,
  projectId,
  metadata: {
    name: "PayAnyWhere",
    description: "Enabling merchants to accept crypto anywhere in the world.",
    url: "https://payanywhere.app",
    icons: ["https://avatars.githubusercontent.com/u/179229932"]
  },
  features: {
    analytics: true,
    email: true,
    socials: ["google", "x", "github", "discord"],
    emailShowWallets: true
  },
  themeMode: "light",
  themeVariables: {
    "--w3m-accent": "#00D696",
    "--w3m-border-radius-master": "8px"
  }
})
