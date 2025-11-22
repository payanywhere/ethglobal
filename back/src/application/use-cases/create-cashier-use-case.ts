import { randomUUID } from "node:crypto"
import type { Cashier } from "../../domain/entities/cashier"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"
import type { CashierRepositoryImpl } from "../../infrastructure/repositories/cashier-repository-impl"

interface CreateCashierDTO {
  merchantId?: string
  merchantAddress?: string
  merchantEmail?: string
  name: string
  status?: "enabled" | "disabled"
}

export class CreateCashierUseCase {
  constructor(
    private repo: CashierRepositoryImpl,
    private merchantRepository: MerchantRepository
  ) {}

  async execute(data: CreateCashierDTO): Promise<Cashier> {
    if (!data.merchantId && !data.merchantAddress && !data.merchantEmail) {
      throw new Error("must provide merchantId, merchantAddress or merchantEmail")
    }
    let merchant = null
    if (data.merchantId) {
      merchant = await this.merchantRepository.findById(data.merchantId)
    } else if (data.merchantAddress) {
      merchant = await this.merchantRepository.findByAddress(data.merchantAddress)
    } else if (data.merchantEmail) {
      merchant = await this.merchantRepository.findByEmail(data.merchantEmail)
    }

    if (!merchant) {
      throw new Error("Merchant not found")
    }
    if (!merchant._id) {
      throw new Error("Merchant has no valid ID")
    }

    const merchantId = merchant._id.toString() // for mongo
    const now = new Date()
    const cashier: Cashier = {
      uuid: randomUUID(),
      merchantId: merchantId,
      name: data.name,
      status: data.status || "enabled",
      createdAt: now,
      updatedAt: now
    }
    return await this.repo.create(cashier)
  }
}
