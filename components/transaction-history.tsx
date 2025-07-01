"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  History,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Repeat,
} from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

interface TransactionHistoryProps {
  className?: string
}

export default function TransactionHistory({ className }: TransactionHistoryProps) {
  const { transactionHistory, isLoadingHistory, refreshHistory, tokenDetails } = useWorldChain()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filteredTransactions, setFilteredTransactions] = useState(transactionHistory)

  // Update filtered transactions when history or filters change
  useEffect(() => {
    let filtered = transactionHistory

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((tx) => {
        switch (filterType) {
          case "send":
            return tx.method === "transfer" && tx.transfers.some((t) => t.from.toLowerCase() === tx.to.toLowerCase())
          case "receive":
            return tx.method === "transfer" && tx.transfers.some((t) => t.to.toLowerCase() === tx.to.toLowerCase())
          case "swap":
            return tx.method === "swap" || tx.protocol.includes("swap")
          default:
            return true
        }
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.transfers.some(
            (t) =>
              t.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
              t.to.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    setFilteredTransactions(filtered)
  }, [transactionHistory, searchTerm, filterType])

  const getTransactionIcon = (tx: any) => {
    switch (tx.method) {
      case "transfer":
        return tx.transfers.some((t: any) => t.from.toLowerCase() === tx.to.toLowerCase()) ? (
          <ArrowUpRight className="w-4 h-4 text-red-500" />
        ) : (
          <ArrowDownLeft className="w-4 h-4 text-green-500" />
        )
      case "swap":
        return <Repeat className="w-4 h-4 text-blue-500" />
      default:
        return <History className="w-4 h-4 text-gray-500" />
    }
  }

  const getTransactionType = (tx: any) => {
    switch (tx.method) {
      case "transfer":
        return tx.transfers.some((t: any) => t.from.toLowerCase() === tx.to.toLowerCase()) ? "Envio" : "Recebimento"
      case "swap":
        return "Swap"
      default:
        return "Transação"
    }
  }

  const getStatusIcon = (success: string) => {
    switch (success) {
      case "true":
      case "1":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "false":
      case "0":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusText = (success: string) => {
    switch (success) {
      case "true":
      case "1":
        return "Sucesso"
      case "false":
      case "0":
        return "Falhou"
      default:
        return "Pendente"
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatTokenAmount = (amount: string, tokenAddress: string) => {
    const token = tokenDetails[tokenAddress]
    if (!token) return amount

    const amountNum = Number.parseFloat(amount) / Math.pow(10, token.decimals)
    return `${amountNum.toFixed(6)} ${token.symbol}`
  }

  const openInExplorer = (hash: string) => {
    window.open(`https://worldchain.blockscout.com/tx/${hash}`, "_blank")
  }

  return (
    <Card className={`bg-gray-900/70 border-2 border-blue-500/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-lg text-blue-400">Histórico de Transações</CardTitle>
            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
              {filteredTransactions.length}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={refreshHistory}
            disabled={isLoadingHistory}
            className="h-8 w-8 text-blue-400 hover:bg-blue-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por hash ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/60 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32 bg-gray-800/60 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="send">Envios</SelectItem>
              <SelectItem value="receive">Recebimentos</SelectItem>
              <SelectItem value="swap">Swaps</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Carregando histórico...</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {transactionHistory.length === 0
                ? "Nenhuma transação encontrada"
                : "Nenhuma transação corresponde aos filtros"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.hash}
                className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getTransactionIcon(tx)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{getTransactionType(tx)}</span>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(tx.success)}
                          <span className="text-xs text-gray-400">{getStatusText(tx.success)}</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-400 mb-2">
                        <span className="font-mono">{formatAddress(tx.hash)}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>

                      {/* Transfers */}
                      {tx.transfers.length > 0 && (
                        <div className="space-y-1">
                          {tx.transfers.slice(0, 2).map((transfer, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-gray-400">
                                {formatAddress(transfer.from)} → {formatAddress(transfer.to)}
                              </span>
                              <span className="ml-2 text-blue-400 font-medium">
                                {formatTokenAmount(transfer.amount, transfer.tokenAddress)}
                              </span>
                            </div>
                          ))}
                          {tx.transfers.length > 2 && (
                            <div className="text-xs text-gray-500">+{tx.transfers.length - 2} mais transferências</div>
                          )}
                        </div>
                      )}

                      {/* Protocol */}
                      {tx.protocol && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {tx.protocol}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openInExplorer(tx.hash)}
                    className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
