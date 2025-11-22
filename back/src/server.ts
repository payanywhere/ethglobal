import cors from "cors"
import express from "express"
import { connectDB } from "./infrastructure/db/connection"

import consolidateRoutes from "./interface/http/routes/consolidate-routes"
import healthRoutes from "./interface/http/routes/health-routes"
import merchantRoutes from "./interface/http/routes/merchant-routes"
import paymentRoutes from "./interface/http/routes/payment-routes"

async function bootstrap(): Promise<void> {
  const app = express()
  app.use(cors({ origin: "*" }))
  app.use(express.json())

  app.use(merchantRoutes)
  app.use(paymentRoutes)
  app.use(healthRoutes)
  app.use(consolidateRoutes)

  await connectDB()

  const port = Number(process.env.PORT) || 8080
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`)
  })
}

bootstrap()
