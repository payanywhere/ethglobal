export interface Payment {
  id: string
  merchantId: string
  amount: number
  token: string
  network: string
  status: "pending" | "consolidated" | "failed"
  txHash?: string
  createdAt: Date
  updatedAt: Date
}
