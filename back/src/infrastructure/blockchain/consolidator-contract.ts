import { ethers } from "ethers"
import { getProvider } from "./provider"

const CONTRACT_ADDRESS = "0xaceab134c29ab753731d78b7872b29f8a057d591"
const CONTRACT_ABI = [
  "function number() view returns (uint256)",
  "function setNumber(uint256 newNumber)",
  "function increment()"
] as const

export class ConsolidatorContract {
  private contract: ethers.Contract

  constructor() {
    const provider = getProvider()
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }

  async getPendingPayments(): Promise<number> {
    const fn = this.contract.getFunction("number")
    const value = (await fn()) as bigint
    return Number(value)
  }
}
