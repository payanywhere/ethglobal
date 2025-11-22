import type { Payment } from "../entities/payment"

export interface PaymentRepository {
  create(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment>
  findByMerchant(merchantId: string): Promise<Payment[]>
}
