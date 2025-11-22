import type { Payment } from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export class GetPaymentsByMerchantUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(merchantId: string): Promise<Payment[]> {
    if (!merchantId) {
      throw new Error("Merchant ID is required")
    }

    return await this.paymentRepository.findByMerchant(merchantId)
  }
}
