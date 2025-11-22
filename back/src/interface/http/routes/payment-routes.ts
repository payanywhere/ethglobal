import { Router } from "express"
import {
  createPayment,
  getPaymentByUuid,
  getPaymentsByMerchant,
  updatePaymentStatus
} from "../controllers/payment-controller"

const router = Router()

router.post("/payments", createPayment)
router.get("/payments/:merchantId", getPaymentsByMerchant)
router.get("/payment/:uuid", getPaymentByUuid)
router.patch("/payment/:uuid", updatePaymentStatus)

export default router
