import type { Variants } from "framer-motion"
import { motion } from "framer-motion"
import { Coins, Loader2, Sparkles, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appKit } from "@/lib/reown-config"
import type { TokenBalance } from "@/services/dune-sim"
import { TokenList } from "./token-list"
import { WalletInfo } from "./wallet-info"

interface CryptoPaymentCardProps {
  isConnected: boolean
  chainName?: string
  address?: string
  tokens: TokenBalance[]
  selectedToken: TokenBalance | null
  paymentAmount: number
  loadingBalances: boolean
  processing: boolean
  onSelectToken: (token: TokenBalance) => void
  onPay: () => void
  onRefreshBalances: () => void
  onDisconnect: () => void
  variants?: Variants
}

export function CryptoPaymentCard({
  isConnected,
  chainName,
  address,
  tokens,
  selectedToken,
  paymentAmount,
  loadingBalances,
  processing,
  onSelectToken,
  onPay,
  onRefreshBalances,
  onDisconnect,
  variants
}: CryptoPaymentCardProps) {
  return (
    <motion.div variants={variants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="flex-1">
          <motion.div
            className="w-16 h-16 rounded-base border-2 border-border bg-chart-1 mb-4 flex items-center justify-center shadow-shadow"
            whileHover={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Coins className="w-8 h-8 text-main-foreground" />
          </motion.div>
          <CardTitle className="text-2xl font-heading">Pay with CRYPTO</CardTitle>
          <CardDescription className="text-base font-base">
            {isConnected
              ? `Connected to ${chainName || "Unknown"}`
              : "Connect your wallet to pay with crypto"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Button
              onClick={() => appKit.open()}
              variant="default"
              size="lg"
              className="w-full min-h-14 text-lg font-heading bg-chart-1 hover:bg-chart-1/90"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </Button>
          ) : (
            <>
              {address && <WalletInfo address={address} onDisconnect={onDisconnect} />}

              <TokenList
                tokens={tokens}
                selectedToken={selectedToken}
                paymentAmount={paymentAmount}
                loading={loadingBalances}
                onSelect={onSelectToken}
                onRefresh={onRefreshBalances}
              />

              {tokens.length > 0 && (
                <Button
                  onClick={onPay}
                  disabled={!selectedToken || processing}
                  variant="default"
                  size="lg"
                  className="w-full min-h-14 text-lg font-heading bg-chart-1 hover:bg-chart-1/90"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay with {selectedToken?.symbol || "Crypto"}
                      <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </Button>
              )}
            </>
          )}
          <p className="text-xs text-foreground/50 text-center font-base">Fast & decentralized</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
