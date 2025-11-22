import type { Payment } from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export class UpdatePaymentStatusUseCase {
  constructor(private paymentRepository: PaymentRepository) {}

  async execute(uuid: string, status: Payment["status"]): Promise<Payment> {
    const payment = await this.paymentRepository.findByUuid(uuid)
    if (!payment) {
      throw new Error(`Payment with id ${uuid} not found`)
    }

    const updatedPayment = await this.paymentRepository.update(uuid, { status })
    if (!updatedPayment) {
      throw new Error(`Failed to update payment with id ${uuid}`)
    }

    return updatedPayment
  }
}
