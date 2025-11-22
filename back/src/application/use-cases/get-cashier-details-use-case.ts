import type { Cashier } from "../../domain/entities/cashier"
import type { Merchant } from "../../domain/entities/merchant"
import type { Payment } from "../../domain/entities/payment"
import type { CashierRepositoryImpl } from "../../infrastructure/repositories/cashier-repository-impl"
import type { MerchantRepositoryImpl } from "../../infrastructure/repositories/merchant-repository-impl"
import type { PaymentRepositoryImpl } from "../../infrastructure/repositories/payment-repository-impl"

export interface CashierDetailsResponse {
  cashier: Cashier
  merchant: Merchant | null
  pendingPayments: Payment[]
}

export class GetCashierDetailsUseCase {
  constructor(
    private cashierRepository: CashierRepositoryImpl,
    private merchantRepository: MerchantRepositoryImpl,
    private paymentRepository: PaymentRepositoryImpl
  ) {}

  async execute(uuid: string): Promise<CashierDetailsResponse> {
    const cashier = await this.cashierRepository.findByUuid(uuid)
    if (!cashier) {
      throw new Error("Cashier not found")
    }
    const merchant = await this.merchantRepository.findById(cashier.merchantId)
    const pendingPayments = await this.paymentRepository.findPendingByMerchant(cashier.merchantId)
    return {
      cashier,
      merchant,
      pendingPayments
    }
  }
}
