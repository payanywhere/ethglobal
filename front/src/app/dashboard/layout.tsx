"use client"

import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core"
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Wallet
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { MerchantProvider, useMerchant } from "@/contexts/merchant-context"
import { useMerchantVerification } from "@/hooks/use-merchant-verification"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard"
  },
  {
    title: "Payments",
    icon: CreditCard,
    href: "/dashboard/payments"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics"
  },
  {
    title: "Wallet",
    icon: Wallet,
    href: "/dashboard/wallet"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings"
  }
]

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { handleLogOut, primaryWallet } = useDynamicContext()
  const { walletAddress } = useMerchant()

  const handleLogout = async () => {
    await handleLogOut()
    window.location.href = "/"
  }

  const displayAddress = walletAddress || primaryWallet?.address || null

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 px-2 py-2 md:py-1">
            <div className="flex items-center gap-3 md:gap-3 min-w-0">
              <Image
                src="/logo.svg"
                alt="PayAnyWhere Logo"
                width={32}
                height={32}
                className="w-8 h-8 shrink-0"
              />
              <div className="flex flex-col justify-center gap-[2px] min-w-0 h-9">
                <span className="font-heading text-base md:text-md leading-tight">PayAnyWhere</span>
                <span className="text-xs md:text-[12px] text-foreground/50 leading-tight">
                  Merchant Portal
                </span>
              </div>
            </div>
            <SidebarTrigger className="h-7 w-7 md:h-7 md:w-7 md:ml-3 border-0 bg-transparent shadow-none hover:bg-main hover:text-main-foreground p-0 shrink-0" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="mt-4">
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        {/* Mobile-only navbar */}
        <header className="flex md:hidden h-16 shrink-0 items-center justify-between gap-2 border-b-2 border-b-border px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="PayAnyWhere Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-heading text-base">PayAnyWhere</span>
          </div>
          <SidebarTrigger className="h-7 w-7 border-0 bg-transparent shadow-none hover:bg-main hover:text-main-foreground p-0">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {displayAddress && (
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <span>Address:</span>
              <span className="font-mono text-foreground">{displayAddress}</span>
            </div>
          )}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function MerchantVerificationWrapper({ children }: { children: React.ReactNode }) {
  const {
    isVerifying,
    merchantVerified,
    error: merchantError
  } = useMerchantVerification()

  // Show loading while verifying merchant
  if (isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Verificando merchant...</div>
      </div>
    )
  }

  if (merchantError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {merchantError}</div>
      </div>
    )
  }

  return <DashboardContent>{children}</DashboardContent>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading, sdkHasLoaded } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const router = useRouter()

  // Protect dashboard routes - redirect to login if not authenticated
  useEffect(() => {
    if (sdkHasLoaded && !isAuthLoading && !isAuthenticated && !isLoggedIn) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoggedIn, isAuthLoading, sdkHasLoaded, router])

  // Show loading while checking auth status
  if (!sdkHasLoaded || isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated && !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Redirecting...</div>
      </div>
    )
  }

  return (
    <MerchantProvider>
      <MerchantVerificationWrapper>{children}</MerchantVerificationWrapper>
    </MerchantProvider>
  )
}
