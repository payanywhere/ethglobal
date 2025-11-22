import type { Payment } from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"
import { PaymentModel } from "../models/payment-model"

export class PaymentRepositoryImpl implements PaymentRepository {
  async create(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    const doc = new PaymentModel(payment)
    const saved = await doc.save()
    return saved.toObject()
  }

  async findByMerchant(merchantId: string): Promise<Payment[]> {
    return await PaymentModel.find({ merchantId }).lean()
  }
}
