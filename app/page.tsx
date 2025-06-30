"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  QrCode,
  Eye,
  EyeOff,
  TrendingUp,
  Wallet,
  History,
  Settings,
  Zap,
  Menu,
  LogOut,
} from "lucide-react"
import SendModal from "@/components/send-modal"
import ReceiveModal from "@/components/receive-modal"
import SwapModal from "@/components/swap-modal"
import LogoutModal from "@/components/logout-modal"
import Sidebar from "@/components/sidebar"

export default function TPulseFiWallet() {
  const [activeTab, setActiveTab] = useState("wallet")
  const [showBalance, setShowBalance] = useState(true)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scanLines, setScanLines] = useState(0)

  const balance = 15420.75
  const usdValue = 23156.89

  // Animação de scan lines
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLines((prev) => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const transactions = [
    {
      id: 1,
      type: "receive",
      amount: 500,
      from: "0x742d...8f3a",
      timestamp: "2h",
      status: "confirmed",
    },
    {
      id: 2,
      type: "send",
      amount: -250,
      to: "0x8b2c...4d1e",
      timestamp: "1d",
      status: "confirmed",
    },
    {
      id: 3,
      type: "swap",
      amount: 1000,
      from: "ETH",
      to: "TPULSE",
      timestamp: "2d",
      status: "confirmed",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30 animate-pulse" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] animate-pulse delay-1000" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)] animate-pulse delay-2000" />

      {/* Matrix-like scan lines */}
      <div className="fixed inset-0 opacity-20">
        <div
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
          style={{ top: `${scanLines}%`, transition: "top 0.1s linear" }}
        />
      </div>

      {/* Enhanced Floating Orbs */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-bounce" />
      <div className="fixed bottom-40 right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="fixed top-1/2 left-1/4 w-16 h-16 bg-green-500/20 rounded-full blur-xl animate-ping delay-500" />
      <div className="fixed top-1/3 right-1/3 w-20 h-20 bg-pink-500/15 rounded-full blur-xl animate-bounce delay-700" />
      <div className="fixed bottom-1/4 left-1/2 w-28 h-28 bg-yellow-500/10 rounded-full blur-xl animate-pulse delay-1500" />

      {/* Energy particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Enhanced Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative z-10 p-4 max-w-sm mx-auto">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-110 border border-cyan-500/30 hover:border-cyan-400/50"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse hover:animate-spin transition-all duration-300">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                TPulseFi
              </h1>
            </div>
            <div className="w-10" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-900/60 border border-gray-800 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
            <TabsTrigger
              value="wallet"
              className="data-[state=active]:bg-cyan-500/30 data-[state=active]:text-cyan-400 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
            >
              <Wallet className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-purple-500/30 data-[state=active]:text-purple-400 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
            >
              <History className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-pink-500/30 data-[state=active]:text-pink-400 data-[state=active]:shadow-lg data-[state=active]:shadow-pink-500/50 hover:bg-pink-500/10 transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            {/* Enhanced Balance Card */}
            <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-2 border-cyan-500/40 backdrop-blur-sm shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-300 text-sm">Saldo Total</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 h-8 w-8 hover:scale-110 transition-all duration-300"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 relative z-10">
                <div className="space-y-2">
                  <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                    {showBalance ? `${balance.toLocaleString()}` : "••••••••"}
                  </div>
                  <div className="text-xs text-cyan-400 font-medium animate-pulse">TPULSE</div>
                  <div className="text-gray-400 text-sm">
                    {showBalance ? `≈ $${usdValue.toLocaleString()}` : "≈ $••••••"}
                  </div>
                  <div className="flex items-center gap-2 text-green-400 animate-bounce">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs">+12.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => setSendModalOpen(true)}
                className="h-16 flex-col gap-1 bg-gradient-to-br from-red-500/30 to-red-600/30 border-2 border-red-500/40 hover:from-red-500/50 hover:to-red-600/50 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowUpRight className="w-5 h-5 text-red-400 group-hover:animate-bounce relative z-10" />
                <span className="text-xs text-red-300 relative z-10">Enviar</span>
              </Button>
              <Button
                onClick={() => setReceiveModalOpen(true)}
                className="h-16 flex-col gap-1 bg-gradient-to-br from-green-500/30 to-green-600/30 border-2 border-green-500/40 hover:from-green-500/50 hover:to-green-600/50 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowDownLeft className="w-5 h-5 text-green-400 group-hover:animate-bounce relative z-10" />
                <span className="text-xs text-green-300 relative z-10">Receber</span>
              </Button>
              <Button
                onClick={() => setSwapModalOpen(true)}
                className="h-16 flex-col gap-1 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 border-cyan-500/40 hover:from-cyan-500/50 hover:to-blue-600/50 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <RefreshCw className="w-5 h-5 text-cyan-400 group-hover:animate-spin relative z-10" />
                <span className="text-xs text-cyan-300 relative z-10">Swap</span>
              </Button>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400 mb-1">Preço</div>
                  <div className="text-lg font-bold text-purple-400 animate-pulse">$1.502</div>
                  <div className="text-xs text-green-400 animate-bounce">+5.2%</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/70 border-2 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25">
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                  <div className="text-lg font-bold text-cyan-400 animate-pulse">$2.4M</div>
                  <div className="text-xs text-blue-400 animate-bounce">+18.7%</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Transactions */}
            <Card className="bg-gray-900/70 border-2 border-gray-700/60 backdrop-blur-sm hover:border-gray-600/80 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-300 animate-pulse">Recentes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 border border-gray-700/40 hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-110 ${
                            tx.type === "receive"
                              ? "bg-green-500/30 border-green-500/50 hover:shadow-green-500/25"
                              : tx.type === "send"
                                ? "bg-red-500/30 border-red-500/50 hover:shadow-red-500/25"
                                : "bg-cyan-500/30 border-cyan-500/50 hover:shadow-cyan-500/25"
                          }`}
                        >
                          {tx.type === "receive" ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-400" />
                          ) : tx.type === "send" ? (
                            <ArrowUpRight className="w-4 h-4 text-red-400" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-300">
                            {tx.type === "receive" ? "Recebido" : tx.type === "send" ? "Enviado" : "Swap"}
                          </div>
                          <div className="text-xs text-gray-500">{tx.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}
                          {Math.abs(tx.amount)}
                        </div>
                        <Badge variant="secondary" className="text-xs bg-gray-700/60 text-gray-400 border-gray-600/60">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-gray-900/70 border-2 border-gray-700/60 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-300 animate-pulse">Histórico</CardTitle>
                <CardDescription className="text-gray-500">Todas as transações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((tx, index) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-700/40 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-110 ${
                            tx.type === "receive"
                              ? "bg-green-500/30 border-green-500/50 hover:shadow-green-500/25"
                              : tx.type === "send"
                                ? "bg-red-500/30 border-red-500/50 hover:shadow-red-500/25"
                                : "bg-cyan-500/30 border-cyan-500/50 hover:shadow-cyan-500/25"
                          }`}
                        >
                          {tx.type === "receive" ? (
                            <ArrowDownLeft className="w-5 h-5 text-green-400" />
                          ) : tx.type === "send" ? (
                            <ArrowUpRight className="w-5 h-5 text-red-400" />
                          ) : (
                            <RefreshCw className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-300">
                            {tx.type === "receive" ? "Recebido" : tx.type === "send" ? "Enviado" : "Swap"}
                          </div>
                          <div className="text-xs text-gray-500">{tx.from || tx.to || `${tx.from} → ${tx.to}`}</div>
                          <div className="text-xs text-gray-600">{tx.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </div>
                        <Badge variant="secondary" className="text-xs bg-gray-700/60 text-gray-400 border-gray-600/60">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-900/70 border-2 border-gray-700/60 backdrop-blur-sm hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg text-gray-300 animate-pulse">Configurações</CardTitle>
                <CardDescription className="text-gray-500">Gerencie sua carteira</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border-2 border-gray-700/40 hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 hover:scale-[1.02]">
                    <div>
                      <h3 className="font-medium text-sm text-gray-300">Endereço</h3>
                      <p className="text-xs text-gray-500">0x742d...8f3a</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/20 hover:scale-110 transition-all duration-300 border border-cyan-500/30"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border-2 border-gray-700/40 hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 hover:scale-[1.02]">
                    <div>
                      <h3 className="font-medium text-sm text-gray-300">QR Code</h3>
                      <p className="text-xs text-gray-500">Compartilhar endereço</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-400 hover:bg-purple-500/20 hover:scale-110 transition-all duration-300 border border-purple-500/30"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border-2 border-gray-700/40 hover:bg-gray-800/60 hover:border-gray-600/60 transition-all duration-300 hover:scale-[1.02]">
                    <div>
                      <h3 className="font-medium text-sm text-gray-300">Backup</h3>
                      <p className="text-xs text-gray-500">Exportar chave</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-2 border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent hover:scale-105 transition-all duration-300"
                    >
                      Backup
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border-2 border-red-500/40 hover:bg-red-500/10 hover:border-red-500/60 transition-all duration-300 hover:scale-[1.02] group">
                    <div>
                      <h3 className="font-medium text-sm text-gray-300 group-hover:text-red-300">Logout</h3>
                      <p className="text-xs text-gray-500 group-hover:text-red-400">Sair da carteira</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setLogoutModalOpen(true)}
                      className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:scale-110 transition-all duration-300 border border-red-500/30 hover:border-red-400/50"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <SendModal open={sendModalOpen} onOpenChange={setSendModalOpen} />
        <ReceiveModal open={receiveModalOpen} onOpenChange={setReceiveModalOpen} />
        <SwapModal open={swapModalOpen} onOpenChange={setSwapModalOpen} />
        <LogoutModal open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
      </div>
    </div>
  )
}
