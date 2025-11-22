import { describe, expect, it } from "bun:test"
import { ConsolidatorContract } from "../infrastructure/blockchain/consolidator-contract"

describe("ConsolidatorContract", () => {
  it("should fetch pending payments", async () => {
    const consolidator = new ConsolidatorContract()
    const count = await consolidator.getPendingPayments()
    expect(typeof count).toBe("number")
  })
})
