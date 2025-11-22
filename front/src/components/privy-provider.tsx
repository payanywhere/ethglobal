"use client"

import { PrivyProvider } from "@privy-io/react-auth"

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["email", "google", "twitter", "discord", "github"],
        appearance: {
          theme: "light",
          accentColor: "#00D696",
          logo: "/logo.png",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

