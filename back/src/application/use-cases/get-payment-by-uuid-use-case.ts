import type { Payment } from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export class GetPaymentByUuidUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(uuid: string): Promise<Payment> {
    const payment = await this.paymentRepository.findByUuid(uuid)
    if (!payment) {
      throw new Error(`Payment with id ${uuid} not found`)
    }
    return payment
  }
}
