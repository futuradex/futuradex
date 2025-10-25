"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { calculatePriceAfterTrade, calculateExecutionPrice, calculateMargin } from "@/lib/amm"
import type { Market } from "@/lib/contracts"
import { cn } from "@/lib/utils"

interface TradeFormProps {
  market: Market
}

export function TradeForm({ market }: TradeFormProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [contracts, setContracts] = useState("")
  const [limitPrice, setLimitPrice] = useState("")
  const [orderType, setOrderType] = useState<"market" | "limit">("market")

  const contractsNum = Number.parseFloat(contracts) || 0
  const tradeSize = side === "buy" ? contractsNum : -contractsNum

  // Calculate trade details
  const priceQuote = contractsNum > 0 ? calculatePriceAfterTrade(market.ammState, tradeSize) : null
  const avgPrice = contractsNum > 0 ? calculateExecutionPrice(market.ammState, tradeSize) : 0
  const margin = contractsNum > 0 ? calculateMargin(tradeSize, avgPrice) : null

  const cost = contractsNum * avgPrice
  const maxProfit = side === "buy" ? contractsNum * (1 - avgPrice) : contractsNum * avgPrice
  const maxLoss = side === "buy" ? contractsNum * avgPrice : contractsNum * (1 - avgPrice)

  return (
    <div className="flex flex-col gap-6">
      {/* Buy/Sell Tabs */}
      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="gap-2 data-[state=active]:bg-success/20 data-[state=active]:text-success">
            <ArrowUpRight className="h-4 w-4" />
            Buy (Long)
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="gap-2 data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive"
          >
            <ArrowDownRight className="h-4 w-4" />
            Sell (Short)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Order Type */}
      <div className="flex gap-2">
        <Button
          variant={orderType === "market" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("market")}
          className="flex-1"
        >
          Market
        </Button>
        <Button
          variant={orderType === "limit" ? "default" : "outline"}
          size="sm"
          onClick={() => setOrderType("limit")}
          className="flex-1"
        >
          Limit
        </Button>
      </div>

      {/* Contracts Input */}
      <div className="space-y-2">
        <Label htmlFor="contracts" className="text-sm font-medium">
          Contracts
        </Label>
        <Input
          id="contracts"
          type="number"
          placeholder="0"
          value={contracts}
          onChange={(e) => setContracts(e.target.value)}
          className="font-mono"
        />
      </div>

      {/* Limit Price (if limit order) */}
      {orderType === "limit" && (
        <div className="space-y-2">
          <Label htmlFor="limit-price" className="text-sm font-medium">
            Limit Price (¢)
          </Label>
          <Input
            id="limit-price"
            type="number"
            placeholder={(market.currentPrice * 100).toFixed(2)}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="font-mono"
          />
        </div>
      )}

      {/* Trade Summary */}
      {contractsNum > 0 && priceQuote && margin && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg. Price</span>
            <span className="font-mono font-semibold text-foreground">{(avgPrice * 100).toFixed(2)}¢</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Est. Cost</span>
            <span className="font-mono font-semibold text-foreground">${cost.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Price Impact</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Expected price movement from your trade</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span
              className={cn(
                "font-mono text-sm font-semibold",
                priceQuote.impact > 1 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {priceQuote.impact.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required Margin</span>
            <span className="font-mono font-semibold text-foreground">${margin.initialMargin.toFixed(2)}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Max Profit</span>
            <span className="font-mono font-semibold text-success">${maxProfit.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Max Loss</span>
            <span className="font-mono font-semibold text-destructive">${maxLoss.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        size="lg"
        className={cn(
          "w-full font-semibold",
          side === "buy"
            ? "bg-success hover:bg-success/90 text-white"
            : "bg-destructive hover:bg-destructive/90 text-white",
        )}
        disabled={!contractsNum || contractsNum <= 0}
      >
        {side === "buy" ? "Buy" : "Sell"} {contractsNum > 0 ? `${contractsNum} Contracts` : ""}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground">
        Trading involves risk. Ensure you understand the mechanics of probability futures before trading.
      </p>
    </div>
  )
}
