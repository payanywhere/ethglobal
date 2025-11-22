import type { Merchant } from "../../domain/entities/merchant"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"

export class GetMerchantByAddressUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(address: string): Promise<Merchant | null> {
    if (!address) {
      throw new Error("Wallet address is required")
    }

    const merchant = await this.merchantRepository.findByAddress(address)
    return merchant
  }
}
