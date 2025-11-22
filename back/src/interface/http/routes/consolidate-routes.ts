import { Router } from "express"
import { consolidate, getPending } from "../controllers/consolidate-controller"

const router = Router()

router.post("/consolidate", consolidate)
router.get("/consolidate", getPending)

export default router
