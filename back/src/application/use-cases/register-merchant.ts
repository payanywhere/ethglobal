import { randomUUID } from "node:crypto"
import bcrypt from "bcrypt"
import type { Cashier } from "../../domain/entities/cashier"
import type { Merchant } from "../../domain/entities/merchant"
import type { CashierRepositoryImpl } from "../../infrastructure/repositories/cashier-repository-impl"
import type { MerchantRepositoryImpl } from "../../infrastructure/repositories/merchant-repository-impl"

interface RegisterMerchantDTO {
  email: string
  password: string
  business_name: string
  wallets: {
    network: string
    address: string
    tokens: string[]
  }[]
}

export class RegisterMerchant {
  constructor(
    private repo: MerchantRepositoryImpl,
    private cashierRepo: CashierRepositoryImpl
  ) {}

  async execute(data: RegisterMerchantDTO) {
    const existing = await this.repo.findByEmail(data.email)
    if (existing) throw new Error("Merchant already exists")

    const hashedPassword = await bcrypt.hash(data.password, 10)

    // ensure that at least one wallet is provided
    if (!data.wallets || data.wallets.length === 0) {
      throw new Error("At least one wallet is required")
    }

    // Map the wallets with their tokens
    const wallets = data.wallets.map((wallet) => ({
      network: wallet.network,
      address: wallet.address,
      tokens: wallet.tokens || []
    }))

    const merchant: Merchant = {
      email: data.email,
      password: hashedPassword,
      business_name: data.business_name,
      wallets: wallets
    }

    const savedMerchant = await this.repo.create(merchant)
    const merchantId = savedMerchant._id?.toString()
    if (!merchantId) {
      throw new Error("Failed to get merchant ID after creation")
    }

    // default cashier 1:1
    const now = new Date()
    const defaultCashier: Cashier = {
      uuid: randomUUID(),
      merchantId: merchantId,
      name: "default",
      status: "enabled",
      createdAt: now,
      updatedAt: now
    }
    await this.cashierRepo.create(defaultCashier)

    return {
      merchant_id: merchantId,
      message: "Merchant successfully registered"
    }
  }
}
