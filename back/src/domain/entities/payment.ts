export interface Payment {
  id: string
  merchantId: string
  cashierId: string
  amount: number
  token: string
  network: string
  status: "pending" | "consolidated" | "failed" // consolidated = paid
  txHash?: string
  createdAt: Date
  updatedAt: Date
}
