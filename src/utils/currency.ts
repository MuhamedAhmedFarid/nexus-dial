export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatEGP(amount: number): string {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount)
}

export function usdToEgp(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100
}
