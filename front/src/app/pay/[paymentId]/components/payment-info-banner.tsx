import type { Variants } from "framer-motion"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface PaymentInfoBannerProps {
  variants?: Variants
}

export function PaymentInfoBanner({ variants }: PaymentInfoBannerProps) {
  return (
    <motion.div
      variants={variants}
      className="p-6 rounded-base border-2 border-border bg-secondary-background shadow-shadow"
    >
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="flex-shrink-0"
        >
          <Sparkles className="w-6 h-6 text-foreground" />
        </motion.div>
        <div className="space-y-1">
          <p className="font-heading font-bold text-sm">Secure Payment</p>
          <p className="text-sm font-base text-foreground/70">
            Your payment is processed securely. Choose the method that works best for you.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
