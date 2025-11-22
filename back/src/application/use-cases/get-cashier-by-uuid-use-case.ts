import type { Cashier } from "../../domain/entities/cashier"
import type { CashierRepositoryImpl } from "../../infrastructure/repositories/cashier-repository-impl"

export class GetCashierByUuidUseCase {
  constructor(private repo: CashierRepositoryImpl) {}

  async execute(uuid: string): Promise<Cashier | null> {
    return await this.repo.findByUuid(uuid)
  }
}
