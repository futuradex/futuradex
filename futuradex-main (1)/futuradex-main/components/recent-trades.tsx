"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Trade } from "@/lib/contracts"
import { cn } from "@/lib/utils"

interface RecentTradesProps {
  trades: Trade[]
}

export function RecentTrades({ trades }: RecentTradesProps) {
  return (
    <Card className="h-full border-border bg-card p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Trades</h3>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-4 gap-4 border-b border-border pb-2 text-xs font-medium text-muted-foreground">
          <div>Time</div>
          <div className="text-right">Price (¢)</div>
          <div className="text-right">Size</div>
          <div className="text-right">Side</div>
        </div>

        {/* Trades */}
        <div className="max-h-[500px] space-y-0.5 overflow-y-auto">
          {trades.map((trade) => {
            const isBuy = trade.side === "buy"
            const time = trade.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

            return (
              <div
                key={trade.id}
                className="grid grid-cols-4 gap-4 rounded py-2 font-mono text-sm transition-colors hover:bg-muted/50"
              >
                <div className="text-muted-foreground">{time}</div>
                <div className={cn("text-right font-semibold", isBuy ? "text-success" : "text-destructive")}>
                  {(trade.price * 100).toFixed(2)}
                </div>
                <div className="text-right text-foreground">{trade.contracts.toLocaleString()}</div>
                <div className="flex items-center justify-end gap-1">
                  {isBuy ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-success" />
                      <span className="text-success">Buy</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">Sell</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
