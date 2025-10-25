"use client"

import { useState } from "react"
import { Search, TrendingUp, TrendingDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { generateMockMarkets } from "@/lib/mock-data"
import { formatTimeToExpiry } from "@/lib/contracts"
import { cn } from "@/lib/utils"

export function MarketList() {
  const [markets] = useState(generateMockMarkets())
  const [selectedMarket, setSelectedMarket] = useState(markets[0].contractId)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredMarkets = markets.filter((market) =>
    market.contract.eventName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex w-80 flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredMarkets.map((market) => {
            const isSelected = market.contractId === selectedMarket
            const priceChange = market.priceChange24h
            const isPositive = priceChange >= 0

            return (
              <button
                key={market.contractId}
                onClick={() => setSelectedMarket(market.contractId)}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-colors",
                  isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{market.contract.eventName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {market.contract.type === "future" && formatTimeToExpiry(market.contract.expiryDate)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="font-mono text-sm font-semibold text-foreground">
                      {(market.currentPrice * 100).toFixed(1)}¢
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-0.5 text-xs font-medium",
                        isPositive ? "text-success" : "text-destructive",
                      )}
                    >
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(priceChange * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Vol: ${(market.volume24h / 1000).toFixed(1)}K</span>
                  <span>•</span>
                  <span>OI: ${(market.openInterest / 1000).toFixed(1)}K</span>
                </div>

                <div className="mt-2">
                  <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${market.currentPrice * 100}%` }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
