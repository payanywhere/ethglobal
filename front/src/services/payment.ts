import api, { type Cashier, type Payment } from "./api"

/**
 * Service for handling merchant payment-related API calls.
 * Uses the shared axios instance with NEXT_PUBLIC_API_URL.
 */

/**
 * Get merchantId from merchant uuid.
 * Tries to ensure the returned merchantId is not prefixed with any extra non-numeric/non-hex characters,
 * and matches the first occurrence by uuid.
 */
export async function getMerchantIdFromUuid(uuid: string): Promise<string> {
  const res = await api.get<Cashier[]>(`/cashiers`)
  if (!Array.isArray(res.data)) return ""

  const cashier = res.data.find((m: Cashier) => m.uuid === uuid)

  // Heuristic: prefer returning merchantId that exactly matches the pattern of a Mongo-like 24 hex char string.
  if (cashier?.merchantId && /^[a-f\d]{24}$/i.test(cashier.merchantId)) {
    return cashier.merchantId
  }

  // Fallback: if merchantId starts with 'sss' or other stray prefix, remove non-hex leading chars
  if (cashier?.merchantId) {
    const possibleId = cashier.merchantId.match(/[a-f\d]{24}/i)
    if (possibleId) return possibleId[0]
    // Return as is if no pattern found
    return cashier.merchantId
  }
  return ""
}

/**
 * Retrieves all payments for a merchant by merchant ID.
 * @param merchantId - The unique identifier of the merchant.
 * @returns Promise resolving to an array of payments for the merchant.
 */
export async function getPaymentsByMerchantId(merchantUuid: string): Promise<Payment[]> {
  const merchantId = await getMerchantIdFromUuid(merchantUuid)

  const res = await api.get<Payment[]>(`/payments/${merchantId}`)

  return res.data
}
