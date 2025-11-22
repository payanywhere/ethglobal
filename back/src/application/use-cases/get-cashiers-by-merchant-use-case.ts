import type { Cashier } from "../../domain/entities/cashier"
import type { CashierRepositoryImpl } from "../../infrastructure/repositories/cashier-repository-impl"

export class GetCashiersByMerchantUseCase {
  constructor(private repo: CashierRepositoryImpl) {}

  async execute(merchantId: string): Promise<Cashier[]> {
    return await this.repo.findByMerchantId(merchantId)
  }
}
