import type { Payment } from "../../domain/entities/payment"
import type { CashierRepository } from "../../domain/repositories/cashier-repository"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"

export interface CreatePaymentDTO {
  cashierId: string
  amount: number
  token: string
  network: string
}

export class CreatePaymentUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private merchantRepository: MerchantRepository,
    private cashierRepository: CashierRepository
  ) {}

  async execute(dto: CreatePaymentDTO): Promise<Payment> {
    const cashier = await this.cashierRepository.findByUuid(dto.cashierId)
    if (!cashier) {
      throw new Error(`Cashier with id ${dto.cashierId} not found`)
    }
    let merchantId: string | undefined = cashier.merchantId
    // if merchantId is undefined or null, the cashier does not have a merchantId associated
    if (!merchantId) {
      throw new Error(
        `Cashier ${dto.cashierId} does not have a merchantId associated. Please recreate the cashier with a valid merchant.`
      )
    }
    // ensure that merchantId is a string (in case it comes as ObjectId)
    if (typeof merchantId !== "string") {
      merchantId = String(merchantId)
    }

    // Validate that the merchant exists
    // Try to find by ID first (assuming merchantId is MongoDB _id)
    let merchant = await this.merchantRepository.findById(merchantId)

    // If not found by ID, try by email (in case merchantId is actually an email)
    if (!merchant) {
      merchant = await this.merchantRepository.findByEmail(merchantId)
    }

    if (!merchant) {
      throw new Error(`Merchant with id ${merchantId} not found`)
    }

    // Get the merchant ID (use _id if available, otherwise use the string ID)
    const finalMerchantId = merchant._id?.toString() || merchantId

    // Validate that the cashier is enabled
    if (cashier.status !== "enabled") {
      throw new Error(`Cashier ${dto.cashierId} is not enabled`)
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

    // Create the payment with the merchant's _id and cashierId
    const payment = await this.paymentRepository.create({
      merchantId: finalMerchantId,
      cashierId: dto.cashierId,
      amount: dto.amount,
      token: dto.token,
      network: dto.network,
      status: "pending"
    })

    return payment
  }
}
