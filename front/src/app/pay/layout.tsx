import { ReownProvider } from "@/components/reown-provider"

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return <ReownProvider>{children}</ReownProvider>
}
