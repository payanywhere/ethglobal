import type { Request, Response } from "express"
import { consolidatePaymentsUseCase } from "../../../factories/use-case-factory"

export async function getPending(_req: Request, res: Response): Promise<void> {
  try {
    const useCase = consolidatePaymentsUseCase()
    const pending = await useCase.getPending()
    res.json({ pending })
  } catch (err) {
    console.error("❌ Error fetching pending payments:", err)
    res.status(500).json({ error: (err as Error).message })
  }
}

export async function consolidate(_req: Request, res: Response): Promise<void> {
  try {
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      res.status(400).json({ error: "Missing field: privateKey" })
      return
    }

    const useCase = consolidatePaymentsUseCase()
    const txHash = await useCase.consolidate(privateKey)
    res.json({ txHash })
  } catch (err) {
    console.error("❌ Error consolidating payments:", err)
    res.status(500).json({ error: (err as Error).message })
  }
}
