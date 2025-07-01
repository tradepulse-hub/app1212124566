"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Scan, Zap, AlertTriangle, CheckCircle } from "lucide-react"
import { useWorldChain } from "@/components/worldchain-provider"
import { formatUnits } from "@/lib/ethers-format"

interface SendModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SendModal({ open, onOpenChange }: SendModalProps) {
  const { tokenBalances, tokenDetails, walletTokens, popularTokens, sendToken } = useWorldChain()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("")
  const [memo, setMemo] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)

  // Combina tokens da carteira com tokens populares
  const availableTokens = [
    // Token nativo (ETH) primeiro
    {
      address: "",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      chainId: 480,
    },
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

  const handleSend = async () => {
    if (!recipient || !amount) {
      console.error("❌ Dados insuficientes para envio")
      return
    }

    setIsSending(true)
    setSendResult(null)

    try {
      console.log("📤 Enviando token...")

      const sendParams = {
        to: recipient,
        amount: Number.parseFloat(amount),
        ...(selectedToken && selectedToken !== "" && { token: selectedToken }),
      }

      const result = await sendToken(sendParams)
      setSendResult(result)

      if (result.success) {
        console.log("✅ Token enviado com sucesso:", result.txHash)
        // Limpa o formulário
        setRecipient("")
        setAmount("")
        setSelectedToken("")
        setMemo("")
      } else {
        console.error("❌ Envio falhou:", result.error)
      }
    } catch (error) {
      console.error("❌ Erro ao enviar token:", error)
      setSendResult({
        success: false,
        error: (error as Error).message,
      })
    } finally {
      setIsSending(false)
    }
  }

  const getTokenBalance = (tokenAddress: string) => {
    // Para token nativo (ETH), usar balance específico se disponível
    if (!tokenAddress || tokenAddress === "") {
      // Aqui você pode implementar lógica para balance de ETH
      return "0.00"
    }

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
    if (!tokenAddress || tokenAddress === "") return "ETH"

    const details = tokenDetails[tokenAddress] || popularTokens.find((t) => t.address === tokenAddress)
    return details?.symbol || "TOKEN"
  }

  const canSend = recipient && amount && Number.parseFloat(amount) > 0 && !isSending

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-2 border-purple-500/40 backdrop-blur-xl text-white shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/5 animate-pulse" />

        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2 text-purple-400">
            <ArrowUpRight className="w-5 h-5" />
            Enviar Tokens
          </DialogTitle>
          <DialogDescription className="text-gray-400">Envie tokens nativos ou ERC20 no WorldChain</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 relative z-10">
          {/* Recipient Address */}
          <div className="space-y-2">
            <Label className="text-gray-300">Destinatário</Label>
            <div className="flex gap-2">
              <Input
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-1 bg-gray-800/60 border-gray-700 text-white font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-gray-700 text-gray-400 hover:text-white bg-transparent"
                onClick={() => {
                  // Aqui você pode implementar scanner de QR code
                  console.log("📷 Scanner QR não implementado ainda")
                }}
              >
                <Scan className="w-4 h-4" />
              </Button>
            </div>
            {recipient && !isValidAddress(recipient) && (
              <div className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Endereço inválido
              </div>
            )}
            {recipient && isValidAddress(recipient) && (
              <div className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Endereço válido
              </div>
            )}
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="bg-gray-800/60 border-gray-700 text-white">
                <SelectValue placeholder="Selecione o token" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {availableTokens.map((token) => (
                  <SelectItem key={token.address || "native"} value={token.address || ""}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span>{token.symbol}</span>
                        <span className="text-xs text-gray-500">{token.name}</span>
                      </div>
                      {(walletTokens.includes(token.address) || token.address === "") && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {getTokenBalance(token.address)}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedToken && (
              <div className="text-xs text-gray-500">
                Saldo disponível: {getTokenBalance(selectedToken)} {getTokenSymbol(selectedToken)}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-gray-300">Quantidade</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800/60 border-gray-700 text-white"
            />
            {selectedToken && amount && (
              <div className="text-xs text-gray-500">
                Enviando: {amount} {getTokenSymbol(selectedToken)}
              </div>
            )}
          </div>

          {/* Memo (Optional) */}
          <div className="space-y-2">
            <Label className="text-gray-300">Memo (Opcional)</Label>
            <Textarea
              placeholder="Adicione uma nota para esta transação..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="bg-gray-800/60 border-gray-700 text-white resize-none"
              rows={2}
            />
          </div>

          {/* Transaction Preview */}
          {canSend && (
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Zap className="w-4 h-4" />
                Resumo da Transação
              </div>
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Para:</span>
                  <span className="font-mono">
                    {recipient.slice(0, 6)}...{recipient.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>
                    {amount} {getTokenSymbol(selectedToken)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <span>{selectedToken ? "ERC20 Token" : "Token Nativo (ETH)"}</span>
                </div>
                {memo && (
                  <div className="flex justify-between">
                    <span>Memo:</span>
                    <span className="truncate max-w-32">{memo}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Send Result */}
          {sendResult && (
            <div
              className={`p-3 rounded-lg border ${
                sendResult.success
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                {sendResult.success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Token enviado com sucesso!
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Erro no envio: {sendResult.error}
                  </>
                )}
              </div>
              {sendResult.txHash && (
                <div className="text-xs mt-1 font-mono">
                  TX: {sendResult.txHash.slice(0, 10)}...{sendResult.txHash.slice(-8)}
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
              onClick={handleSend}
              disabled={!canSend}
              className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 animate-spin" />
                  Enviando...
                </div>
              ) : (
                "Enviar Token"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
