import { Router } from "express"
import { getMerchantByEmail, registerMerchant } from "../controllers/merchant-controller"

const router = Router()
router.post("/merchants/register", registerMerchant)
router.get("/merchants/:email", getMerchantByEmail)

export default router
