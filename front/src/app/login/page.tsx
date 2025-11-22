"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import NavBar from "../components/NavBar"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const { ready, authenticated, login } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard")
    }
  }, [ready, authenticated, router])

  const handleLogin = () => {
    login()
  }

  if (!ready) {
    return (
      <main className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-foreground">Loading...</div>
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
            onClick={handleLogin}
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
