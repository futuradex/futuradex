/**
 * Mock data generation for demo purposes
 */

import { initializeAMM } from "./amm"
import { generateSampleContracts, type Market, type Position, type Trade } from "./contracts"

export function generateMockMarkets(): Market[] {
  const contracts = generateSampleContracts()

  return contracts.map((contract, index) => {
    const initialProb = [0.42, 0.38, 0.65, 0.58][index]
    const ammState = initializeAMM(100000, initialProb, 5)
    const currentPrice = initialProb

    return {
      contractId: contract.id,
      contract,
      ammState,
      currentPrice,
      volume24h: Math.random() * 50000 + 10000,
      openInterest: Math.random() * 100000 + 20000,
      lastTradePrice: currentPrice + (Math.random() - 0.5) * 0.02,
      lastTradeTime: new Date(Date.now() - Math.random() * 3600000),
      priceChange24h: (Math.random() - 0.5) * 0.1,
    }
  })
}

export function generateMockPositions(userId: string): Position[] {
  const markets = generateMockMarkets()

  return [
    {
      id: "pos-1",
      userId,
      contractId: markets[0].contractId,
      contracts: 1000,
      entryPrice: 0.4,
      currentPrice: markets[0].currentPrice,
      unrealizedPnL: 1000 * (markets[0].currentPrice - 0.4),
      realizedPnL: 0,
      margin: 500,
      liquidationPrice: 0.1,
      openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
    },
    {
      id: "pos-2",
      userId,
      contractId: markets[2].contractId,
      contracts: -500,
      entryPrice: 0.68,
      currentPrice: markets[2].currentPrice,
      unrealizedPnL: -500 * (markets[2].currentPrice - 0.68),
      realizedPnL: 0,
      margin: 200,
      liquidationPrice: 0.9,
      openedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(),
    },
  ]
}

export function generateMockTrades(contractId: string, count = 20): Trade[] {
  const trades: Trade[] = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const timestamp = now - i * 300000 // 5 min intervals
    trades.push({
      id: `trade-${contractId}-${i}`,
      contractId,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      contracts: Math.floor(Math.random() * 1000) + 100,
      price: 0.4 + Math.random() * 0.2,
      side: Math.random() > 0.5 ? "buy" : "sell",
      timestamp: new Date(timestamp),
      fee: Math.random() * 5 + 1,
    })
  }

  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export function generateMockPriceHistory(basePrice: number, points = 100): Array<{ time: number; price: number }> {
  const history: Array<{ time: number; price: number }> = []
  const now = Date.now()
  let price = basePrice

  for (let i = points; i >= 0; i--) {
    const timestamp = now - i * 3600000 // 1 hour intervals
    price += (Math.random() - 0.5) * 0.02
    price = Math.max(0.01, Math.min(0.99, price))

    history.push({
      time: timestamp,
      price,
    })
  }

  return history
}
