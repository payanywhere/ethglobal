import type { Payment } from "../entities/payment"

export interface PaymentRepository {
  create(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment>
  findByMerchant(merchantId: string): Promise<Payment[]>
  findPendingByMerchant(merchantId: string): Promise<Payment[]>
  findByUuid(uuid: string): Promise<Payment | null>
  update(uuid: string, updates: Partial<Payment>): Promise<Payment | null>
}
