import { model, Schema } from "mongoose"
import type { Cashier } from "../../domain/entities/cashier"

const CashierSchema = new Schema<Cashier>(
  {
    uuid: { type: String, required: true, unique: true },
    merchantId: { type: String, required: true },
    name: { type: String, required: true },
    status: { type: String, enum: ["enabled", "disabled"], required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true }
  },
  {
    timestamps: false
  }
)

export const CashierModel = model<Cashier>("Cashier", CashierSchema)
