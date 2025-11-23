import type { Variants } from "framer-motion"
import { AnimatePresence, motion } from "framer-motion"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ANIMATION_TRANSITION } from "../constants"

interface FiatPaymentCardProps {
  isConnected: boolean
  processing: boolean
  onPay: () => void
  variants?: Variants
}

export function FiatPaymentCard({
  isConnected,
  processing,
  onPay,
  variants
}: FiatPaymentCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isConnected ? "fiat-bottom" : "fiat-side"}
        initial={{ opacity: 0, y: isConnected ? 20 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isConnected ? 20 : 0 }}
        transition={ANIMATION_TRANSITION}
        className={isConnected ? "w-full" : ""}
        variants={variants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className="h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="flex-1">
            <motion.div
              className="w-16 h-16 rounded-base border-2 border-border bg-main mb-4 flex items-center justify-center shadow-shadow"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <CreditCard className="w-8 h-8 text-main-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-heading">Pay with FIAT</CardTitle>
            <CardDescription className="text-base font-base">
              Use traditional payment methods via Mercado Pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div whileHover={{ x: 4, y: 4 }} whileTap={{ x: 0, y: 0 }}>
              <Button
                onClick={onPay}
                disabled={processing}
                variant="default"
                size="lg"
                className="w-full min-h-14 text-lg font-heading"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue with FIAT
                    <CreditCard className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
            <p className="text-xs text-foreground/50 mt-3 text-center font-base">
              Secure payment gateway
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
