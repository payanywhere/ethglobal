"use client"

import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import NavBar from "../components/NavBar"

export default function LoginPage() {
  const { isAuthenticated, isAuthLoading, sdkHasLoaded, setShowAuthFlow } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const router = useRouter()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (sdkHasLoaded && !isAuthLoading && (isAuthenticated || isLoggedIn)) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoggedIn, isAuthLoading, sdkHasLoaded, router])

  // Show loading while SDK is initializing
  if (!sdkHasLoaded || isAuthLoading) {
    return (
      <main className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-foreground">Loading...</div>
        </div>
      </main>
    )
  }

  // If already authenticated, show loading while redirecting
  if (isAuthenticated || isLoggedIn) {
    return (
      <main className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-foreground">Redirecting...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md border-2 border-border bg-secondary-background shadow-shadow p-8 space-y-6">
          <h1 className="text-4xl font-heading text-foreground mb-2">Merchant Login</h1>
          <p className="text-foreground/70 mb-6">Sign in to access your dashboard</p>

          <Button
            type="button"
            variant="default"
            className="w-full min-h-12 text-base font-bold"
            onClick={() => setShowAuthFlow(true)}
          >
            Sign In
          </Button>

          <p className="text-xs text-foreground/50 text-center mt-6">
            By continuing, you agree to PayAnyWhere&apos;s Terms of Service
          </p>
        </div>
      </div>
    </main>
  )
}
