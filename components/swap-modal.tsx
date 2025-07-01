"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, ArrowUpDown, Settings, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import { useWorldChain } from "@/components/worldchain-provider"
import { formatUnits } from "@/lib/ethers-format"

interface SwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SwapModal({ open, onOpenChange }: SwapModalProps) {
  const {
    tokenBalances,
    tokenDetails,
    walletTokens,
    popularTokens,
    getSwapQuote,
    executeSwap,
    getSimpleQuote,
    isLoadingBalances,
  } = useWorldChain()

  const [tokenIn, setTokenIn] = useState("")
  const [tokenOut, setTokenOut] = useState("")
  const [amountIn, setAmountIn] = useState("")
  const [amountOut, setAmountOut] = useState("")
  const [slippage, setSlippage] = useState("0.3")
  const [fee, setFee] = useState("0.2")
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [simpleQuoteData, setSimpleQuoteData] = useState<any>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [swapResult, setSwapResult] = useState<any>(null)

  // Combina tokens da carteira com tokens populares
  const availableTokens = [
    ...popularTokens,
    ...walletTokens
      .map((address) => {
        const details = tokenDetails[address]
        return details
          ? {
              address,
              symbol: details.symbol,
              name: details.name,
              decimals: details.decimals,
              chainId: details.chainId,
            }
          : null
      })
      .filter(Boolean)
      .filter((token, index, self) => self.findIndex((t) => t?.address === token?.address) === index),
  ]

