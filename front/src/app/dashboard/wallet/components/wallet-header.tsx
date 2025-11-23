import { ArrowDownToLine, ArrowLeftRight, ArrowUpRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface WalletHeaderProps {
  totalValueUSD: number
  loading?: boolean
  onSend?: () => void
  onReceive?: () => void
  onSwap?: () => void
}

export function WalletHeader({ totalValueUSD, loading, onSend, onReceive, onSwap }: WalletHeaderProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-heading text-foreground/50">Total Balance</h2>
            {loading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <p className="text-3xl font-heading font-bold">
                ${totalValueUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
          </div>  
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onSwap}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Swap</span>
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSend}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Send</span>
                </>
              )}
            </Button>
            <Button
              variant="neutral"
              size="sm"
              onClick={onReceive}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowDownToLine className="h-4 w-4" />
                  <span>Receive</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

