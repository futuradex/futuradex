"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Activity, LineChartIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PriceChart } from "@/components/price-chart"
import { OrderBook } from "@/components/order-book"
import { TradeForm } from "@/components/trade-form"
import { RecentTrades } from "@/components/recent-trades"
import { TermStructure } from "@/components/term-structure"
import { generateMockMarkets, generateMockPriceHistory, generateMockTrades } from "@/lib/mock-data"
import { formatTimeToExpiry } from "@/lib/contracts"
import { cn } from "@/lib/utils"

export function TradingInterface() {
  const [markets] = useState(generateMockMarkets())
  const [selectedMarket] = useState(markets[0])
  const [priceHistory] = useState(generateMockPriceHistory(selectedMarket.currentPrice))
  const [recentTrades] = useState(generateMockTrades(selectedMarket.contractId))

  const priceChange = selectedMarket.priceChange24h
  const isPositive = priceChange >= 0

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Market Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedMarket.contract.eventName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{selectedMarket.contract.description}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Expires: {formatTimeToExpiry(selectedMarket.contract.expiryDate)}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{selectedMarket.contract.expiryDate.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-8">
            <div>
              <div className="text-xs text-muted-foreground">Mark Price</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-foreground">
                  {(selectedMarket.currentPrice * 100).toFixed(2)}¢
                </span>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    isPositive ? "text-success" : "text-destructive",
                  )}
                >
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(priceChange * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">24h Volume</div>
              <div className="mt-1 font-mono text-lg font-semibold text-foreground">
                ${(selectedMarket.volume24h / 1000).toFixed(1)}K
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Open Interest</div>
              <div className="mt-1 font-mono text-lg font-semibold text-foreground">
                ${(selectedMarket.openInterest / 1000).toFixed(1)}K
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground">Implied Prob.</div>
              <div className="mt-1 font-mono text-lg font-semibold text-primary">
                {(selectedMarket.currentPrice * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chart & Trades */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Tabs defaultValue="chart" className="flex flex-1 flex-col">
            <div className="border-b border-border px-6">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="chart" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Chart
                </TabsTrigger>
                <TabsTrigger value="term-structure" className="gap-2">
                  <LineChartIcon className="h-4 w-4" />
                  Term Structure
                </TabsTrigger>
                <TabsTrigger value="trades">Recent Trades</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chart" className="flex-1 overflow-hidden p-6">
              <PriceChart data={priceHistory} currentPrice={selectedMarket.currentPrice} />
            </TabsContent>

            <TabsContent value="term-structure" className="flex-1 overflow-y-auto p-6">
              <TermStructure markets={markets} eventId={selectedMarket.contract.eventId} />
            </TabsContent>

            <TabsContent value="trades" className="flex-1 overflow-hidden p-6">
              <RecentTrades trades={recentTrades} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Order Book & Trade Form */}
        <div className="flex w-96 flex-col border-l border-border">
          <Tabs defaultValue="trade" className="flex flex-1 flex-col">
            <div className="border-b border-border px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="trade">Trade</TabsTrigger>
                <TabsTrigger value="orderbook">Order Book</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="trade" className="flex-1 overflow-y-auto p-4">
              <TradeForm market={selectedMarket} />
            </TabsContent>

            <TabsContent value="orderbook" className="flex-1 overflow-y-auto p-4">
              <OrderBook contractId={selectedMarket.contractId} currentPrice={selectedMarket.currentPrice} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
