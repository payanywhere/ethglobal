import { Router } from "express"

const router = Router()

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

router.get("/healthz", async (_req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: errorMessage
    })
  }
})

export default router
