import type { Cashier } from "../entities/cashier"

export interface CashierRepository {
  create(cashier: Cashier): Promise<Cashier>
  findByUuid(uuid: string): Promise<Cashier | null>
  findByMerchantId(merchantId: string): Promise<Cashier[]>
}
