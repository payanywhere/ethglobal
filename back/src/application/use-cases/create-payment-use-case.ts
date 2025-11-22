import type { Payment } from "../../domain/entities/payment"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export interface CreatePaymentDTO {
  merchantId: string
  amount: number
  token: string
  network: string
}

export class CreatePaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private merchantRepository: MerchantRepository
  ) {}

  async execute(dto: CreatePaymentDTO): Promise<Payment> {
    // Validate that the merchant exists
    const merchant = await this.merchantRepository.findByEmail(dto.merchantId)
    if (!merchant) {
      throw new Error(`Merchant with id ${dto.merchantId} not found`)
    }

    // Validate amount
    if (dto.amount <= 0) {
      throw new Error("Amount must be greater than 0")
    }

    // Validate that the merchant has the network configured
    const hasNetwork = merchant.wallets?.some(
      (wallet) => wallet.network.toLowerCase() === dto.network.toLowerCase()
    )

    if (!hasNetwork) {
      throw new Error(`Merchant does not have wallet configured for network ${dto.network}`)
    }

    // Validate that the token is supported on the merchant's network
    const wallet = merchant.wallets?.find(
      (w) => w.network.toLowerCase() === dto.network.toLowerCase()
    )

    const hasToken = wallet?.tokens.some((t) => t.toLowerCase() === dto.token.toLowerCase())

    if (!hasToken) {
      throw new Error(`Token ${dto.token} not supported for network ${dto.network}`)
    }

    // Create the payment
    const payment = await this.paymentRepository.create({
      merchantId: dto.merchantId,
      amount: dto.amount,
      token: dto.token,
      network: dto.network,
      status: "pending"
    })

    return payment
  }
}
