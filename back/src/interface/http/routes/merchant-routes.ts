import { Router } from "express"
import {
  getMerchantByAddress,
  getMerchantByEmail,
  registerMerchant
} from "../controllers/merchant-controller"

const router = Router()
router.post("/merchants/register", registerMerchant)
router.get("/merchants/:email", getMerchantByEmail)
router.get("/merchants/address/:address", getMerchantByAddress)

export default router
