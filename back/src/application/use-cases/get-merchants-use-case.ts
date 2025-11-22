import type { Merchant } from "../../domain/entities/merchant"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"

export class GetMerchantsUseCase {
  constructor(private merchantRepository: MerchantRepository) {}

  async execute(): Promise<Merchant[]> {
    return await this.merchantRepository.getAll()
  }
}
