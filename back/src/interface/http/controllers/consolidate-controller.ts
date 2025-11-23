import type { Request, Response } from "express"
import { consolidatePaymentsUseCase } from "../../../factories/use-case-factory"

export async function getPending(_req: Request, res: Response): Promise<void> {
  try {
    const useCase = consolidatePaymentsUseCase()
    const payments = await useCase.getPending()
    res.json({ payments })
  } catch (err) {
    console.error("❌ Error fetching pending payments:", err)
    res.status(500).json({ error: (err as Error).message })
  }
}
