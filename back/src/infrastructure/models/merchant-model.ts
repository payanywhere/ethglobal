import { model, Schema } from "mongoose"
import type { Merchant } from "../../domain/entities/merchant"

const WalletSchema = new Schema(
  {
    network: { type: String, required: true },
    address: { type: String, required: true },
    tokens: { type: [String], default: [] }
  },
  { _id: true }
)

const MerchantSchema = new Schema<Merchant>({
  business_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  wallets: { type: [WalletSchema], default: [] },
  fiat_provider: { type: Object }
})

export const MerchantModel = model<Merchant>("Merchant", MerchantSchema)
