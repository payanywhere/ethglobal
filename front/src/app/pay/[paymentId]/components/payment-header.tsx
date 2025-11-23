import Image from "next/image"
import Link from "next/link"

export function PaymentHeader() {
  return (
    <nav className="flex items-center justify-center p-6 mb-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-heading text-foreground hover:opacity-80 transition-opacity"
      >
        <Image src="/logo.svg" alt="PayAnyWhere Logo" width={24} height={24} className="w-6 h-6" />
        <span>PayAnyWhere</span>
      </Link>
    </nav>
  )
}
