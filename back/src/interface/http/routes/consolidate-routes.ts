import { Router } from "express"
import { getPending } from "../controllers/consolidate-controller"

const router = Router()

router.get("/consolidate", getPending)

export default router
