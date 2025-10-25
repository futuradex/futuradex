"use client"

import { useMemo } from "react"

interface OrderBookProps {
  contractId: string
  currentPrice: number
}

interface OrderBookLevel {
  price: number
  size: number
  total: number
}

export function OrderBook({ contractId, currentPrice }: OrderBookProps) {
  // Generate mock order book data
  const { bids, asks, spread } = useMemo(() => {
    const bids: OrderBookLevel[] = []
    const asks: OrderBookLevel[] = []
    let totalBids = 0
    let totalAsks = 0

    // Generate bids (below current price)
    for (let i = 0; i < 10; i++) {
      const price = currentPrice - (i + 1) * 0.01
      const size = Math.floor(Math.random() * 5000) + 500
      totalBids += size
      bids.push({ price, size, total: totalBids })
    }

    // Generate asks (above current price)
    for (let i = 0; i < 10; i++) {
      const price = currentPrice + (i + 1) * 0.01
      const size = Math.floor(Math.random() * 5000) + 500
      totalAsks += size
      asks.push({ price, size, total: totalAsks })
    }

    const spread = asks[0].price - bids[0].price

    return { bids, asks, spread }
  }, [contractId, currentPrice])

  const maxTotal = Math.max(bids[bids.length - 1]?.total || 0, asks[asks.length - 1]?.total || 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Order Book</h3>
        <div className="text-xs text-muted-foreground">
          Spread: <span className="font-mono text-foreground">{(spread * 100).toFixed(2)}¢</span>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
        <div className="text-left">Price (¢)</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex flex-col-reverse gap-0.5">
        {asks.slice(0, 8).map((level, index) => (
          <div key={`ask-${index}`} className="relative">
            <div
              className="absolute inset-0 bg-destructive/10"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <div className="relative grid grid-cols-3 gap-2 py-1 font-mono text-xs">
              <div className="text-left text-destructive">{(level.price * 100).toFixed(2)}</div>
              <div className="text-right text-foreground">{level.size.toLocaleString()}</div>
              <div className="text-right text-muted-foreground">{level.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Current Price */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 py-2">
        <span className="font-mono text-lg font-bold text-primary">{(currentPrice * 100).toFixed(2)}¢</span>
        <span className="text-xs text-muted-foreground">Mark Price</span>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="flex flex-col gap-0.5">
        {bids.slice(0, 8).map((level, index) => (
          <div key={`bid-${index}`} className="relative">
            <div className="absolute inset-0 bg-success/10" style={{ width: `${(level.total / maxTotal) * 100}%` }} />
            <div className="relative grid grid-cols-3 gap-2 py-1 font-mono text-xs">
              <div className="text-left text-success">{(level.price * 100).toFixed(2)}</div>
              <div className="text-right text-foreground">{level.size.toLocaleString()}</div>
              <div className="text-right text-muted-foreground">{level.total.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
