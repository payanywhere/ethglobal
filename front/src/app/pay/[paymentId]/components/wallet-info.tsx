import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletInfoProps {
  address: string
  onDisconnect: () => void
}

export function WalletInfo({ address, onDisconnect }: WalletInfoProps) {
  return (
    <>
      <div className="p-3 rounded-base border border-border bg-secondary-background">
        <p className="text-sm font-mono text-foreground/70">
          {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      </div>
      <Button
        variant="noShadow"
        size="sm"
        onClick={onDisconnect}
        className="w-full text-xs gap-2 border-none hover:bg-transparent hover:text-foreground bg-transparent"
      >
        <LogOut className="h-3 w-3" />
        Disconnect Wallet
      </Button>
    </>
  )
}
