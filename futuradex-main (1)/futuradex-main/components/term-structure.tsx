"use client"

import { useMemo } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"
import type { Market } from "@/lib/contracts"
import { cn } from "@/lib/utils"

interface TermStructureProps {
  markets: Market[]
  eventId: string
}

export function TermStructure({ markets, eventId }: TermStructureProps) {
  // Filter markets for the same event
  const eventMarkets = useMemo(() => {
    return markets
      .filter((m) => m.contract.eventId === eventId && m.contract.type === "future")
      .sort((a, b) => a.contract.expiryTimestamp - b.contract.expiryTimestamp)
  }, [markets, eventId])

  // Prepare chart data
  const chartData = useMemo(() => {
    return eventMarkets.map((market) => {
      const daysToExpiry = Math.floor((market.contract.expiryTimestamp - Date.now()) / (24 * 60 * 60 * 1000))
      return {
        days: daysToExpiry,
        price: market.currentPrice * 100,
        probability: market.currentPrice * 100,
        label: `${daysToExpiry}d`,
        contractId: market.contractId,
        volume: market.volume24h,
      }
    })
  }, [eventMarkets])

  // Calculate term structure metrics
  const metrics = useMemo(() => {
    if (chartData.length < 2) return null

    const nearTerm = chartData[0]
    const farTerm = chartData[chartData.length - 1]
    const spread = farTerm.price - nearTerm.price
    const isContango = spread > 0 // Far term more expensive
    const isBackwardation = spread < 0 // Near term more expensive

    return {
      spread,
      isContango,
      isBackwardation,
      nearTerm,
      farTerm,
    }
  }, [chartData])

  if (eventMarkets.length === 0) {
    return (
      <Card className="border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">No term structure data available for this event.</p>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Term Structure</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Probability curve across different expiry dates</p>
        </div>

        {metrics && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "gap-1",
                metrics.isContango && "border-success/50 bg-success/10 text-success",
                metrics.isBackwardation && "border-destructive/50 bg-destructive/10 text-destructive",
              )}
            >
              {metrics.isContango ? (
                <>
                  <TrendingUp className="h-3 w-3" />
                  Contango
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3" />
                  Backwardation
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Spread:{" "}
              <span className="font-mono font-semibold text-foreground">{Math.abs(metrics.spread).toFixed(2)}¢</span>
            </span>
          </div>
        )}
      </div>

      {/* Term Structure Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="termGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{
                value: "Days to Expiry",
                position: "insideBottom",
                offset: -5,
                fill: "hsl(var(--muted-foreground))",
              }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              label={{
                value: "Implied Probability",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))",
              }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number, name: string) => {
                if (name === "probability") return [`${value.toFixed(2)}%`, "Probability"]
                return [value, name]
              }}
            />
            <ReferenceLine y={50} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.5} />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="url(#termGradient)"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: "hsl(var(--primary))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Contract Details */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Available Contracts</h4>
        <div className="grid gap-2">
          {eventMarkets.map((market, index) => {
            const daysToExpiry = Math.floor((market.contract.expiryTimestamp - Date.now()) / (24 * 60 * 60 * 1000))
            const isNearTerm = index === 0
            const isFarTerm = index === eventMarkets.length - 1

            return (
              <div
                key={market.contractId}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {market.contract.expiryDate.toLocaleDateString()}
                      </span>
                      {isNearTerm && (
                        <Badge variant="outline" className="text-xs">
                          Near
                        </Badge>
                      )}
                      {isFarTerm && (
                        <Badge variant="outline" className="text-xs">
                          Far
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{daysToExpiry} days to expiry</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-mono text-sm font-semibold text-foreground">
                      {(market.currentPrice * 100).toFixed(2)}¢
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="font-mono text-sm font-semibold text-foreground">
                      ${(market.volume24h / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Probability</div>
                    <div className="font-mono text-sm font-semibold text-primary">
                      {(market.currentPrice * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Educational Info */}
      {metrics && (
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-semibold text-foreground">What does this mean?</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {metrics.isContango ? (
              <>
                <strong className="text-success">Contango:</strong> Far-term contracts are priced higher than near-term,
                suggesting the market expects increasing probability over time. This often indicates growing confidence
                in the event occurring.
              </>
            ) : (
              <>
                <strong className="text-destructive">Backwardation:</strong> Near-term contracts are priced higher than
                far-term, suggesting the market expects decreasing probability over time. This may indicate near-term
                catalysts or uncertainty about longer-term outcomes.
              </>
            )}
          </p>
        </div>
      )}
    </Card>
  )
}
