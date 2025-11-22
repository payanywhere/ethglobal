"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-border mb-8">
      <Link
        href="/"
        className="text-xl font-heading text-foreground hover:opacity-80 transition-opacity"
      >
        PayAnyWhere
      </Link>
      <section className="flex items-center gap-4">
        <Button variant={"noShadow"} className="bg-transparent text-foreground">Home</Button>
        <Button variant={"noShadow"} className="bg-transparent text-foreground">Dashboard</Button>
      </section>
    </nav>
  )
}
