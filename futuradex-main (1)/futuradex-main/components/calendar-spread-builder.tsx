"use client"

import { useState, useMemo } from "react"
import { Calendar, ArrowRight, Info, TrendingUp, TrendingDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Market } from "@/lib/contracts"
import { formatTimeToExpiry } from "@/lib/contracts"
import { cn } from "@/lib/utils"

interface CalendarSpreadBuilderProps {
  markets: Market[]
}

export function CalendarSpreadBuilder({ markets }: CalendarSpreadBuilderProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [nearContractId, setNearContractId] = useState<string>("")
  const [farContractId, setFarContractId] = useState<string>("")
  const [contracts, setContracts] = useState("")
  const [side, setSide] = useState<"buy" | "sell">("buy")

  // Get unique events
  const events = useMemo(() => {
    const eventMap = new Map()
    markets.forEach((market) => {
      if (market.contract.type === "future" && !eventMap.has(market.contract.eventId)) {
        eventMap.set(market.contract.eventId, market.contract.eventName)
      }
    })
    return Array.from(eventMap.entries()).map(([id, name]) => ({ id, name }))
  }, [markets])

  // Get contracts for selected event
  const eventContracts = useMemo(() => {
    if (!selectedEventId) return []
    return markets
      .filter((m) => m.contract.eventId === selectedEventId && m.contract.type === "future")
      .sort((a, b) => a.contract.expiryTimestamp - b.contract.expiryTimestamp)
  }, [markets, selectedEventId])

  const nearContract = eventContracts.find((m) => m.contractId === nearContractId)
  const farContract = eventContracts.find((m) => m.contractId === farContractId)

  // Calculate spread metrics
  const spreadMetrics = useMemo(() => {
    if (!nearContract || !farContract || !contracts) return null

    const nearPrice = nearContract.currentPrice
    const farPrice = farContract.currentPrice
    const spread = farPrice - nearPrice
    const spreadBps = spread * 10000 // basis points
    const contractsNum = Number.parseFloat(contracts)

    // Buy spread = buy far, sell near (profit if spread widens)
    // Sell spread = sell far, buy near (profit if spread narrows)
    const cost = side === "buy" ? contractsNum * (farPrice - nearPrice) : contractsNum * (nearPrice - farPrice)

    const maxProfit =
      side === "buy"
        ? contractsNum * (1 - spread) // Spread can widen to max of 1
        : contractsNum * spread // Spread can narrow to 0

    const maxLoss =
      side === "buy"
        ? contractsNum * spread // Spread can narrow to 0
        : contractsNum * (1 - spread) // Spread can widen to max of 1

    return {
      spread,
      spreadBps,
      cost: Math.abs(cost),
      maxProfit,
      maxLoss,
      nearPrice,
      farPrice,
      isContango: spread > 0,
    }
  }, [nearContract, farContract, contracts, side])

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Calendar Spread Builder</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Trade the difference between two expiry dates</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Calendar spreads let you trade the term structure. Buy the spread if you expect it to widen, sell if
                  you expect it to narrow.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Event Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event">Select Event</Label>
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger id="event">
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEventId && eventContracts.length >= 2 && (
            <>
              {/* Contract Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="near">Near-Term Contract</Label>
                  <Select value={nearContractId} onValueChange={setNearContractId}>
                    <SelectTrigger id="near">
                      <SelectValue placeholder="Select near contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventContracts.map((market) => (
                        <SelectItem key={market.contractId} value={market.contractId}>
                          {market.contract.expiryDate.toLocaleDateString()} - {(market.currentPrice * 100).toFixed(2)}¢
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="far">Far-Term Contract</Label>
                  <Select value={farContractId} onValueChange={setFarContractId}>
                    <SelectTrigger id="far">
                      <SelectValue placeholder="Select far contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventContracts.map((market) => (
                        <SelectItem key={market.contractId} value={market.contractId}>
                          {market.contract.expiryDate.toLocaleDateString()} - {(market.currentPrice * 100).toFixed(2)}¢
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Spread Visualization */}
              {nearContract && farContract && (
                <Card className="border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">Near Term</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-foreground">
                        {(nearContract.currentPrice * 100).toFixed(2)}¢
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatTimeToExpiry(nearContract.contract.expiryDate)}
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div className="mt-1 text-xs text-muted-foreground">Spread</div>
                      <div className="mt-0.5 font-mono text-sm font-semibold text-primary">
                        {spreadMetrics ? `${(spreadMetrics.spread * 100).toFixed(2)}¢` : "-"}
                      </div>
                    </div>

                    <div className="flex-1 text-right">
                      <div className="text-xs text-muted-foreground">Far Term</div>
                      <div className="mt-1 font-mono text-lg font-semibold text-foreground">
                        {(farContract.currentPrice * 100).toFixed(2)}¢
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatTimeToExpiry(farContract.contract.expiryDate)}
                      </div>
                    </div>
                  </div>

                  {spreadMetrics && (
                    <div className="mt-4 flex items-center justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1",
                          spreadMetrics.isContango
                            ? "border-success/50 bg-success/10 text-success"
                            : "border-destructive/50 bg-destructive/10 text-destructive",
                        )}
                      >
                        {spreadMetrics.isContango ? (
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
                    </div>
                  )}
                </Card>
              )}

              {/* Trade Configuration */}
              {nearContract && farContract && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant={side === "buy" ? "default" : "outline"}
                      onClick={() => setSide("buy")}
                      className="flex-1"
                    >
                      Buy Spread
                    </Button>
                    <Button
                      variant={side === "sell" ? "default" : "outline"}
                      onClick={() => setSide("sell")}
                      className="flex-1"
                    >
                      Sell Spread
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contracts">Contracts</Label>
                    <Input
                      id="contracts"
                      type="number"
                      placeholder="0"
                      value={contracts}
                      onChange={(e) => setContracts(e.target.value)}
                      className="font-mono"
                    />
                  </div>

                  {/* Trade Summary */}
                  {spreadMetrics && Number.parseFloat(contracts) > 0 && (
                    <Card className="border-border bg-muted/50 p-4">
                      <h4 className="mb-3 text-sm font-semibold text-foreground">Trade Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Strategy</span>
                          <span className="font-semibold text-foreground">
                            {side === "buy" ? "Buy" : "Sell"} Calendar Spread
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Spread</span>
                          <span className="font-mono font-semibold text-foreground">
                            {(spreadMetrics.spread * 100).toFixed(2)}¢ ({spreadMetrics.spreadBps.toFixed(0)} bps)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Est. Cost</span>
                          <span className="font-mono font-semibold text-foreground">
                            ${spreadMetrics.cost.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Profit</span>
                          <span className="font-mono font-semibold text-success">
                            ${spreadMetrics.maxProfit.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Loss</span>
                          <span className="font-mono font-semibold text-destructive">
                            ${spreadMetrics.maxLoss.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Submit Button */}
                  <Button size="lg" className="w-full" disabled={!contracts || Number.parseFloat(contracts) <= 0}>
                    {side === "buy" ? "Buy" : "Sell"} Calendar Spread
                  </Button>

                  {/* Educational Info */}
                  <Card className="border-border bg-muted/30 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-foreground">How it works</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {side === "buy" ? (
                        <>
                          <strong>Buying the spread:</strong> You're buying the far-term contract and selling the
                          near-term contract. You profit if the spread widens (far term becomes relatively more
                          expensive). This strategy bets on increasing long-term confidence.
                        </>
                      ) : (
                        <>
                          <strong>Selling the spread:</strong> You're selling the far-term contract and buying the
                          near-term contract. You profit if the spread narrows (prices converge). This strategy bets on
                          near-term catalysts or decreasing long-term uncertainty.
                        </>
                      )}
                    </p>
                  </Card>
                </>
              )}
            </>
          )}

          {selectedEventId && eventContracts.length < 2 && (
            <Card className="border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                This event needs at least 2 contracts with different expiry dates to create a calendar spread.
              </p>
            </Card>
          )}
        </div>
      </Card>
    </div>
  )
}
