import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "next-themes"
import { DynamicProvider } from "@/components/dynamic-provider"
import "./globals.css"

/* Satoshi Font */
const SATOSHI = localFont({
  src: "./Satoshi-Variable.ttf",
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["Satoshi", "SF Pro", "system-ui", "arial"]
})

export const metadata: Metadata = {
  title: "PayAnyWhere",
  description: "Enabling merchants to accept crypto anywhere in the world."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${SATOSHI.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <DynamicProvider>{children}</DynamicProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
