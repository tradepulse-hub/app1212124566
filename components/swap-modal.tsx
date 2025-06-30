"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, ArrowUpDown } from "lucide-react"

interface SwapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SwapModal({ open, onOpenChange }: SwapModalProps) {
  const [fromToken, setFromToken] = useState("TPULSE")
  const [toToken, setToToken] = useState("ETH")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")

  const tokens = [
    { symbol: "TPULSE", name: "TPulseFi", balance: "15,420.75" },
    { symbol: "ETH", name: "Ethereum", balance: "2.45" },
    { symbol: "BTC", name: "Bitcoin", balance: "0.125" },
    { symbol: "USDT", name: "Tether", balance: "1,250.00" },
    { symbol: "BNB", name: "Binance Coin", balance: "5.8" },
  ]

  const handleSwap = () => {
    console.log("Swap:", { fromToken, toToken, fromAmount, toAmount })
    onOpenChange(false)
  }

  const swapTokens = () => {
    const tempToken = fromToken
    setFromToken(toToken)
    setToToken(tempToken)
    const tempAmount = fromAmount
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-2 border-cyan-500/40 backdrop-blur-xl text-white shadow-2xl shadow-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-cyan-500/5 animate-pulse" />
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2 text-cyan-400 animate-pulse">
            <RefreshCw className="w-5 h-5" />
            Swap de Tokens
          </DialogTitle>
          <DialogDescription className="text-gray-400">Troque seus tokens instantaneamente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 relative z-10">
          {/* From Token */}
          <div className="space-y-2">
            <Label className="text-gray-300">De</Label>
            <div className="flex gap-2">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-24 bg-gray-800/60 border-2 border-gray-700 text-white hover:border-gray-600 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-2 border-gray-700">
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="text-white hover:bg-gray-700">
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 bg-gray-800/60 border-2 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-cyan-500/50 transition-all duration-300"
              />
            </div>
            <div className="text-xs text-gray-500 animate-pulse">
              Saldo: {tokens.find((t) => t.symbol === fromToken)?.balance} {fromToken}
            </div>
          </div>

          {/* Enhanced Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapTokens}
              className="border-2 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 shadow-lg shadow-cyan-500/20 bg-transparent hover:scale-110 hover:rotate-180 transition-all duration-500"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label className="text-gray-300">Para</Label>
            <div className="flex gap-2">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-24 bg-gray-800/60 border-2 border-gray-700 text-white hover:border-gray-600 transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-2 border-gray-700">
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol} className="text-white hover:bg-gray-700">
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="flex-1 bg-gray-800/60 border-2 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-cyan-500/50 transition-all duration-300"
              />
            </div>
            <div className="text-xs text-gray-500 animate-pulse">
              Saldo: {tokens.find((t) => t.symbol === toToken)?.balance} {toToken}
            </div>
          </div>

          {/* Enhanced Exchange Rate */}
          <div className="bg-gray-800/40 p-3 rounded-lg border-2 border-gray-700/60 space-y-2 hover:border-gray-600/80 transition-all duration-300">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Taxa de câmbio:</span>
              <span className="text-cyan-400 animate-pulse">
                1 {fromToken} = 0.0015 {toToken}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Taxa de swap:</span>
              <span className="text-purple-400 animate-pulse">0.3%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Slippage:</span>
              <span className="text-yellow-400 animate-pulse">0.5%</span>
            </div>
            <div className="border-t-2 border-gray-700 pt-2 flex justify-between font-medium text-white">
              <span>Você receberá:</span>
              <span className="text-cyan-400 animate-pulse">
                {toAmount || "0.00"} {toToken}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSwap}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300 border-2 border-cyan-500/50"
            >
              Confirmar Swap
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
