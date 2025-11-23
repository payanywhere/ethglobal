import { Router } from "express"
import {
  getMerchantByAddress,
  getMerchantByEmail,
  getMerchants,
  registerMerchant
} from "../controllers/merchant-controller"

const router = Router()

router.get("/merchants", getMerchants)
router.post("/merchants/register", registerMerchant)
router.get("/merchants/:email", getMerchantByEmail)
router.get("/merchants/address/:address", getMerchantByAddress)

export default router
