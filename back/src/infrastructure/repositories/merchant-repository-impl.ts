import type { Merchant } from "../../domain/entities/merchant"
import type { MerchantRepository } from "../../domain/repositories/merchant-repository"
import { MerchantModel } from "../models/merchant-model"

export class MerchantRepositoryImpl implements MerchantRepository {
  async create(merchant: Merchant): Promise<Merchant> {
    const doc = new MerchantModel(merchant)
    return await doc.save()
  }

  async findByEmail(email: string): Promise<Merchant | null> {
    return await MerchantModel.findOne({ email }).lean()
  }

  async findByAddress(address: string): Promise<Merchant | null> {
    return await MerchantModel.findOne({ "wallets.address": address }).lean()
  }

  async getAll(): Promise<Merchant[]> {
    return await MerchantModel.find().lean()
  }
}
