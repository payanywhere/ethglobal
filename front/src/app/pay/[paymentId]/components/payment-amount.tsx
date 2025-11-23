"use client"
import { getCurrency, setCurrency } from "@/lib/currency"
import { fetchDollarPrice } from "@/services/crypto-ya-prices"
import type { Variants } from "framer-motion"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface PaymentAmountProps {
  amount: number
  paymentId: string
  variants?: Variants
}

export function PaymentAmount({ amount, paymentId, variants }: PaymentAmountProps) {
  const [dollarPrice, setDollarPrice] = useState<number>(0);
  const [isARS, setIsARS] = useState(false);

  useEffect(() => {
    fetchDollarPrice().then(price => {
      setDollarPrice(price);
    });

    setIsARS(getCurrency() === "ARS");
  }, []);

  return (
    <motion.div variants={variants} className="text-center space-y-4">
      <motion.h1
        className="text-4xl md:text-5xl font-heading font-bold"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" as const, stiffness: 200, damping: 15 }}
      >
        {isARS ? "$" : "ARS"} {(isARS ? amount * dollarPrice : amount).toFixed(2)}
      </motion.h1>
      <motion.p className="text-lg md:text-xl text-foreground/70 font-base" variants={variants}>
        Payment ID: {paymentId}
      </motion.p>
    </motion.div>
  )
}
