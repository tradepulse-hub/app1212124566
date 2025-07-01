"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, CheckCircle, XCircle, Loader2, AlertTriangle, Coins } from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

interface SendModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SendModal({ isOpen, onClose }: SendModalProps) {
  const { tokenDetails, tokenBalances, walletTokens, popularTokens, sendToken, isSDKLoaded, walletAddress } =
    useWorldChain()

  const [selectedToken, setSelectedToken] = useState<string>("ETH") // Updated default value to "ETH"
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [txResult, setTxResult] = useState<{
    success: boolean
    txHash?: string
    error?: string
  } | null>(null)
  const [step, setStep] = useState<"form" | "confirm" | "result">("form")

  // Combina tokens da carteira com tokens populares
  const availableTokens = [
    ...walletTokens.map((address) => tokenDetails[address]).filter(Boolean),
    ...popularTokens.filter((token) => !walletTokens.includes(token.address)),
  ]

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedToken("ETH") // Updated default value to "ETH"
      setRecipientAddress("")
      setAmount("")
      setMemo("")
      setTxResult(null)
      setStep("form")
    }
  }, [isOpen])

  const selectedTokenData = tokenDetails[selectedToken] || popularTokens.find((t) => t.address === selectedToken)
  const selectedTokenBalance = tokenBalances[selectedToken] || "0"

  const formatBalance = (balance: string, decimals: number) => {
    if (!balance || balance === "0") return "0"
    const balanceNum = Number.parseFloat(balance) / Math.pow(10, decimals)
    return balanceNum.toFixed(6)
  }

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const canSend = () => {
    if (!isSDKLoaded || !walletAddress) return false
    if (!recipientAddress || !isValidAddress(recipientAddress)) return false
    if (!amount || Number.parseFloat(amount) <= 0) return false

    if (selectedToken !== "ETH") {
      // Updated condition to check if selectedToken is not "ETH"
      // ERC20 token
      if (!selectedTokenData) return false
      const balance = Number.parseFloat(formatBalance(selectedTokenBalance, selectedTokenData.decimals))
      return Number.parseFloat(amount) <= balance
    } else {
      // Native token (ETH)
      // Assume we have some ETH for gas
      return Number.parseFloat(amount) > 0
    }
  }

  const handleSend = async () => {
    if (!canSend()) return

    setIsLoading(true)
    setStep("confirm")

    try {
      const sendParams = {
        to: recipientAddress,
        amount: Number.parseFloat(amount),
        ...(selectedToken !== "ETH" && { token: selectedToken }), // Updated condition to check if selectedToken is not "ETH"
      }

      console.log("📤 Enviando token:", sendParams)
      const result = await sendToken(sendParams)

      setTxResult(result)
      setStep("result")

      if (result.success) {
        console.log("✅ Token enviado com sucesso:", result.txHash)
      } else {
        console.error("❌ Erro ao enviar token:", result.error)
      }
    } catch (error) {
      console.error("❌ Erro ao enviar token:", error)
      setTxResult({
        success: false,
        error: (error as Error).message,
      })
      setStep("result")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("form")
    setTxResult(null)
    onClose()
  }

  const renderForm = () => (
    <div className="space-y-6">
      {/* Token Selection */}
      <div className="space-y-2">
        <Label htmlFor="token">Token</Label>
        <Select value={selectedToken} onValueChange={setSelectedToken}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um token ou ETH nativo" />
          </SelectTrigger>
          <SelectContent>
            {/* Native ETH Option */}
            <SelectItem value="ETH">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">ETH</span>
                </div>
                <div>
                  <div className="font-medium">Ethereum (Native)</div>
                  <div className="text-xs text-gray-500">ETH</div>
                </div>
              </div>
            </SelectItem>
            {/* ERC20 Tokens */}
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

        {/* Balance Display */}
        {selectedToken !== "ETH" &&
          selectedTokenData && ( // Updated condition to check if selectedToken is not "ETH"
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Saldo disponível:</span>
              <span className="font-medium">
                {formatBalance(selectedTokenBalance, selectedTokenData.decimals)} {selectedTokenData.symbol}
              </span>
            </div>
          )}
      </div>

      {/* Recipient Address */}
      <div className="space-y-2">
        <Label htmlFor="recipient">Endereço do destinatário</Label>
        <Input
          id="recipient"
          placeholder="0x..."
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className={`${
            recipientAddress && !isValidAddress(recipientAddress) ? "border-red-500 focus:border-red-500" : ""
          }`}
        />
        {recipientAddress && !isValidAddress(recipientAddress) && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            Endereço inválido
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Quantidade</Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="any"
            min="0"
          />
          {selectedTokenData && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              {selectedTokenData.symbol}
            </div>
          )}
        </div>
        {selectedToken !== "ETH" &&
          selectedTokenData &&
          amount && ( // Updated condition to check if selectedToken is not "ETH"
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium">
                {amount} {selectedTokenData.symbol}
              </span>
            </div>
          )}
      </div>

      {/* Memo (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="memo">Memo (opcional)</Label>
        <Textarea
          id="memo"
          placeholder="Adicione uma nota para esta transação..."
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
        />
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={!canSend() || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        {isLoading ? "Enviando..." : "Enviar"}
      </Button>
    </div>
  )

  const renderConfirm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Confirmando Envio</h3>
        <p className="text-gray-600">Processando sua transação...</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Token:</span>
            <span className="font-medium">{selectedTokenData ? selectedTokenData.symbol : "ETH"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Quantidade:</span>
            <span className="font-medium">{amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Para:</span>
            <span className="font-mono text-sm">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </span>
          </div>
          {memo && (
            <div className="flex items-start justify-between">
              <span className="text-gray-600">Memo:</span>
              <span className="text-sm text-right max-w-48">{memo}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
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
        <h3 className="text-lg font-semibold mb-2">{txResult?.success ? "Envio Realizado!" : "Erro no Envio"}</h3>
        <p className="text-gray-600">
          {txResult?.success ? "Sua transação foi enviada com sucesso" : "Ocorreu um erro ao processar sua transação"}
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
            <Send className="w-5 h-5" />
            {step === "form" && "Enviar Token"}
            {step === "confirm" && "Confirmando Envio"}
            {step === "result" && "Resultado do Envio"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" && renderForm()}
        {step === "confirm" && renderConfirm()}
        {step === "result" && renderResult()}
      </DialogContent>
    </Dialog>
  )
}
