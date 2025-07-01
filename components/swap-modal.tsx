"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowUpDown, Repeat, CheckCircle, XCircle, Loader2, Coins, TrendingUp } from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

interface SwapModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
  const {
    tokenDetails,
    tokenBalances,
    walletTokens,
    popularTokens,
    getSwapQuote,
    executeSwap,
    isSDKLoaded,
    walletAddress,
  } = useWorldChain()

  const [tokenIn, setTokenIn] = useState<string>("")
  const [tokenOut, setTokenOut] = useState<string>("")
  const [amountIn, setAmountIn] = useState("")
  const [slippage, setSlippage] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [txResult, setTxResult] = useState<{
    success: boolean
    txHash?: string
    error?: string
  } | null>(null)
  const [step, setStep] = useState<"form" | "quote" | "confirm" | "result">("form")

  // Combina tokens da carteira com tokens populares
  const availableTokens = [
    ...walletTokens.map((address) => tokenDetails[address]).filter(Boolean),
    ...popularTokens.filter((token) => !walletTokens.includes(token.address)),
  ]

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTokenIn("")
      setTokenOut("")
      setAmountIn("")
      setSlippage(0.5)
      setQuote(null)
      setTxResult(null)
      setStep("form")
    }
  }, [isOpen])

  const tokenInData = tokenDetails[tokenIn] || popularTokens.find((t) => t.address === tokenIn)
  const tokenOutData = tokenDetails[tokenOut] || popularTokens.find((t) => t.address === tokenOut)
  const tokenInBalance = tokenBalances[tokenIn] || "0"

  const formatBalance = (balance: string, decimals: number) => {
    if (!balance || balance === "0") return "0"
    const balanceNum = Number.parseFloat(balance) / Math.pow(10, decimals)
    return balanceNum.toFixed(6)
  }

  const canGetQuote = () => {
    if (!isSDKLoaded || !walletAddress) return false
    if (!tokenIn || !tokenOut || tokenIn === tokenOut) return false
    if (!amountIn || Number.parseFloat(amountIn) <= 0) return false

    if (tokenInData) {
      const balance = Number.parseFloat(formatBalance(tokenInBalance, tokenInData.decimals))
      return Number.parseFloat(amountIn) <= balance
    }

    return false
  }

  const handleGetQuote = async () => {
    if (!canGetQuote()) return

    setIsLoading(true)
    setStep("quote")

    try {
      console.log("📊 Obtendo quote de swap...")
      const quoteParams = {
        tokenIn,
        tokenOut,
        amountIn: (Number.parseFloat(amountIn) * Math.pow(10, tokenInData?.decimals || 18)).toString(),
        slippage: slippage.toString(),
        fee: "0.3", // 0.3% fee padrão
      }

      const result = await getSwapQuote(quoteParams)
      console.log("✅ Quote obtido:", result)

      setQuote(result)
      setStep("confirm")
    } catch (error) {
      console.error("❌ Erro ao obter quote:", error)
      setTxResult({
        success: false,
        error: (error as Error).message,
      })
      setStep("result")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!quote) return

    setIsLoading(true)

    try {
      console.log("🔄 Executando swap...")
      const swapParams = {
        tokenIn,
        tokenOut,
        amountIn: (Number.parseFloat(amountIn) * Math.pow(10, tokenInData?.decimals || 18)).toString(),
        slippage: slippage.toString(),
        fee: "0.3",
      }

      const result = await executeSwap(swapParams)
      console.log("✅ Swap executado:", result)

      setTxResult(result)
      setStep("result")
    } catch (error) {
      console.error("❌ Erro ao executar swap:", error)
      setTxResult({
        success: false,
        error: (error as Error).message,
      })
      setStep("result")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwapTokens = () => {
    const tempTokenIn = tokenIn
    setTokenIn(tokenOut)
    setTokenOut(tempTokenIn)
    setAmountIn("")
    setQuote(null)
    setStep("form")
  }

  const handleClose = () => {
    setStep("form")
    setQuote(null)
    setTxResult(null)
    onClose()
  }

  const renderForm = () => (
    <div className="space-y-6">
      {/* Token In */}
      <div className="space-y-2">
        <Label>De</Label>
        <div className="space-y-2">
          <Select value={tokenIn} onValueChange={setTokenIn}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o token de origem" />
            </SelectTrigger>
            <SelectContent>
              {availableTokens.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                      <Coins className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-xs text-gray-500">{token.symbol}</div>
                    </div>
                    {tokenBalances[token.address] && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {formatBalance(tokenBalances[token.address], token.decimals)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            step="any"
            min="0"
          />

          {tokenIn && tokenInData && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Saldo disponível:</span>
              <span className="font-medium">
                {formatBalance(tokenInBalance, tokenInData.decimals)} {tokenInData.symbol}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSwapTokens}
          className="rounded-full bg-blue-100 hover:bg-blue-200"
        >
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Token Out */}
      <div className="space-y-2">
        <Label>Para</Label>
        <Select value={tokenOut} onValueChange={setTokenOut}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o token de destino" />
          </SelectTrigger>
          <SelectContent>
            {availableTokens
              .filter((token) => token.address !== tokenIn)
              .map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                      <Coins className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{token.name}</div>
                      <div className="text-xs text-gray-500">{token.symbol}</div>
                    </div>
                    {tokenBalances[token.address] && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {formatBalance(tokenBalances[token.address], token.decimals)}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Slippage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Slippage Tolerance</Label>
          <span className="text-sm text-gray-600">{slippage}%</span>
        </div>
        <Slider
          value={[slippage]}
          onValueChange={(value) => setSlippage(value[0])}
          max={5}
          min={0.1}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0.1%</span>
          <span>5%</span>
        </div>
      </div>

      {/* Get Quote Button */}
      <Button
        onClick={handleGetQuote}
        disabled={!canGetQuote() || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
        {isLoading ? "Obtendo Quote..." : "Obter Quote"}
      </Button>
    </div>
  )

  const renderQuote = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Obtendo Quote</h3>
        <p className="text-gray-600">Calculando a melhor rota de swap...</p>
      </div>

      <div className="flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    </div>
  )

  const renderConfirm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Repeat className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Confirmar Swap</h3>
        <p className="text-gray-600">Revise os detalhes do seu swap</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">De:</span>
            <span className="font-medium">
              {amountIn} {tokenInData?.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Para:</span>
            <span className="font-medium">
              {quote?.addons?.outAmount
                ? (Number.parseFloat(quote.addons.outAmount) / Math.pow(10, tokenOutData?.decimals || 18)).toFixed(6)
                : "0"}{" "}
              {tokenOutData?.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Taxa:</span>
            <span className="font-medium">{quote?.addons?.rateSwap || "1.0"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Slippage:</span>
            <span className="font-medium">{slippage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Mínimo recebido:</span>
            <span className="font-medium">
              {quote?.addons?.minReceived
                ? (Number.parseFloat(quote.addons.minReceived) / Math.pow(10, tokenOutData?.decimals || 18)).toFixed(6)
                : "0"}{" "}
              {tokenOutData?.symbol}
            </span>
          </div>
          {quote?.addons?.router && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Router:</span>
              <Badge variant="outline" className="text-xs">
                {quote.addons.router}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
          Voltar
        </Button>
        <Button
          onClick={handleSwap}
          disabled={isLoading}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Repeat className="w-4 h-4 mr-2" />}
          {isLoading ? "Executando..." : "Confirmar Swap"}
        </Button>
      </div>
    </div>
  )

  const renderResult = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            txResult?.success ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {txResult?.success ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{txResult?.success ? "Swap Realizado!" : "Erro no Swap"}</h3>
        <p className="text-gray-600">
          {txResult?.success ? "Seu swap foi executado com sucesso" : "Ocorreu um erro ao processar seu swap"}
        </p>
      </div>

      {txResult?.success && txResult.txHash && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hash da Transação:</span>
              </div>
              <div className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{txResult.txHash}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {txResult?.error && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="text-red-600 text-sm">{txResult.error}</div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleClose} className="w-full">
        Fechar
      </Button>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            {step === "form" && "Swap de Tokens"}
            {step === "quote" && "Obtendo Quote"}
            {step === "confirm" && "Confirmar Swap"}
            {step === "result" && "Resultado do Swap"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" && renderForm()}
        {step === "quote" && renderQuote()}
        {step === "confirm" && renderConfirm()}
        {step === "result" && renderResult()}
      </DialogContent>
    </Dialog>
  )
}
