"use client"
import Image from "next/image"
import Link from "next/link"

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between p-8 mb-8">
      <Link
        href="/"
        className="flex items-center gap-3 text-xl font-heading text-foreground hover:opacity-80 transition-opacity"
      >
        <Image src="/logo.svg" alt="PayAnyWhere Logo" width={32} height={32} className="w-8 h-8" />
        <span>PayAnyWhere</span>
      </Link>
    </nav>
  )
}
