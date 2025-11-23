import { Router } from "express"
import {
  createPayment,
  getPaymentByUuid,
  getPaymentsByMerchant,
  getPaymentsByMerchantAddress,
  updatePaymentStatus
} from "../controllers/payment-controller"

const router = Router()

router.post("/payments", createPayment)
router.get("/payments/address/:address", getPaymentsByMerchantAddress)
router.get("/payments/:merchantId", getPaymentsByMerchant)
router.get("/payment/:uuid", getPaymentByUuid)
router.patch("/payment/:uuid", updatePaymentStatus)

export default router
