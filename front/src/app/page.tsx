import { Button } from "@/components/ui/button"
import NavBar from "./components/NavBar"
import Image from "next/image"
import Marquee from "@/components/ui/marquee"

const paymentBenefits = [
  "Global Payments",
  "Crypto & Fiat",
  "Low Fees",
  "Fast Transactions",
  "Secure & Safe",
  "Easy Integration",
  "Multi-Currency",
  "Instant Processing",
  "24/7 Support",
]

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <NavBar />
      <section className="w-full min-h-[50vh] flex flex-col md:flex-row items-center h-[calc(100vh-250px)] relative top-10">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to PayAnyWhere
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Hybrid payments for global crypto events.
          </p>
          <Button variant={"default"} className="mt-6 w-fit min-w-60 min-h-12 text-lg font-bold">Get Started</Button>
        </div>
        <div className="flex-1 w-full h-[40vh] relative flex items-center justify-center">
          <Image
            src="/hero_visual.webp"
            alt="PayAnyWhere Hero"
            height={400}
            width={400}
            className="object-cover rounded-base"
            priority
          />
        </div>
      </section>
      <section className="marquee-section w-full overflow-visible py-8 my-8">
        <div className="w-full overflow-visible">
          <Marquee
            items={paymentBenefits}
            className="rotate-[-1deg] origin-top"
          />
        </div>
      </section>
    </main>
  )
}
