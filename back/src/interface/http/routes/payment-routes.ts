import { Router } from "express"
import { createPayment, getPaymentsByMerchant } from "../controllers/payment-controller"

const router = Router()

router.post("/payments", createPayment)
router.get("/payments/:merchantId", getPaymentsByMerchant)

export default router
