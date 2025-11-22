import type { Request, Response } from "express"
import {
  createCashierUseCase,
  getCashierByUuidUseCase,
  getCashierDetailsUseCase,
  getCashiersByMerchantUseCase
} from "../../../factories/use-case-factory"

interface ErrorResponse {
  error: string
}

export async function createCashier(req: Request, res: Response): Promise<void> {
  try {
    const useCase = createCashierUseCase()
    const result = await useCase.execute(req.body)
    res.status(201).json(result)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message })
    } else {
      res.status(400).json({ error: "Unknown error" })
    }
  }
}

export async function getCashierByUuid(
  req: Request,
  res: Response<ErrorResponse | unknown>
): Promise<void> {
  try {
    const { uuid } = req.params
    console.log("UUID path param:", uuid)

    const useCase = getCashierByUuidUseCase()
    const cashier = await useCase.execute(uuid)

    if (!cashier) {
      res.status(404).json({ error: "Cashier not found" })
      return
    }

    res.json(cashier)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: message })
  }
}

export async function getCashiersByMerchant(
  req: Request,
  res: Response<ErrorResponse | unknown>
): Promise<void> {
  try {
    const { merchantId } = req.params
    console.log("MerchantId path param:", merchantId)

    const useCase = getCashiersByMerchantUseCase()
    const cashiers = await useCase.execute(merchantId)

    res.json(cashiers)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: message })
  }
}

export async function getCashierDetails(
  req: Request,
  res: Response<ErrorResponse | unknown>
): Promise<void> {
  try {
    const { uuid } = req.params
    console.log("UUID path param for details:", uuid)

    const useCase = getCashierDetailsUseCase()
    const details = await useCase.execute(uuid)

    res.json(details)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    if (message === "Cashier not found") {
      res.status(404).json({ error: message })
    } else {
      res.status(500).json({ error: message })
    }
  }
}
