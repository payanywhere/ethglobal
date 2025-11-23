/**
 * Utility functions for currency settings - Local storage
 */

export function getCurrency() {
    const currency = localStorage.getItem("currency")
    return currency as "ARS" | "USD"
}

export function setCurrency(currency: "ARS" | "USD") {
    localStorage.setItem("currency", currency === "ARS" ? "ARS" : "USD")
}
