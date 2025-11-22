import { ConsolidatePaymentsUseCase } from "../application/use-cases/consolidate-payments-use-cases"
import { CreatePaymentUseCase } from "../application/use-cases/create-payment-use-case"
import { GetMerchantByAddressUseCase } from "../application/use-cases/get-merchant-by-address-use-case"
import { GetMerchantByEmailUseCase } from "../application/use-cases/get-merchant-by-email-use-case"
import { GetMerchantsUseCase } from "../application/use-cases/get-merchants-use-case"
import { GetPaymentsByMerchantUseCase } from "../application/use-cases/get-payments-by-merchant-use-case"
import { RegisterMerchant } from "../application/use-cases/register-merchant"
import { ConsolidatorContract } from "../infrastructure/blockchain/consolidator-contract"
import { MerchantRepositoryImpl } from "../infrastructure/repositories/merchant-repository-impl"
import { PaymentRepositoryImpl } from "../infrastructure/repositories/payment-repository-impl"

// Singleton repositories and services
const paymentRepository = new PaymentRepositoryImpl()
const merchantRepository = new MerchantRepositoryImpl()
const consolidatorContract = new ConsolidatorContract()

// Payment use cases
export function createPaymentUseCase(): CreatePaymentUseCase {
  return new CreatePaymentUseCase(paymentRepository, merchantRepository)
}

export function getPaymentsByMerchantUseCase(): GetPaymentsByMerchantUseCase {
  return new GetPaymentsByMerchantUseCase(paymentRepository)
}

// Merchant use cases
export function getMerchantsUseCase(): GetMerchantsUseCase {
  return new GetMerchantsUseCase(merchantRepository)
}

export function getMerchantByEmailUseCase(): GetMerchantByEmailUseCase {
  return new GetMerchantByEmailUseCase(merchantRepository)
}

export function getMerchantByAddressUseCase(): GetMerchantByAddressUseCase {
  return new GetMerchantByAddressUseCase(merchantRepository)
}

export function registerMerchantUseCase(): RegisterMerchant {
  return new RegisterMerchant(merchantRepository)
}

// Consolidate use cases
export function consolidatePaymentsUseCase(): ConsolidatePaymentsUseCase {
  return new ConsolidatePaymentsUseCase(consolidatorContract)
}
