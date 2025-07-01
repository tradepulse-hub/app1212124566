"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, Send, ArrowUpDown, Plus, Eye, EyeOff, Copy, ExternalLink, AlertTriangle, Zap } from "lucide-react"

import { useWorldChain } from "@/components/worldchain-provider"
import TokenBalanceCard from "@/components/token-balance-card"
import SendModal from "@/components/send-modal"
import SwapModal from "@/components/swap-modal"
import ReceiveModal from "@/components/receive-modal"
import TransactionHistory from "@/components/transaction-history"
import SDKTest from "@/components/sdk-test"
import DebugConsole from "@/components/debug-console"

export default function WalletDashboard() {
  const {
    isSDKLoaded,
    isConnected,
    walletAddress,
    sdkError,
    tokenDetails,
    tokenBalances,
    walletTokens,
    popularTokens,
    connectWallet,
    disconnectWallet,
    refreshTokenData,
    isLoadingTokens,
    isLoadingBalances,
  } = useWorldChain()

  const [showBalance, setShowBalance] = useState(true)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)

  // Mock wallet connection for demo
  const handleConnect = () => {
    if (!isSDKLoaded) {
      alert("SDK não carregado. Instale as dependências necessárias.")
      return
    }
    const mockAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    connectWallet(mockAddress)
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTotalBalance = () => {
    if (!isConnected || Object.keys(tokenBalances).length === 0) return "0.00"

    // Simplified calculation - in real app would use actual prices
    let total = 0
    Object.entries(tokenBalances).forEach(([address, balance]) => {
      const token = tokenDetails[address]
      if (token && balance !== "0") {
        // Mock prices for demo
        const mockPrices: Record<string, number> = {
          WETH: 2500,
          USDCe: 1,
          USDT: 1,
          DAI: 1,
        }
        const price = mockPrices[token.symbol] || 0
        const amount = Number.parseFloat(balance) / Math.pow(10, token.decimals)
        total += amount * price
      }
    })

    return total.toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TPulseFi Wallet
          </h1>
          <p className="text-gray-400 text-sm">WorldChain DeFi Wallet</p>
        </div>

        {/* SDK Status Alert */}
        {!isSDKLoaded && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              <strong>SDK Indisponível:</strong> {sdkError || "Dependências não carregadas"}
              <br />
              <span className="text-xs">Funcionalidades limitadas até resolver as dependências.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        {!isConnected ? (
          <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Wallet className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Conectar Carteira</h2>
              <p className="text-gray-400 mb-4">Conecte sua carteira para começar</p>
              <Button
                onClick={handleConnect}
                disabled={!isSDKLoaded}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isSDKLoaded ? "Conectar Carteira" : "SDK Indisponível"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Wallet Info */}
            <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Carteira Conectada</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono text-sm">{formatAddress(walletAddress!)}</p>
                        <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                    Desconectar
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Saldo Total</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-white">
                        {showBalance ? `$${getTotalBalance()}` : "••••••"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-6 w-6 p-0"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Zap className="w-3 h-3 mr-1" />
                    WorldChain
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSendModalOpen(true)}
                    className="flex flex-col gap-1 h-16 border-purple-500/30 hover:bg-purple-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-xs">Enviar</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setReceiveModalOpen(true)}
                    className="flex flex-col gap-1 h-16 border-purple-500/30 hover:bg-purple-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">Receber</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSwapModalOpen(true)}
                    className="flex flex-col gap-1 h-16 border-purple-500/30 hover:bg-purple-500/20"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="text-xs">Swap</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="tokens" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
                <TabsTrigger value="settings">Config</TabsTrigger>
              </TabsList>

              <TabsContent value="tokens" className="space-y-4">
                {/* Token Balances */}
                <div className="space-y-2">
                  {isLoadingTokens || isLoadingBalances ? (
                    <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm">
                      <CardContent className="p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Carregando tokens...</p>
                      </CardContent>
                    </Card>
                  ) : Object.keys(tokenDetails).length === 0 ? (
                    <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm">
                      <CardContent className="p-4 text-center">
                        <p className="text-gray-400">Nenhum token encontrado</p>
                        <Button variant="ghost" size="sm" onClick={refreshTokenData} className="mt-2">
                          Atualizar
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    Object.entries(tokenDetails).map(([address, token]) => (
                      <TokenBalanceCard
                        key={address}
                        token={token}
                        balance={tokenBalances[address] || "0"}
                        showBalance={showBalance}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <TransactionHistory />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <SDKTest />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Modals */}
        <SendModal open={sendModalOpen} onOpenChange={setSendModalOpen} />
        <SwapModal open={swapModalOpen} onOpenChange={setSwapModalOpen} />
        <ReceiveModal open={receiveModalOpen} onOpenChange={setReceiveModalOpen} />

        {/* Debug Console */}
        <DebugConsole />
      </div>
    </div>
  )
}