  // Debounce para quotes automáticos
  useEffect(() => {
    if (!tokenIn || !tokenOut || !amountIn || Number.parseFloat(amountIn) <= 0) {
      setQuoteData(null)
      setAmountOut("")
      return
    }

    const timeoutId = setTimeout(async () => {
      await fetchQuote()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [tokenIn, tokenOut, amountIn, slippage, fee])

  // Busca quote simples quando tokens mudam
  useEffect(() => {
    if (tokenIn && tokenOut && tokenIn !== tokenOut) {
      fetchSimpleQuote()
    }
  }, [tokenIn, tokenOut])

  const fetchQuote = async () => {
    if (!tokenIn || !tokenOut || !amountIn) return

    setIsLoadingQuote(true)
    try {
      console.log("📞 Buscando quote de swap...")
      const quote = await getSwapQuote({
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
        fee,
      })

      if (quote) {
        setQuoteData(quote)

        // Calcula amount out baseado no quote
        if (quote.addons?.outAmount) {
          const tokenOutDetails = tokenDetails[tokenOut] || popularTokens.find((t) => t.address === tokenOut)
          if (tokenOutDetails) {
            const formatted = formatUnits(quote.addons.outAmount, tokenOutDetails.decimals)
            setAmountOut(formatted)
          }
        }

        console.log("✅ Quote obtido:", quote)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar quote:", error)
      setQuoteData(null)
      setAmountOut("")
    } finally {
      setIsLoadingQuote(false)
    }
  }

  const fetchSimpleQuote = async () => {
    if (!tokenIn || !tokenOut) return

    try {
      console.log("📊 Buscando quote simples...")
      const result = await getSimpleQuote(tokenIn, tokenOut)

      if (result.success) {
        setSimpleQuoteData(result)
        console.log("✅ Quote simples obtido:", result)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar quote simples:", error)
    }
  }

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn || !quoteData) {
      console.error("❌ Dados insuficientes para swap")
      return
    }

    setIsSwapping(true)
    setSwapResult(null)

    try {
      console.log("🔄 Executando swap...")
      const result = await executeSwap({
        tokenIn,
        tokenOut,
        amountIn,
        slippage,
        fee,
      })

      setSwapResult(result)

      if (result.success) {
        console.log("✅ Swap executado com sucesso:", result.txHash)
        // Limpa o formulário
        setAmountIn("")
        setAmountOut("")
        setQuoteData(null)
      } else {
        console.error("❌ Swap falhou:", result.error)
      }
    } catch (error) {
      console.error("❌ Erro ao executar swap:", error)
      setSwapResult({
        success: false,
        error: (error as Error).message,
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const handleSwapTokens = () => {
    const tempTokenIn = tokenIn
    const tempAmountIn = amountIn

    setTokenIn(tokenOut)
    setTokenOut(tempTokenIn)
    setAmountIn(amountOut)
    setAmountOut(tempAmountIn)
    setQuoteData(null)
  }

  const getTokenBalance = (tokenAddress: string) => {
    const balance = tokenBalances[tokenAddress]
    const details = tokenDetails[tokenAddress] || popularTokens.find((t) => t.address === tokenAddress)

    if (!balance || !details) return "0.00"

    try {
      const formatted = formatUnits(balance, details.decimals)
      return Number.parseFloat(formatted).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      })
    } catch {
      return "0.00"
    }
  }

  const getTokenSymbol = (tokenAddress: string) => {
    const details = tokenDetails[tokenAddress] || popularTokens.find((t) => t.address === tokenAddress)
    return details?.symbol || "TOKEN"
  }

  const canSwap = tokenIn && tokenOut && amountIn && quoteData && !isLoadingQuote && !isSwapping

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-2 border-purple-500/40 backdrop-blur-xl text-white shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/5 animate-pulse" />

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400">
              <RefreshCw className="w-5 h-5" />
              Swap Tokens
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Troque tokens usando routers reais do WorldChain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 relative z-10">
          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 rounded-lg bg-gray-800/60 border border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-300">Slippage Tolerance</Label>
                <div className="flex gap-2">
                  {["0.1", "0.3", "0.5", "1.0"].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage(value)}
                      className="text-xs"
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Fee (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="bg-gray-800/60 border-gray-700 text-white"
                />
              </div>
            </div>
          )}

          {/* Token In */}
          <div className="space-y-2">
            <Label className="text-gray-300">De</Label>
            <div className="flex gap-2">
              <Select value={tokenIn} onValueChange={setTokenIn}>
                <SelectTrigger className="w-32 bg-gray-800/60 border-gray-700 text-white">
                  <SelectValue placeholder="Token" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {availableTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        <span>{token.symbol}</span>
                        {walletTokens.includes(token.address) && (
                          <Badge variant="secondary" className="text-xs">
                            {getTokenBalance(token.address)}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="flex-1 bg-gray-800/60 border-gray-700 text-white"
              />
            </div>
            {tokenIn && walletTokens.includes(tokenIn) && (
              <div className="text-xs text-gray-500">
                Saldo: {getTokenBalance(tokenIn)} {getTokenSymbol(tokenIn)}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwapTokens}
              className="rounded-full border-2 border-gray-700 hover:border-purple-500 hover:scale-110 transition-all duration-300"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Token Out */}
          <div className="space-y-2">
            <Label className="text-gray-300">Para</Label>
            <div className="flex gap-2">
              <Select value={tokenOut} onValueChange={setTokenOut}>
                <SelectTrigger className="w-32 bg-gray-800/60 border-gray-700 text-white">
                  <SelectValue placeholder="Token" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {availableTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      <div className="flex items-center gap-2">
                        <span>{token.symbol}</span>
                        {walletTokens.includes(token.address) && (
                          <Badge variant="secondary" className="text-xs">
                            {getTokenBalance(token.address)}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={amountOut}
                readOnly
                className="flex-1 bg-gray-800/60 border-gray-700 text-white"
              />
            </div>
            {tokenOut && walletTokens.includes(tokenOut) && (
              <div className="text-xs text-gray-500">
                Saldo: {getTokenBalance(tokenOut)} {getTokenSymbol(tokenOut)}
              </div>
            )}
          </div>

          {/* Quote Information */}
          {quoteData && (
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <TrendingUp className="w-4 h-4" />
                Quote Ativo
              </div>

              {quoteData.addons && (
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Taxa:</span>
                    <span>{quoteData.addons.rateSwap || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mín. Recebido:</span>
                    <span>{quoteData.addons.minReceived || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Router:</span>
                    <Badge variant="outline" className="text-xs">
                      {quoteData.addons.router || "Auto"}
                    </Badge>
                  </div>
                  {quoteData.addons.feeAmountOut && (
                    <div className="flex justify-between">
                      <span>Taxa:</span>
                      <span>{quoteData.addons.feeAmountOut}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Simple Quote Info */}
          {simpleQuoteData && simpleQuoteData.success && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Zap className="w-4 h-4" />
                Melhor Rota Disponível
              </div>
              <div className="text-xs text-gray-400">Router: {simpleQuoteData.best?.router || "N/A"}</div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingQuote && (
            <div className="flex items-center justify-center gap-2 text-purple-400 py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Buscando melhor preço...</span>
            </div>
          )}

          {/* Swap Result */}
          {swapResult && (
            <div
              className={`p-3 rounded-lg border ${
                swapResult.success
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {swapResult.success ? (
                  <>
                    <Zap className="w-4 h-4" />
                    Swap executado com sucesso!
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Erro no swap: {swapResult.error}
                  </>
                )}
              </div>
              {swapResult.txHash && (
                <div className="text-xs mt-1 font-mono">
                  TX: {swapResult.txHash.slice(0, 10)}...{swapResult.txHash.slice(-8)}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSwap}
              disabled={!canSwap}
              className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
            >
              {isSwapping ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executando...
                </div>
              ) : (
                "Executar Swap"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
