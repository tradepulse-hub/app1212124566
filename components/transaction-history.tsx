"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useWorldChain } from "@/components/worldchain-provider"

interface TransactionHistoryProps {
  className?: string
}

export default function TransactionHistory({ className }: TransactionHistoryProps) {
  const { transactionHistory, isLoadingHistory, refreshHistory, tokenDetails, popularTokens } = useWorldChain()

  const [selectedFilter, setSelectedFilter] = useState<"all" | "send" | "receive" | "swap">("all")

  useEffect(() => {
    // Carrega histórico inicial
    refreshHistory()
  }, [])

  const getTokenSymbol = (tokenAddress: string) => {
    if (!tokenAddress || tokenAddress === "0x0000000000000000000000000000000000000000") {
      return "ETH"
    }

    const details = tokenDetails[tokenAddress] || popularTokens.find((t) => t.address === tokenAddress)
    return details?.symbol || "TOKEN"
  }

  const getTransactionType = (tx: any) => {
    if (tx.method?.includes("swap") || tx.protocol?.includes("swap")) {
      return "swap"
    }

    if (tx.transfers && tx.transfers.length > 0) {
      // Verifica se é envio ou recebimento baseado nos transfers
      const hasOutgoing = tx.transfers.some((t: any) => t.from?.toLowerCase() === tx.from?.toLowerCase())
      const hasIncoming = tx.transfers.some((t: any) => t.to?.toLowerCase() === tx.to?.toLowerCase())

      if (hasOutgoing && hasIncoming) return "swap"
      if (hasOutgoing) return "send"
      if (hasIncoming) return "receive"
    }

    return "unknown"
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />
      case "receive":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />
      case "swap":
        return <RotateCcw className="w-4 h-4 text-blue-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusIcon = (success: string) => {
    if (success === "true" || success === "1") {
      return <CheckCircle className="w-3 h-3 text-green-400" />
    } else if (success === "false" || success === "0") {
      return <XCircle className="w-3 h-3 text-red-400" />
    }
    return <Clock className="w-3 h-3 text-yellow-400" />
  }

  const filteredTransactions = transactionHistory.filter((tx) => {
    if (selectedFilter === "all") return true
    return getTransactionType(tx) === selectedFilter
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const formatAmount = (amount: string, decimals = 18) => {
    try {
      const value = Number.parseFloat(amount) / Math.pow(10, decimals)
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      })
    } catch {
      return "0.00"
    }
  }

  return (
    <Card className={`bg-gray-900/60 border-gray-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Histórico de Transações
            </CardTitle>
            <CardDescription className="text-gray-400">Suas transações recentes no WorldChain</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshHistory}
            disabled={isLoadingHistory}
            className="border-gray-700 text-gray-400 hover:text-white bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Todas" },
            { key: "send", label: "Enviadas" },
            { key: "receive", label: "Recebidas" },
            { key: "swap", label: "Swaps" },
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.key as any)}
              className="text-xs"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <Separator className="bg-gray-700" />

        {/* Lista de Transações */}
        <ScrollArea className="h-96">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando histórico...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma transação encontrada</p>
              <p className="text-sm">Suas transações aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx, index) => {
                const txType = getTransactionType(tx)

                return (
                  <div
                    key={tx.hash || index}
                    className="p-3 rounded-lg bg-gray-800/40 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getTransactionIcon(txType)}</div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium capitalize">
                              {txType === "send"
                                ? "Enviado"
                                : txType === "receive"
                                  ? "Recebido"
                                  : txType === "swap"
                                    ? "Swap"
                                    : "Transação"}
                            </span>
                            {getStatusIcon(tx.success)}
                          </div>

                          {tx.transfers && tx.transfers.length > 0 && (
                            <div className="space-y-1">
                              {tx.transfers.slice(0, 2).map((transfer: any, i: number) => (
                                <div key={i} className="text-sm text-gray-400">
                                  {formatAmount(transfer.amount)} {getTokenSymbol(transfer.tokenAddress)}
                                </div>
                              ))}
                              {tx.transfers.length > 2 && (
                                <div className="text-xs text-gray-500">+{tx.transfers.length - 2} mais</div>
                              )}
                            </div>
                          )}

                          <div className="text-xs text-gray-500">{formatDate(tx.date)}</div>

                          {tx.protocol && (
                            <Badge variant="secondary" className="text-xs">
                              {tx.protocol}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Bloco #{tx.block}</div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-gray-500 hover:text-white"
                          onClick={() => {
                            // Abrir no explorador de blocos
                            const explorerUrl = `https://worldchain-mainnet.explorer.alchemy.com/tx/${tx.hash}`
                            window.open(explorerUrl, "_blank")
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {tx.hash && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-xs text-gray-500 font-mono">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
