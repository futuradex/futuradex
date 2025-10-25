"use client"

import { useState } from "react"
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateMockPositions, generateMockMarkets } from "@/lib/mock-data"
import { calculateMargin } from "@/lib/amm"
import { formatTimeToExpiry } from "@/lib/contracts"
import { cn } from "@/lib/utils"
import type { Position } from "@/lib/contracts"

export function PortfolioView() {
  const [positions] = useState(generateMockPositions("user-1"))
  const [markets] = useState(generateMockMarkets())

  // Calculate portfolio metrics
  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0)
  const totalRealizedPnL = positions.reduce((sum, pos) => sum + pos.realizedPnL, 0)
  const totalMargin = positions.reduce((sum, pos) => sum + pos.margin, 0)
  const accountBalance = 10000 // Mock account balance
  const availableMargin = accountBalance - totalMargin
  const marginUtilization = (totalMargin / accountBalance) * 100

  const isPositivePnL = totalUnrealizedPnL >= 0

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Account Balance</p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">${accountBalance.toLocaleString()}</p>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className={cn("font-mono text-2xl font-bold", isPositivePnL ? "text-success" : "text-destructive")}>
                  {isPositivePnL ? "+" : ""}${totalUnrealizedPnL.toFixed(2)}
                </p>
              </div>
            </div>
            {isPositivePnL ? (
              <TrendingUp className="h-8 w-8 text-success" />
            ) : (
              <TrendingDown className="h-8 w-8 text-destructive" />
            )}
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">Margin Used</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">${totalMargin.toFixed(2)}</p>
            <div className="mt-2">
              <Progress value={marginUtilization} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{marginUtilization.toFixed(1)}% utilized</p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-4">
          <div>
            <p className="text-xs text-muted-foreground">Available Margin</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">${availableMargin.toFixed(2)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {positions.length} {positions.length === 1 ? "position" : "positions"} open
            </p>
          </div>
        </Card>
      </div>

      {/* Positions Table */}
      <Card className="border-border bg-card">
        <Tabs defaultValue="positions" className="w-full">
          <div className="border-b border-border px-6 pt-6">
            <TabsList className="bg-transparent">
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="positions" className="p-6">
            {positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-muted-foreground">No open positions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => {
                  const market = markets.find((m) => m.contractId === position.contractId)
                  if (!market) return null

                  const isLong = position.contracts > 0
                  const isProfitable = position.unrealizedPnL > 0
                  const marginHealth =
                    (position.margin / calculateMargin(position.contracts, position.entryPrice).initialMargin) * 100
                  const isAtRisk = marginHealth < 120

                  return (
                    <PositionCard
                      key={position.id}
                      position={position}
                      market={market}
                      isLong={isLong}
                      isProfitable={isProfitable}
                      marginHealth={marginHealth}
                      isAtRisk={isAtRisk}
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No trade history available</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

interface PositionCardProps {
  position: Position
  market: any
  isLong: boolean
  isProfitable: boolean
  marginHealth: number
  isAtRisk: boolean
}

function PositionCard({ position, market, isLong, isProfitable, marginHealth, isAtRisk }: PositionCardProps) {
  const [showCloseDialog, setShowCloseDialog] = useState(false)

  const pnlPercentage = (position.unrealizedPnL / position.margin) * 100
  const daysHeld = Math.floor((Date.now() - position.openedAt.getTime()) / (24 * 60 * 60 * 1000))

  return (
    <Card className="border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Badge variant={isLong ? "default" : "destructive"} className="font-mono">
              {isLong ? "LONG" : "SHORT"}
            </Badge>
            <h3 className="font-semibold text-foreground">{market.contract.eventName}</h3>
            {isAtRisk && (
              <Badge variant="outline" className="gap-1 border-destructive/50 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-3 w-3" />
                At Risk
              </Badge>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Contracts</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                {Math.abs(position.contracts).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Entry Price</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                {(position.entryPrice * 100).toFixed(2)}¢
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Current Price</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                {(position.currentPrice * 100).toFixed(2)}¢
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <p
                  className={cn("font-mono text-sm font-semibold", isProfitable ? "text-success" : "text-destructive")}
                >
                  {isProfitable ? "+" : ""}${position.unrealizedPnL.toFixed(2)}
                </p>
                <span className={cn("text-xs", isProfitable ? "text-success" : "text-destructive")}>
                  ({pnlPercentage > 0 ? "+" : ""}
                  {pnlPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Margin</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">${position.margin.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Liquidation Price</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                {position.liquidationPrice ? `${(position.liquidationPrice * 100).toFixed(2)}¢` : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Time Held</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{daysHeld}d</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Expires In</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {formatTimeToExpiry(market.contract.expiryDate)}
              </p>
            </div>
          </div>

          {/* Margin Health Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Margin Health</span>
              <span className={cn("font-semibold", isAtRisk ? "text-destructive" : "text-foreground")}>
                {marginHealth.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={Math.min(marginHealth, 100)}
              className={cn("mt-1 h-2", isAtRisk && "[&>div]:bg-destructive")}
            />
          </div>
        </div>

        <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-4">
              <X className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Position</DialogTitle>
              <DialogDescription>
                Are you sure you want to close this position? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-semibold text-foreground">
                      {isLong ? "LONG" : "SHORT"} {Math.abs(position.contracts)} contracts
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current P&L</span>
                    <span className={cn("font-semibold", isProfitable ? "text-success" : "text-destructive")}>
                      {isProfitable ? "+" : ""}${position.unrealizedPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Close Price</span>
                    <span className="font-mono font-semibold text-foreground">
                      {(position.currentPrice * 100).toFixed(2)}¢
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCloseDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle close position
                  setShowCloseDialog(false)
                }}
                className="flex-1"
              >
                Confirm Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
