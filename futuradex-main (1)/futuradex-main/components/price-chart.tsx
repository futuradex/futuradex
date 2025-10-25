"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

interface PriceChartProps {
  data: Array<{ time: number; price: number }>
  currentPrice: number
}

export function PriceChart({ data, currentPrice }: PriceChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      time: new Date(point.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      price: point.price * 100, // Convert to cents
    }))
  }, [data])

  const priceChange = data.length > 1 ? data[data.length - 1].price - data[0].price : 0
  const isPositive = priceChange >= 0

  return (
    <Card className="h-full border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Price History (24h)</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-foreground">{(currentPrice * 100).toFixed(2)}¢</span>
            <span className={isPositive ? "text-success" : "text-destructive"}>
              {isPositive ? "+" : ""}
              {(priceChange * 100).toFixed(2)}¢
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}¢`}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`${value.toFixed(2)}¢`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
