export interface Cashier {
  uuid: string
  merchantId: string
  name: string
  status: "enabled" | "disabled"
  createdAt: Date
  updatedAt: Date
}
