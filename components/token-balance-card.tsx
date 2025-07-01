"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Wallet, ExternalLink, TrendingUp, Zap } from "lucide-react"
import { formatUnits } from "ethers"

interface TokenBalanceCardProps {
  tokenBalances: Record<string, string>
  isLoading: boolean
  onRefresh: () => void
}

const TOKEN_INFO = {
  "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45": {
    symbol: "TPF",
    name: "TPulseFi",
    decimals: 18,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30",
    price: 1.502,
    change: "+12.5%",
    isMainToken: true,
  },
  "0x4200000000000000000000000000000000000006": {
    symbol: "WETH",
    name: "Wrapped Ethereum",
    decimals: 18,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    price: 3420.5,
    change: "+2.4%",
    isMainToken: false,
  },
  "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": {
    symbol: "USDCe",
    name: "USD Coin",
    decimals: 6,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
    price: 1.0,
    change: "+0.1%",
    isMainToken: false,
  },
  "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": {
    symbol: "WLD",
    name: "Worldcoin",
    decimals: 18,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    price: 2.85,
    change: "+15.7%",
    isMainToken: false,
  },
}

export default function TokenBalanceCard({ tokenBalances, isLoading, onRefresh }: TokenBalanceCardProps) {
  const formatBalance = (balance: string, decimals: number) => {
    if (!balance || balance === "0") return "0.00"

    try {
      const formatted = formatUnits(balance, decimals)
      const num = Number.parseFloat(formatted)

      if (num < 0.0001) return "< 0.0001"
      if (num < 1) return num.toFixed(6)
      if (num < 1000) return num.toFixed(4)

      return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } catch (error) {
      console.error("Erro ao formatar balance:", error)
      return "0.00"
    }
  }

  const calculateUSDValue = (balance: string, decimals: number, price: number) => {
    if (!balance || balance === "0") return 0

    try {
      const formatted = formatUnits(balance, decimals)
      const num = Number.parseFloat(formatted)
      return num * price
    } catch (error) {
      return 0
    }
  }

  const totalUSDValue = Object.entries(TOKEN_INFO).reduce((total, [address, info]) => {
    const balance = tokenBalances[address] || "0"
    return total + calculateUSDValue(balance, info.decimals, info.price)
  }, 0)

  // Separa TPF dos outros tokens
  const tpfToken = Object.entries(TOKEN_INFO).find(([_, info]) => info.isMainToken)
  const otherTokens = Object.entries(TOKEN_INFO).filter(([_, info]) => !info.isMainToken)

  return (
    <Card className="bg-gray-900/70 border-2 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <CardTitle className="text-sm text-gray-300">WorldChain Portfolio</CardTitle>
            <Badge
              variant="secondary"
              className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse"
            >
              LIVE
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 h-8 w-8 hover:scale-110 transition-all duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Total Portfolio Value */}
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Total Portfolio</span>
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-3 h-3 animate-bounce" />
              <span className="text-xs">+8.2%</span>
            </div>
          </div>
          <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            ${totalUSDValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        <div className="space-y-3">
          {/* TPulseFi Token - Destaque especial */}
          {tpfToken && (
            <div
              className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/40 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 group cursor-pointer relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-cyan-500/25">
                  <Zap className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-cyan-400">TPF</span>
                    <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border-cyan-500/40 animate-pulse">
                      MAIN
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      +12.5%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-300">TPulseFi Token</div>
                  <div className="text-xs text-cyan-400 font-medium">$1.502</div>
                </div>
              </div>

              <div className="text-right relative z-10">
                <div className="text-lg font-bold text-cyan-400 animate-pulse">
                  {isLoading ? "..." : formatBalance(tokenBalances[tpfToken[0]] || "0", tpfToken[1].decimals)}
                </div>
                <div className="text-xs text-gray-400">TPF</div>
                <div className="text-sm text-cyan-300 font-medium">
                  $
                  {calculateUSDValue(
                    tokenBalances[tpfToken[0]] || "0",
                    tpfToken[1].decimals,
                    tpfToken[1].price,
                  ).toFixed(2)}
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10" />
            </div>
          )}

          {/* Outros Tokens */}
          {otherTokens.map(([address, info]) => {
            const balance = tokenBalances[address] || "0"
            const formattedBalance = formatBalance(balance, info.decimals)
            const usdValue = calculateUSDValue(balance, info.decimals, info.price)

            return (
              <div
                key={address}
                className={`flex items-center justify-between p-3 rounded-lg ${info.bgColor} border ${info.borderColor} hover:scale-[1.02] transition-all duration-300 hover:shadow-lg group cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${info.bgColor} border ${info.borderColor} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}
                  >
                    <span className={`text-sm font-bold ${info.color}`}>{info.symbol.slice(0, 2)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${info.color}`}>{info.symbol}</span>
                      <Badge
                        variant="secondary"
                        className={`text-xs px-1.5 py-0.5 ${
                          info.change.startsWith("+")
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {info.change}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{info.name}</div>
                    <div className="text-xs text-gray-400">${info.price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold ${info.color} ${isLoading ? "animate-pulse" : ""}`}>
                    {isLoading ? "..." : formattedBalance}
                  </div>
                  <div className="text-xs text-gray-500">{info.symbol}</div>
                  <div className="text-xs text-gray-400">${usdValue.toFixed(2)}</div>
                </div>

                <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )
          })}

          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 text-cyan-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <div className="text-center">
                  <div className="text-sm font-medium">Conectando ao WorldChain...</div>
                  <div className="text-xs text-gray-400 mt-1">Chain ID: 480 (0x1e0)</div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && Object.keys(tokenBalances).length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Nenhum token encontrado</div>
              <div className="text-xs mt-1">Verifique a conexão com o WorldChain</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
