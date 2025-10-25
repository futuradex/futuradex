/**
 * Contract definitions and market data structures
 */

export type ContractType = "future" | "calendar-spread"

export interface FutureContract {
  id: string
  type: "future"
  eventId: string
  eventName: string
  description: string
  expiryDate: Date
  expiryTimestamp: number
  settlementValue: number | null // 0, 1, or null if not settled
  isSettled: boolean
  createdAt: Date
}

export interface CalendarSpreadContract {
  id: string
  type: "calendar-spread"
  eventId: string
  eventName: string
  nearExpiry: Date
  farExpiry: Date
  nearContractId: string
  farContractId: string
  createdAt: Date
}

export type Contract = FutureContract | CalendarSpreadContract

export interface Market {
  contractId: string
  contract: Contract
  ammState: import("./amm").AMMState
  currentPrice: number
  volume24h: number
  openInterest: number
  lastTradePrice: number
  lastTradeTime: Date
  priceChange24h: number
}

export interface Position {
  id: string
  userId: string
  contractId: string
  contracts: number // positive = long, negative = short
  entryPrice: number
  currentPrice: number
  unrealizedPnL: number
  realizedPnL: number
  margin: number
  liquidationPrice: number | null
  openedAt: Date
  lastUpdated: Date
}

export interface Trade {
  id: string
  contractId: string
  userId: string
  contracts: number
  price: number
  side: "buy" | "sell"
  timestamp: Date
  fee: number
}

export interface OrderBookLevel {
  price: number
  size: number
  total: number
}

export interface OrderBook {
  contractId: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
  midPrice: number
  lastUpdate: Date
}

/**
 * Generate sample contracts for demo
 */
export function generateSampleContracts(): FutureContract[] {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  return [
    {
      id: "btc-100k-7d",
      type: "future",
      eventId: "btc-100k",
      eventName: "BTC > $100K",
      description: "Bitcoin price above $100,000 at expiry",
      expiryDate: new Date(now + 7 * day),
      expiryTimestamp: now + 7 * day,
      settlementValue: null,
      isSettled: false,
      createdAt: new Date(now - 30 * day),
    },
    {
      id: "btc-100k-30d",
      type: "future",
      eventId: "btc-100k",
      eventName: "BTC > $100K",
      description: "Bitcoin price above $100,000 at expiry",
      expiryDate: new Date(now + 30 * day),
      expiryTimestamp: now + 30 * day,
      settlementValue: null,
      isSettled: false,
      createdAt: new Date(now - 30 * day),
    },
    {
      id: "eth-5k-14d",
      type: "future",
      eventId: "eth-5k",
      eventName: "ETH > $5K",
      description: "Ethereum price above $5,000 at expiry",
      expiryDate: new Date(now + 14 * day),
      expiryTimestamp: now + 14 * day,
      settlementValue: null,
      isSettled: false,
      createdAt: new Date(now - 20 * day),
    },
    {
      id: "eth-5k-60d",
      type: "future",
      eventId: "eth-5k",
      eventName: "ETH > $5K",
      description: "Ethereum price above $5,000 at expiry",
      expiryDate: new Date(now + 60 * day),
      expiryTimestamp: now + 60 * day,
      settlementValue: null,
      isSettled: false,
      createdAt: new Date(now - 20 * day),
    },
  ]
}

/**
 * Format time until expiry
 */
export function formatTimeToExpiry(expiryDate: Date): string {
  const now = Date.now()
  const diff = expiryDate.getTime() - now

  if (diff < 0) return "Expired"

  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

/**
 * Calculate implied probability from price
 */
export function priceToImpliedProbability(price: number): number {
  return price * 100
}
