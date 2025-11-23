export interface PaymentDetails {
  payment_id: string
  merchant_id: string
  amount_usd: number
  status: "pending" | "confirmed"
  qr_url?: string
  merchant_wallets?: Array<{
    network: string
    address: string
    tokens: string[]
  }>
}

export interface PaymentFormData {
  merchant_id: string
  amount_usd: number
  description: string
  email?: string
}
