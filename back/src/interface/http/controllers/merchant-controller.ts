import type { Request, Response } from "express"
import {
  getMerchantByAddressUseCase,
  getMerchantByEmailUseCase,
  registerMerchantUseCase
} from "../../../factories/use-case-factory"

interface ErrorResponse {
  error: string
}

export async function registerMerchant(req: Request, res: Response): Promise<void> {
  try {
    const useCase = registerMerchantUseCase()
    const result = await useCase.execute(req.body)
    res.json(result)
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message })
    } else {
      res.status(400).json({ error: "Unknown error" })
    }
  }
}

export async function getMerchantByEmail(
  req: Request,
  res: Response<ErrorResponse | unknown>
): Promise<void> {
  try {
    const { email } = req.params
    console.log("Email path param:", email)

    const useCase = getMerchantByEmailUseCase()
    const merchant = await useCase.execute(email)

    if (!merchant) {
      res.status(404).json({ error: "Merchant not found" })
      return
    }

    res.json(merchant)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: message })
  }
}

export async function getMerchantByAddress(
  req: Request,
  res: Response<ErrorResponse | unknown>
): Promise<void> {
  try {
    const { address } = req.params
    console.log("Address path param:", address)

    const useCase = getMerchantByAddressUseCase()
    const merchant = await useCase.execute(address)

    if (!merchant) {
      res.status(404).json({ error: "Merchant not found" })
      return
    }

    res.json(merchant)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ error: message })
  }
}
