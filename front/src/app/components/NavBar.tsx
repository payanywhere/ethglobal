"use client"
import Link from "next/link"

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between bg-gray-900 text-white px-6 py-4">
      <div className="text-xl font-bold">PayAnyWhere</div>
      <ul className="flex space-x-6">
        <li>
          <Link href="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li>
          <Link href="/login" className="hover:text-gray-300">
            Dashboard
          </Link>
        </li>
      </ul>
    </nav>
  )
}
