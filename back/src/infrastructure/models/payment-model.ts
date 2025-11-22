import { model, Schema } from "mongoose"
import type { Payment } from "../../domain/entities/payment"

const PaymentSchema = new Schema<Payment>(
  {
    merchantId: { type: String, required: true },
    cashierId: { type: String, required: true },
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
    timestamps: true,
    toJSON: {
      // biome-ignore lint/suspicious/noExplicitAny: ok
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      }
    },
    toObject: {
      // biome-ignore lint/suspicious/noExplicitAny: ok
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
)

export const PaymentModel = model<Payment>("Payment", PaymentSchema)
