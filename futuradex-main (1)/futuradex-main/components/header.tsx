"use client"

import { Wallet, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HeaderProps {
  activeView?: "markets" | "portfolio" | "spreads"
  onViewChange?: (view: "markets" | "portfolio" | "spreads") => void
}

export function Header({ activeView = "markets", onViewChange }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
            <span className="font-mono text-lg font-bold text-primary-foreground">F</span>
          </div>
          <span className="text-xl font-bold tracking-tight">FUTURA</span>
        </div>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => onViewChange?.("markets")}
            className={cn(
              "text-sm font-medium transition-colors",
              activeView === "markets" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Markets
          </button>
          <button
            onClick={() => onViewChange?.("spreads")}
            className={cn(
              "text-sm font-medium transition-colors",
              activeView === "spreads" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Calendar Spreads
          </button>
          <button
            onClick={() => onViewChange?.("portfolio")}
            className={cn(
              "text-sm font-medium transition-colors",
              activeView === "portfolio" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Portfolio
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="font-mono text-xs text-muted-foreground">Testnet</span>
        </div>

        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Wallet className="h-4 w-4" />
          <span className="font-mono">0x7a4f...3b2c</span>
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
