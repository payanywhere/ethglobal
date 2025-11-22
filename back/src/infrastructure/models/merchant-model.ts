import { model, Schema } from "mongoose"
import type { Merchant } from "../../domain/entities/merchant"

const MerchantSchema = new Schema<Merchant>({
  business_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  wallets: [{ network: String, address: String, tokens: [String] }],
  fiat_provider: { type: Object }
})

export const MerchantModel = model<Merchant>("Merchant", MerchantSchema)
