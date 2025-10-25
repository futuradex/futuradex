/**
 * Sigmoid CFMM implementation for probability futures
 * Maintains bounded prices in [0, 1] range with symmetric depth
 */

export interface AMMState {
  netPosition: number // Q_T - net inventory position
  basePosition: number // Q0 - equilibrium position
  liquidityDepth: number // k - controls price sensitivity
  totalLiquidity: number // Total collateral in pool
}

export interface PriceQuote {
  price: number // Current mark price [0, 1]
  slippage: number // Expected slippage for trade
  impact: number // Price impact percentage
}

/**
 * Sigmoid function for bounded price calculation
 * p(Q) = 1 / (1 + exp(-k * (Q - Q0)))
 */
export function calculatePrice(state: AMMState): number {
  const { netPosition, basePosition, liquidityDepth } = state
  const exponent = -liquidityDepth * (netPosition - basePosition)
  const sigmoid = 1 / (1 + Math.exp(exponent))

  // Clip to safe bounds [0.01, 0.99] to prevent edge cases
  return Math.max(0.01, Math.min(0.99, sigmoid))
}

/**
 * Calculate price after a trade of given size
 */
export function calculatePriceAfterTrade(
  state: AMMState,
  tradeSize: number, // positive = buy, negative = sell
): PriceQuote {
  const currentPrice = calculatePrice(state)

  // New state after trade
  const newState: AMMState = {
    ...state,
    netPosition: state.netPosition + tradeSize,
  }

  const newPrice = calculatePrice(newState)
  const slippage = Math.abs(newPrice - currentPrice)
  const impact = (slippage / currentPrice) * 100

  return {
    price: newPrice,
    slippage,
    impact,
  }
}

/**
 * Calculate average execution price for a trade
 */
export function calculateExecutionPrice(state: AMMState, tradeSize: number): number {
  const steps = 100
  const stepSize = tradeSize / steps
  let totalCost = 0
  const currentState = { ...state }

  for (let i = 0; i < steps; i++) {
    const price = calculatePrice(currentState)
    totalCost += price * Math.abs(stepSize)
    currentState.netPosition += stepSize
  }

  return totalCost / Math.abs(tradeSize)
}

/**
 * Calculate required collateral for a position
 */
export function calculateMargin(
  contracts: number,
  entryPrice: number,
  maintenanceMarginRate = 0.1,
): {
  initialMargin: number
  maintenanceMargin: number
  maxLoss: number
} {
  const notional = Math.abs(contracts)
  const maxLoss = contracts > 0 ? entryPrice * notional : (1 - entryPrice) * notional

  return {
    initialMargin: maxLoss * 1.2, // 20% buffer
    maintenanceMargin: maxLoss * (1 + maintenanceMarginRate),
    maxLoss,
  }
}

/**
 * Calculate PnL for a position
 */
export function calculatePnL(contracts: number, entryPrice: number, currentPrice: number): number {
  return contracts * (currentPrice - entryPrice)
}

/**
 * Initialize AMM state for a new market
 */
export function initializeAMM(initialLiquidity: number, initialProbability = 0.5, depth = 5): AMMState {
  // Calculate base position to achieve initial probability
  const basePosition = -Math.log(1 / initialProbability - 1) / depth

  return {
    netPosition: basePosition,
    basePosition,
    liquidityDepth: depth,
    totalLiquidity: initialLiquidity,
  }
}
