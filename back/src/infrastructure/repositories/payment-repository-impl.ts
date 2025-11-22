import mongoose from "mongoose"
import type { Payment } from "../../domain/entities/payment"
import type { PaymentRepository } from "../../domain/repositories/payment-repository"
import { PaymentModel } from "../models/payment-model"

export class PaymentRepositoryImpl implements PaymentRepository {
  async create(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment> {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected. Cannot create payment.")
    }
    const doc = new PaymentModel(payment)
    const saved = await doc.save()
    return saved.toObject() as Payment
  }

  async findByMerchant(merchantId: string): Promise<Payment[]> {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected. Cannot get payments.")
    }

    // Use .exec() instead of .lean() to apply the schema transformations
    // .lean() returns plain objects without the transformations (_id -> id)
    const payments = await PaymentModel.find({ merchantId }).sort({ createdAt: -1 }).exec()
    return payments.map((payment) => payment.toObject() as Payment)
  }

  async findPendingByMerchant(merchantId: string): Promise<Payment[]> {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected. Cannot get payments.")
    }

    const payments = await PaymentModel.find({ merchantId, status: "pending" })
      .sort({ createdAt: -1 })
      .exec()
    return payments.map((payment) => payment.toObject() as Payment)
  }

  async findByUuid(uuid: string): Promise<Payment | null> {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected. Cannot get payment.")
    }

    const payment = await PaymentModel.findById(uuid).exec()
    if (!payment) {
      return null
    }
    return payment.toObject() as Payment
  }

  async update(uuid: string, updates: Partial<Payment>): Promise<Payment | null> {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB not connected. Cannot update payment.")
    }

    const payment = await PaymentModel.findByIdAndUpdate(
      uuid,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).exec()

    if (!payment) {
      return null
    }
    return payment.toObject() as Payment
  }
}
