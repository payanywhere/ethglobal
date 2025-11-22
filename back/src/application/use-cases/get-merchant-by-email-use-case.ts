import type { Merchant } from "../../domain/entities/merchant"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"

export class GetMerchantByEmailUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(email: string): Promise<Merchant | null> {
    if (!email) {
      throw new Error("Email is required")
    }

    const merchant = await this.merchantRepository.findByEmail(email)
    return merchant
  }
}
