import type { Cashier } from "../../domain/entities/cashier"
import type { CashierRepository } from "../../domain/repositories/cashier-repository"
import { CashierModel } from "../models/cashier-model"

export class CashierRepositoryImpl implements CashierRepository {
  async create(cashier: Cashier): Promise<Cashier> {
    const doc = new CashierModel(cashier)
    return await doc.save()
  }

  async findByUuid(uuid: string): Promise<Cashier | null> {
    const cashier = await CashierModel.findOne({ uuid }).lean()
    if (!cashier) {
      return null
    }
    if (cashier.merchantId && typeof cashier.merchantId !== "string") {
      cashier.merchantId = (cashier.merchantId as unknown as string).toString()
    }
    return cashier
  }

  async findByMerchantId(merchantId: string): Promise<Cashier[]> {
    return await CashierModel.find({ merchantId }).lean()
  }
}
