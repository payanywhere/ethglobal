// app/services/api.ts
import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 5000
})

export async function health() {
  const res = await api.get("/health")
  return res.data
}

export async function getMerchants() {
  const res = await api.get("/merchants")
  return res.data
}

export interface RegisterMerchantRequest {
  email: string
  password: string
  uuid?: string
  merchantId?: string
  business_name: string
  wallets: Array<{
    network: string
    address: string
    tokens: string[]
  }>
}

export interface Merchant {
  _id?: string
  uuid?: string
  merchantId?: string
  email: string
  business_name: string
  wallets: Array<{
    network: string
    address: string
    tokens: string[]
  }>
}

/**
 * Verifica si existe un merchant por dirección de wallet
 */
export async function getMerchantByAddress(address: string): Promise<Merchant | null> {
  try {
    const res = await api.get(`/merchants/address/${address}`)
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}

/**
 * Obtiene un merchant por email
 */
export async function getMerchantByEmail(email: string): Promise<Merchant | null> {
  try {
    const res = await api.get(`/merchants/${email}`)
    return res.data
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null
    }
    throw err
  }
}

/**
 * Obtiene un merchant por ID
 */
export async function getMerchantById(merchantId: string): Promise<Merchant | null> {
  try {
    // Since there is no direct endpoint, we fetch all and filter
    // TODO: Optimize by adding a backend endpoint
    const res = await api.get("/merchants")
    const merchants = res.data as Merchant[]
    return (
      merchants.find(
        (m) =>
          m.merchantId === merchantId ||
          m._id === merchantId ||
          m.uuid === merchantId ||
          (m as any).id === merchantId
      ) || null
    )
  } catch (err: unknown) {
    console.error("Error fetching merchant by ID:", err)
    return null
  }
}

/**
 * Registra un nuevo merchant
 */
export async function registerMerchant(data: RegisterMerchantRequest): Promise<Merchant> {
  const res = await api.post("/merchants/register", data)
  return res.data
}

export interface Cashier {
  uuid: string
  merchantId: string
  name: string
  status: "enabled" | "disabled"
  createdAt: Date
  updatedAt: Date
}

export interface CreateCashierRequest {
  merchantId?: string
  merchantAddress?: string
  merchantEmail?: string
  name: string
  status?: "enabled" | "disabled"
}

/**
 * Obtiene todos los cashiers de un merchant
 */
export async function getCashiersByMerchant(merchantId: string): Promise<Cashier[]> {
  const res = await api.get(`/cashiers/merchant/${merchantId}`)
  return res.data
}

/**
 * Obtiene todos los cashiers de un merchant por su dirección de wallet
 */
export async function getCashiersByMerchantAddress(address: string): Promise<Cashier[]> {
  try {
    if (!address) {
      console.error("[API] ⚠️ getCashiersByMerchantAddress: address es null o undefined")
      return []
    }
    console.log("[API] 🔍 Buscando cashiers por address:", address)
    const res = await api.get(`/cashiers/merchant/address/${address}`)
    console.log("[API] ✅ Respuesta recibida:", res.data)
    return res.data || []
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        console.warn("[API] ⚠️ No se encontraron cashiers para la dirección:", address)
        return []
      }
      console.error("[API] ❌ Error al obtener cashiers:", err.response?.data || err.message)
    } else {
      console.error("[API] ❌ Error desconocido al obtener cashiers:", err)
    }
    throw err
  }
}

/**
 * Crea un nuevo cashier
 */
export async function createCashier(data: CreateCashierRequest): Promise<Cashier> {
  const res = await api.post("/cashiers", data)
  return res.data
}

export interface Payment {
  id: string
  merchantId: string
  cashierId: string
  amount: number
  token: string
  network: string
  status: "pending" | "consolidated" | "failed"
  txHash?: string
  description?: string
  email?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreatePaymentRequest {
  cashierId: string
  amount: number
  token: string
  network: string
  description?: string
  email?: string
}

/**
 * Obtiene todos los payments de un merchant por su ID
 */
export async function getPaymentsByMerchant(merchantId: string): Promise<Payment[]> {
  const res = await api.get(`/payments/${merchantId}`)
  return res.data
}

/**
 * Obtiene todos los payments de un merchant por su dirección de wallet
 */
export async function getPaymentsByMerchantAddress(address: string): Promise<Payment[]> {
  const res = await api.get(`/payments/address/${address}`)
  return res.data
}

/**
 * Crea un nuevo payment
 */
export async function createPayment(data: CreatePaymentRequest): Promise<Payment> {
  const res = await api.post("/payments", data)
  return res.data
}

export default api
