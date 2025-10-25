"use client"

import { useState } from "react"
import { MarketList } from "@/components/market-list"
import { TradingInterface } from "@/components/trading-interface"
import { PortfolioView } from "@/components/portfolio-view"
import { CalendarSpreadBuilder } from "@/components/calendar-spread-builder"
import { Header } from "@/components/header"
import { generateMockMarkets } from "@/lib/mock-data"

export default function Home() {
  const [activeView, setActiveView] = useState<"markets" | "portfolio" | "spreads">("markets")
  const [markets] = useState(generateMockMarkets())

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header activeView={activeView} onViewChange={setActiveView} />
      <div className="flex flex-1 overflow-hidden">
        {activeView === "markets" && (
          <>
            <MarketList />
            <TradingInterface />
          </>
        )}
        {activeView === "portfolio" && (
          <div className="flex-1 overflow-y-auto p-6">
            <PortfolioView />
          </div>
        )}
        {activeView === "spreads" && (
          <div className="flex-1 overflow-y-auto p-6">
            <CalendarSpreadBuilder markets={markets} />
          </div>
        )}
      </div>
    </div>
  )
}
