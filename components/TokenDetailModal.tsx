"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TokenTrade } from "@/components/TokenTrade"
import { CandlestickChart } from "@/components/CandlestickChart"
import { useCandlestickData } from "@/hooks/useCandlestickData"
import { PriceDisplay } from "@/components/PriceDisplay"
import { SocialLinks } from "@/components/SocialLinks"
import { TokenData } from "@/hooks/useWebSocket"
import { Clock, TrendingUp, BarChart3, Activity } from "lucide-react"

interface TokenDetailModalProps {
  token: TokenData | null
  priceData?: any
  isLoadingPrice: boolean
  isOpen: boolean
  onClose: () => void
}

export const TokenDetailModal = ({ 
  token, 
  priceData, 
  isLoadingPrice, 
  isOpen, 
  onClose 
}: TokenDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "chart" | "trade">("overview")
  
  // STEP 3: Use bondingCurveKey as the pool address for MEVX API
  const poolAddress = token?.bondingCurveKey || undefined
  
  // STEP 4: Call MEVX API with the bonding curve key to fetch OHLC data
  const {
    data: candlestickData,
    isLoading: isLoadingChart,
    error: chartError,
    refetch: refetchChart,
  } = useCandlestickData(poolAddress, "1s")

  console.log("TokenDetailModal - Using pool address:", poolAddress, "for token:", token?.symbol)

  if (!token) return null

  const timeAgo = () => {
    const now = Date.now()
    const diff = now - token.created_timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "bonding":
        return (
          <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
            BONDING
          </Badge>
        )
      case "graduated":
        return (
          <Badge variant="secondary" className="bg-green-600 text-white text-xs">
            GRADUATED
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-slate-600 text-white text-xs">
            NEW
          </Badge>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-slate-700 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold overflow-hidden">
                {token.image && token.image !== "/placeholder.svg?height=48&width=48" ? (
                  <img
                    src={token.image || "/placeholder.svg"}
                    alt={token.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-white font-semibold text-lg">${getInitials(token.name)}</span>`
                      }
                    }}
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">{getInitials(token.name)}</span>
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">{token.name}</DialogTitle>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-slate-300 text-lg">{token.symbol}</p>
                  {getCategoryBadge(token.category)}
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {timeAgo()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "overview" 
                ? "border-blue-400 text-white" 
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("chart")}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "chart" 
                ? "border-blue-400 text-white" 
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Chart
          </button>
          <button
            onClick={() => setActiveTab("trade")}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "trade" 
                ? "border-blue-400 text-white" 
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trade
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Price Display */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Price Information</h3>
                <PriceDisplay
                  price={priceData?.price || 0}
                  marketCap={priceData?.marketCap || token.market_cap_value || 0}
                  liquidity={priceData?.liquidity || 0}
                  priceChange24h={priceData?.priceChange24h || 0}
                  volume24h={priceData?.volume24h || 0}
                  isLoading={isLoadingPrice}
                />
              </div>

              {/* Token Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Token Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contract Address:</span>
                      <span className="text-white font-mono">{token.mint.slice(0, 8)}...{token.mint.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Creator:</span>
                      <span className="text-white font-mono">{token.creator.slice(0, 8)}...{token.creator.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white capitalize">{token.category}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {token.description || "No description available."}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Social Links</h3>
                <SocialLinks 
                  twitter={token.twitter} 
                  telegram={token.telegram} 
                  website={token.website} 
                />
              </div>
            </div>
          )}

          {activeTab === "chart" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
              {!poolAddress ? (
                <div className="w-full h-[400px] bg-slate-950 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-yellow-400 mb-2">Bonding curve data not available</p>
                    <p className="text-slate-500 text-sm">
                      This token doesn't have bonding curve information needed for chart data.
                    </p>
                  </div>
                </div>
              ) : chartError ? (
                <div className="w-full h-[400px] bg-slate-950 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-400 mb-2">Failed to load chart data</p>
                    <p className="text-slate-500 text-sm mb-4">{chartError}</p>
                    <Button
                      onClick={refetchChart}
                      variant="outline"
                      size="sm"
                      className="bg-transparent border-slate-600 text-slate-400 hover:bg-slate-800"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <CandlestickChart
                  data={candlestickData}
                  isLoading={isLoadingChart}
                  onRefresh={refetchChart}
                  tokenSymbol={token.symbol}
                />
              )}
              <div className="mt-4 p-3 bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-400">
                  <strong>Chart Data:</strong> Using bonding curve address{" "}
                  {poolAddress ? (
                    <span className="font-mono text-blue-400">
                      {poolAddress.slice(0, 8)}...{poolAddress.slice(-8)}
                    </span>
                  ) : (
                    <span className="text-yellow-400">Not Available</span>
                  )}
                  {" "}to fetch OHLC data from MEVX API.
                </p>
              </div>
            </div>
          )}

          {activeTab === "trade" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Trade {token.symbol}</h3>
              <TokenTrade 
                tokenMint={token.mint} 
                tokenName={token.name} 
                tokenSymbol={token.symbol} 
                defaultTab="buy" 
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
