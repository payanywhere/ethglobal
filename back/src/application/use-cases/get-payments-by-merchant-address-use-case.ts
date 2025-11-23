import type { Payment } from "../../domain/entities/payment"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export class GetPaymentsByMerchantAddressUseCase {
  constructor(
    private merchantRepository: MerchantRepository,
    private paymentRepository: PaymentRepository
  ) {}

  async execute(address: string): Promise<Payment[]> {
    if (!address) {
      throw new Error("Wallet address is required")
    }
    const merchant = await this.merchantRepository.findByAddress(address)
    if (!merchant) {
      throw new Error("Merchant not found for the given address")
    }

    if (!merchant._id) {
      throw new Error("Merchant has no valid ID")
    }

    const merchantId = merchant._id.toString()
    return await this.paymentRepository.findByMerchant(merchantId)
  }
}
