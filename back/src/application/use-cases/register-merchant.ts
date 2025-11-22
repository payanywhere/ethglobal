import bcrypt from "bcrypt"
import type { Merchant } from "../../domain/entities/merchant"
import type { MerchantRepositoryImpl } from "../../infrastructure/repositories/merchant-repository-impl"

export class RegisterMerchant {
  constructor(private repo: MerchantRepositoryImpl) {}

  async execute(data: Merchant) {
    const existing = await this.repo.findByEmail(data.email)
    if (existing) throw new Error("Merchant already exists")

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const merchant = await this.repo.create({
      ...data,
      password: hashedPassword
    })

    return {
      merchant_id: merchant._id?.toString(),
      message: "Merchant successfully registered"
    }
  }
}
