import { ConsolidatePaymentsUseCase } from "../application/use-cases/consolidate-payments-use-cases"
import { CreateCashierUseCase } from "../application/use-cases/create-cashier-use-case"
import { CreatePaymentUseCase } from "../application/use-cases/create-payment-use-case"
import { GetCashierByUuidUseCase } from "../application/use-cases/get-cashier-by-uuid-use-case"
import { GetCashierDetailsUseCase } from "../application/use-cases/get-cashier-details-use-case"
import { GetCashiersByMerchantUseCase } from "../application/use-cases/get-cashiers-by-merchant-use-case"
import { GetMerchantByAddressUseCase } from "../application/use-cases/get-merchant-by-address-use-case"
import { GetMerchantByEmailUseCase } from "../application/use-cases/get-merchant-by-email-use-case"
import { GetMerchantsUseCase } from "../application/use-cases/get-merchants-use-case"
import { GetPaymentByUuidUseCase } from "../application/use-cases/get-payment-by-uuid-use-case"
import { GetPaymentsByMerchantUseCase } from "../application/use-cases/get-payments-by-merchant-use-case"
import { RegisterMerchant } from "../application/use-cases/register-merchant"
import { UpdatePaymentStatusUseCase } from "../application/use-cases/update-payment-status-use-case"
import { ConsolidatorContract } from "../infrastructure/blockchain/consolidator-contract"
import { CashierRepositoryImpl } from "../infrastructure/repositories/cashier-repository-impl"
import { MerchantRepositoryImpl } from "../infrastructure/repositories/merchant-repository-impl"
import { PaymentRepositoryImpl } from "../infrastructure/repositories/payment-repository-impl"

// Singleton repositories and services
const paymentRepository = new PaymentRepositoryImpl()
const merchantRepository = new MerchantRepositoryImpl()
const cashierRepository = new CashierRepositoryImpl()
const consolidatorContract = new ConsolidatorContract()

// Payment use cases
export function createPaymentUseCase(): CreatePaymentUseCase {
  return new CreatePaymentUseCase(paymentRepository, merchantRepository, cashierRepository)
}

export function getPaymentsByMerchantUseCase(): GetPaymentsByMerchantUseCase {
  return new GetPaymentsByMerchantUseCase(paymentRepository)
}

export function getPaymentByUuidUseCase(): GetPaymentByUuidUseCase {
  return new GetPaymentByUuidUseCase(paymentRepository)
}

export function updatePaymentStatusUseCase(): UpdatePaymentStatusUseCase {
  return new UpdatePaymentStatusUseCase(paymentRepository)
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
  return new RegisterMerchant(merchantRepository, cashierRepository)
}

// Cashier use cases
export function createCashierUseCase(): CreateCashierUseCase {
  return new CreateCashierUseCase(cashierRepository, merchantRepository)
}

export function getCashierByUuidUseCase(): GetCashierByUuidUseCase {
  return new GetCashierByUuidUseCase(cashierRepository)
}

export function getCashiersByMerchantUseCase(): GetCashiersByMerchantUseCase {
  return new GetCashiersByMerchantUseCase(cashierRepository)
}

export function getCashierDetailsUseCase(): GetCashierDetailsUseCase {
  return new GetCashierDetailsUseCase(cashierRepository, merchantRepository, paymentRepository)
}

// Consolidate use cases
export function consolidatePaymentsUseCase(): ConsolidatePaymentsUseCase {
  return new ConsolidatePaymentsUseCase(consolidatorContract)
}
