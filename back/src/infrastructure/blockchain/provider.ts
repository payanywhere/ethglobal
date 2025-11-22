import { ethers } from "ethers"

const RPC_PROVIDER = process.env.RPC_PROVIDER

if (!RPC_PROVIDER) {
  throw new Error("Missing environment variable: RPC_PROVIDER")
}

export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_PROVIDER)
}
