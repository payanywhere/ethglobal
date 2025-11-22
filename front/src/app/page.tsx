import NavBar from "./components/NavBar"

export default function Home() {
  return (
    <main>
      <NavBar />
      <section className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to PayAnyWhere</h1>
        <p className="text-lg text-gray-600">Hybrid payments for global crypto events.</p>
      </section>
    </main>
  )
}
