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

export default api
