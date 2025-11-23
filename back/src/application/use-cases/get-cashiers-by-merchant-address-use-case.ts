import type { Cashier } from "../../domain/entities/cashier"
import type { CashierRepository } from "../../domain/repositories/cashier-repository"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"

export class GetCashiersByMerchantAddressUseCase {
  constructor(
    private merchantRepository: MerchantRepository,
    private cashierRepository: CashierRepository
  ) {}

  async execute(address: string): Promise<Cashier[]> {
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
    return await this.cashierRepository.findByMerchantId(merchantId)
  }
}
