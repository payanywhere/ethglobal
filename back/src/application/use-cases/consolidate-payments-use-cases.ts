import type { ConsolidatorContract } from "../../infrastructure/blockchain/consolidator-contract"

export class ConsolidatePaymentsUseCase {
  constructor(private consolidator: ConsolidatorContract) {}

  async getPending(): Promise<number> {
    return this.consolidator.getPendingPayments()
  }

  async consolidate(privateKey: string): Promise<string> {
    return this.consolidator.consolidatePayments(privateKey)
  }
}
