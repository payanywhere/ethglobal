"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { usePrivy } from "@privy-io/react-auth"
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  Wallet,
  LogOut
} from "lucide-react"
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
  SidebarTrigger
} from "@/components/ui/sidebar"
import Image from "next/image"

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

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { logout } = usePrivy()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <Image
              src="/logo.svg"
              alt="PayAnyWhere Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="flex flex-col">
              <span className="font-heading text-lg">PayAnyWhere</span>
              <span className="text-xs text-foreground/50">Merchant Portal</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
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
        <SidebarFooter className="relative pb-12">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="absolute bottom-2 right-2">
            <SidebarTrigger className="h-8 w-8 border-0 bg-transparent shadow-none hover:bg-main hover:text-main-foreground" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

