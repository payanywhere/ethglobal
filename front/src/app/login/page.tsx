"use client"
import { useRouter } from "next/navigation"
import NavBar from "../components/NavBar"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login and redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <main>
      <NavBar />
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <h2 className="text-2xl font-bold mb-6">Merchant Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-64">
          <input type="email" placeholder="Email" className="border rounded p-2 text-gray-800" />
          <input
            type="password"
            placeholder="Password"
            className="border rounded p-2 text-gray-800"
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 rounded">
            Login
          </button>
        </form>
        <p className="text-gray-500 mt-4 text-sm cursor-pointer hover:text-gray-400">
          Register (mock)
        </p>
      </div>
    </main>
  )
}
