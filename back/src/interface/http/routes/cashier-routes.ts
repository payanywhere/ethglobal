import { Router } from "express"
import {
  createCashier,
  getCashierByUuid,
  getCashierDetails,
  getCashiersByMerchant,
  getCashiersByMerchantAddress
} from "../controllers/cashier-controller"

const router = Router()
router.post("/cashiers", createCashier)
router.get("/cashiers/:uuid/details", getCashierDetails)
router.get("/cashiers/:uuid", getCashierByUuid)
router.get("/cashiers/merchant/address/:address", getCashiersByMerchantAddress)
router.get("/cashiers/merchant/:merchantId", getCashiersByMerchant)

export default router
