export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) {
    return "Unexpected error. Please try again."
  }

  const rawMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error)

  const message = rawMessage.trim()
  const lower = message.toLowerCase()

  if (lower.includes("failed to fetch") || lower.includes("eth_chainid")) {
    return "We couldn't reach the blockchain RPC. Please retry or try again in a moment."
  }

  if (lower.includes("insufficient funds")) {
    return "Insufficient balance to complete this payment."
  }

  if (message.length > 160) {
    return `${message.slice(0, 157)}...`
  }

  return message || "Unexpected error. Please try again."
}
