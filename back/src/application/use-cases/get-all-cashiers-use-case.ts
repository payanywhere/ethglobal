import type { Cashier } from "../../domain/entities/cashier"
import type { CashierRepository } from "../../domain/repositories/cashier-repository"

export class GetAllCashiersUseCase {
  constructor(private cashierRepository: CashierRepository) {}

  async execute(): Promise<Cashier[]> {
    return await this.cashierRepository.getAll()
  }
}
