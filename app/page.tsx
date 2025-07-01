"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Send, ArrowUpDown, History, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"

import { useWorldChain } from "@/components/worldchain-provider"
import { SDKTest } from "@/components/sdk-test"
import { DebugConsole } from "@/components/debug-console"

export default function HomePage() {
  const { isSDKLoaded, sdkError, isConnected, address, balance } = useWorldChain()
  const [activeTab, setActiveTab] = useState("wallet")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TPulseFi Wallet</h1>
          <p className="text-blue-200">WorldChain Integration - Next Generation DeFi</p>
        </div>

        {/* Status Alert */}
        {!isSDKLoaded && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>SDK não carregado:</strong> {sdkError || "Dependências não encontradas"}
              <br />
              <span className="text-sm">
                Execute: <code>npm run manual-install</code>
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Status da Carteira
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Conexão:</span>
                  <Badge variant={isConnected ? "default" : "secondary"}>
                    {isConnected ? "Conectado" : "Desconectado"}
                  </Badge>
                </div>

                {/* Address */}
                {address && (
                  <div>
                    <span className="text-blue-200 text-sm">Endereço:</span>
                    <p className="text-white font-mono text-xs mt-1 break-all">{address}</p>
                  </div>
                )}

                {/* Balance */}
                {balance && (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Balance:</span>
                    <span className="text-white font-bold">{balance} ETH</span>
                  </div>
                )}

                {/* SDK Status */}
                <div className="pt-4 border-t border-white/20">
                  <SDKTest />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Painel Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-white/20">
                    <TabsTrigger value="wallet" className="text-white">
                      <Wallet className="h-4 w-4 mr-2" />
                      Carteira
                    </TabsTrigger>
                    <TabsTrigger value="send" disabled={!isSDKLoaded}>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </TabsTrigger>
                    <TabsTrigger value="swap" disabled={!isSDKLoaded}>
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Swap
                    </TabsTrigger>
                    <TabsTrigger value="history" disabled={!isSDKLoaded}>
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="wallet" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Quick Stats */}
                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <DollarSign className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm">Total Balance</p>
                              <p className="text-white font-bold">{balance || "0.00"} ETH</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-blue-200 text-sm">24h Change</p>
                              <p className="text-white font-bold">+2.34%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Button disabled={!isSDKLoaded} className="h-12" onClick={() => setActiveTab("send")}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Tokens
                      </Button>
                      <Button
                        disabled={!isSDKLoaded}
                        variant="outline"
                        className="h-12 border-white/20 text-white hover:bg-white/10 bg-transparent"
                        onClick={() => setActiveTab("swap")}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Fazer Swap
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="send" className="mt-6">
                    <div className="text-center py-8">
                      <Send className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">Enviar Tokens</h3>
                      <p className="text-blue-200 mb-4">Funcionalidade disponível quando o SDK estiver carregado</p>
                      {!isSDKLoaded && <Badge variant="secondary">SDK necessário</Badge>}
                    </div>
                  </TabsContent>

                  <TabsContent value="swap" className="mt-6">
                    <div className="text-center py-8">
                      <ArrowUpDown className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">Swap de Tokens</h3>
                      <p className="text-blue-200 mb-4">Troque tokens diretamente na WorldChain</p>
                      {!isSDKLoaded && <Badge variant="secondary">SDK necessário</Badge>}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-6">
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">Histórico de Transações</h3>
                      <p className="text-blue-200 mb-4">Visualize todas as suas transações</p>
                      {!isSDKLoaded && <Badge variant="secondary">SDK necessário</Badge>}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Debug Console */}
      <DebugConsole />
    </div>
  )
}
