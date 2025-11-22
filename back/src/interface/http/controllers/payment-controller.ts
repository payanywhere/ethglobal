import type { Request, Response } from "express"
import {
  createPaymentUseCase,
  getPaymentsByMerchantUseCase
} from "../../../factories/use-case-factory"

interface ErrorResponse {
  error: string
}

export async function createPayment(
  req: Request,
  res: Response<ErrorResponse | unknown>
): Promise<void> {
  try {
    const useCase = createPaymentUseCase()
    const payment = await useCase.execute(req.body)
    res.status(201).json(payment)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(400).json({ error: message })
  }
}

export async function getPaymentsByMerchant(
  req: Request,
  res: Response<ErrorResponse | unknown[]>
): Promise<void> {
  try {
    const { merchantId } = req.params
    const useCase = getPaymentsByMerchantUseCase()
    const payments = await useCase.execute(merchantId)
    res.json(payments)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    res.status(400).json({ error: message })
  }
}
