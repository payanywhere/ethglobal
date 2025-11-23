declare module "@dynamic-labs/sdk-react-core" {
  import type { ReactNode } from "react"

  interface DynamicContextSettings {
    environmentId: string
    walletConnectors?: unknown[]
    appName?: string
    [key: string]: unknown
  }

  interface DynamicContextProviderProps {
    settings: DynamicContextSettings
    children?: ReactNode
  }

  export const DynamicContextProvider: (props: DynamicContextProviderProps) => JSX.Element

  export function useDynamicContext(): {
    primaryWallet?: {
      address?: string
      id?: string
      walletId?: string
      connector?: {
        getProvider?: () => Promise<{
          request?: (args: { method: string; params?: unknown[] }) => Promise<string>
        }>
        switchNetwork?: (params: { networkChainId: number }) => Promise<void>
        sendTransaction?: (params: {
          to: string
          data?: string
          value?: string
          gas?: string
        }) => Promise<string>
      }
      sendBalance?: (params: {
        amount: string
        toAddress: string
        token?: {
          address: string
          decimals: number
        }
      }) => Promise<string>
      sendTransaction?: (params: {
        to: string
        data?: string
        value?: string
        gas?: string
      }) => Promise<string>
      getWalletClient?: () => Promise<any>
      getPublicClient?: () => Promise<any>
    } | null
    isAuthenticated: boolean
    isAuthLoading: boolean
    sdkHasLoaded: boolean
    handleLogOut: () => Promise<void>
    setShowAuthFlow: (open: boolean) => void
    setShowLinkNewWalletModal: (open: boolean) => void
  }
  
  export function useIsLoggedIn(): boolean
}

declare module "@dynamic-labs/ethereum" {
  export const EthereumWalletConnectors: unknown
}

