"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { queryClient, wagmiAdapter } from "@/lib/reown-config"

export function ReownProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
