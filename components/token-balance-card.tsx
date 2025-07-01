"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Wallet, ExternalLink, Zap, AlertTriangle, Search } from "lucide-react"
import { formatUnits } from "ethers"
import { useWorldChain } from "./worldchain-provider"

interface TokenBalanceCardProps {
  tokenBalances: Record<string, string>
  isLoading: boolean
  onRefresh: () => void
}

export default function TokenBalanceCard({ tokenBalances, isLoading, onRefresh }: TokenBalanceCardProps) {
  const { tokenDetails, walletTokens, isLoadingTokens, refreshWalletTokens } = useWorldChain()

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
        maximumFractionDigits: 4,
      })
    } catch (error) {
      console.error("Erro ao formatar balance:", error)
      return "0.00"
    }
  }

  const getTokenColor = (symbol: string) => {
    const colors = {
      TPF: "text-cyan-400 bg-cyan-500/20 border-cyan-500/30",
      WETH: "text-blue-400 bg-blue-500/20 border-blue-500/30",
      USDCe: "text-green-400 bg-green-500/20 border-green-500/30",
      USDC: "text-green-400 bg-green-500/20 border-green-500/30",
      WLD: "text-purple-400 bg-purple-500/20 border-purple-500/30",
      default: "text-gray-400 bg-gray-500/20 border-gray-500/30",
    }
    return colors[symbol as keyof typeof colors] || colors.default
  }

  const hasAnyBalance = Object.values(tokenBalances).some((balance) => balance && balance !== "0")

  return (
    <Card className="bg-gray-900/70 border-2 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <CardTitle className="text-sm text-gray-300">Tokens Reais</CardTitle>
            <Badge
              variant="secondary"
              className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse"
            >
              HOLDSTATION
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshWalletTokens}
              disabled={isLoadingTokens}
              className="text-gray-400 hover:text-purple-400 hover:bg-purple-500/20 h-8 w-8 hover:scale-110 transition-all duration-300"
            >
              <Search className={`w-3 h-3 ${isLoadingTokens ? "animate-spin" : ""}`} />
            </Button>
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
        </div>

        {/* Wallet Tokens Count */}
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Tokens Encontrados</span>
            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
              {walletTokens.length} TOKENS
            </Badge>
          </div>
          <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {walletTokens.length} contratos únicos
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative z-10">
        <div className="space-y-3">
          {/* Lista todos os tokens encontrados */}
          {walletTokens.map((tokenAddress) => {
            const details = tokenDetails[tokenAddress]
            const balance = tokenBalances[tokenAddress] || "0"

            if (!details) {
              return (
                <div
                  key={tokenAddress}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border border-gray-700 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600/40" />
                    <div>
                      <div className="w-16 h-4 bg-gray-600/40 rounded mb-1" />
                      <div className="w-24 h-3 bg-gray-600/40 rounded" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Carregando...</div>
                </div>
              )
            }

            const formattedBalance = formatBalance(balance, details.decimals)
            const colorClasses = getTokenColor(details.symbol)
            const [textColor, bgColor, borderColor] = colorClasses.split(" ")

            return (
              <div
                key={tokenAddress}
                className={`flex items-center justify-between p-3 rounded-lg ${bgColor} border ${borderColor} hover:scale-[1.02] transition-all duration-300 hover:shadow-lg group cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${bgColor} border ${borderColor} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}
                  >
                    <span className={`text-sm font-bold ${textColor}`}>{details.symbol.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${textColor}`}>{details.symbol}</span>
                      {details.symbol === "TPF" && (
                        <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border-cyan-500/40 animate-pulse">
                          MAIN
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{details.name}</div>
                    <div className="text-xs text-gray-400 font-mono">
                      {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-sm font-bold ${textColor} ${isLoading ? "animate-pulse" : ""}`}>
                    {isLoading ? "..." : formattedBalance}
                  </div>
                  <div className="text-xs text-gray-500">{details.symbol}</div>
                  <div className="text-xs text-gray-400">{details.decimals} decimals</div>
                </div>

                <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )
          })}

          {isLoadingTokens && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 text-cyan-400">
                <Search className="w-5 h-5 animate-spin" />
                <div className="text-center">
                  <div className="text-sm font-medium">Buscando tokens REAIS...</div>
                  <div className="text-xs text-gray-400 mt-1">Holdstation SDK</div>
                </div>
              </div>
            </div>
          )}

          {isLoading && !isLoadingTokens && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 text-cyan-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <div className="text-center">
                  <div className="text-sm font-medium">Carregando balances REAIS...</div>
                  <div className="text-xs text-gray-400 mt-1">WorldChain RPC</div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isLoadingTokens && walletTokens.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <Wallet className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Nenhum token encontrado</div>
              <div className="text-xs mt-1 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Dados REAIS da blockchain
              </div>
            </div>
          )}

          {!isLoading && !isLoadingTokens && walletTokens.length > 0 && !hasAnyBalance && (
            <div className="text-center py-4 text-yellow-400">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm">Tokens encontrados mas sem saldo</div>
              <div className="text-xs mt-1">Verifique se a carteira tem tokens</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
