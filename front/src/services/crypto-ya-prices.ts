/**
 * CryptoYa Prices API Service
 * Documentation: https://docs.criptoya.com/argentina/operations/get-dolar.html
 * No authentication required
 */

/**
 * Fetch dollar prices from CryptoYa
 * @returns crypto dollar bid price 
 */
export async function fetchDollarPrice(): Promise<number> {
  try {
    const response = await fetch('https://criptoya.com/api/dolar', {
      cache: "no-store", // Always get fresh prices
      headers: {
        Accept: "application/json"
      }
    })

    if (!response.ok) {
      console.error("CryptoYa API error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)
      return 0
    }

    const data = await response.json()
    return data?.cripto?.usdt?.bid ?? 0;
  } catch (error) {
    console.error("Error fetching prices from CryptoYa:", error)
    return 0
  }
}