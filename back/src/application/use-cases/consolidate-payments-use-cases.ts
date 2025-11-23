import type { Payment } from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export class ConsolidatePaymentsUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async getPending(): Promise<Payment[]> {
    return this.paymentRepository.findAllPending()
  }
}
