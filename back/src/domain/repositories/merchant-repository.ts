import type { Merchant } from "../entities/merchant"

export interface MerchantRepository {
  create(merchant: Merchant): Promise<Merchant>
  findByEmail(email: string): Promise<Merchant | null>
  findByAddress(address: string): Promise<Merchant | null>
  getAll(): Promise<Merchant[]>
}
