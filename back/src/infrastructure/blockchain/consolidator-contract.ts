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

  async consolidatePayments(privateKey: string): Promise<string> {
    const provider = getProvider()
    const wallet = new ethers.Wallet(privateKey, provider)
    const contractWithSigner = this.contract.connect(wallet)
    const incrementFn = contractWithSigner.getFunction("increment")
    const tx = await incrementFn()
    return tx.hash
  }
}
