export interface Merchant {
  _id?: string
  business_name: string
  email: string
  password: string
  wallets?: {
    network: string
    address: string
    tokens: string[]
  }[]
  fiat_provider?: Record<string, unknown>
}
