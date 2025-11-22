import { model, Schema } from "mongoose"
import type { Payment } from "../../domain/entities/payment"

const PaymentSchema = new Schema<Payment>(
  {
    merchantId: { type: String, required: true },
    amount: { type: Number, required: true },
    token: { type: String, required: true },
    network: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "consolidated", "failed"],
      default: "pending"
    },
    txHash: { type: String }
  },
  {
    timestamps: true
  }
)

export const PaymentModel = model<Payment>("Payment", PaymentSchema)
