"use client"

import { useState, useEffect } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Wallet,
  History,
  Settings,
  Zap,
  Menu,
  LogOut,
  Search,
} from "lucide-react"

import SendModal from "@/components/send-modal"
import ReceiveModal from "@/components/receive-modal"
import SwapModal from "@/components/swap-modal"
import LogoutModal from "@/components/logout-modal"

import Sidebar from "@/components/sidebar"
import TokenBalanceCard from "@/components/token-balance-card"
import WorldChainStatus from "@/components/worldchain-status"
import SDKTest from "@/components/sdk-test"
import DebugConsole from "@/components/debug-console"
import WalletConnect from "@/components/wallet-connect"

import { useWorldChain } from "@/components/worldchain-provider"
import { formatUnits } from "ethers"

export default function TPulseFiWallet() {
  /* ------------------------------------------------------------------ */
  /* Local UI state                                                     */
  /* ------------------------------------------------------------------ */
  const [activeTab, setActiveTab] = useState("wallet")
  const [showBalance, setShowBalance] = useState(true)

  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [receiveModalOpen, setReceiveModalOpen] = useState(false)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [scanLines, setScanLines] = useState(0)

  /* ------------------------------------------------------------------ */
  /* Global state from WorldChain context                               */
  /* ------------------------------------------------------------------ */
  const {
    tokenBalances,
    tokenDetails,
    walletTokens,
    isLoadingBalances,
    isLoadingTokens,
    refreshBalances,
    refreshWalletTokens,
    connectionStatus,
    user,
    isAuthenticated,
    login,
    logout,
  } = useWorldChain()

  /* ------------------------------------------------------------------ */
  /* Calculate real token amounts (no USD values)                       */
  /* ------------------------------------------------------------------ */
  const calculateTokenAmounts = () => {
    let totalTokens = 0
    let tpfAmount = 0

    walletTokens.forEach((tokenAddress) => {
      const balance = tokenBalances[tokenAddress]
      const details = tokenDetails[tokenAddress]

      if (balance && balance !== "0" && details) {
        totalTokens++

        // Se for TPF, calcula a quantidade
        if (details.symbol === "TPF") {
          try {
            const formatted = formatUnits(balance, details.decimals)
            tpfAmount = Number.parseFloat(formatted)
          } catch (error) {
            console.error("Erro ao calcular TPF:", error)
          }
        }
      }
    })

    return { totalTokens, tpfAmount }
  }

  const { totalTokens, tpfAmount } = calculateTokenAmounts()

  /* ------------------------------------------------------------------ */
  /* Matrix-style scan-line animation                                   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const id = setInterval(() => {
      setScanLines((prev) => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(id)
  }, [])

  /* ------------------------------------------------------------------ */
  /* If NOT authenticated, we show only the login screen                */
  /* ------------------------------------------------------------------ */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        {/* --- Animated backgrounds & scan lines (kept lightweight) --- */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30 animate-pulse" />
        <div className="fixed inset-0 opacity-20">
          <div
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
            style={{ top: `${scanLines}%`, transition: "top 0.1s linear" }}
          />
        </div>

        <div className="relative z-10 p-4 max-w-sm mx-auto">
          {/* ---- Logo ---- */}
          <div className="mb-6 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              TPulseFi Wallet
            </h1>
            <p className="text-gray-400 text-sm mt-1">Real Tokens via Holdstation SDK</p>
          </div>

          {/* ---- Status, debug & SDK tests (same as full UI) ---- */}
          <WorldChainStatus />
          <DebugConsole />
          {connectionStatus !== "connected" && <SDKTest />}

          {/* ---- Connect Wallet component ---- */}
          <WalletConnect onLoginSuccess={login} onLogout={logout} />
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------------ */
  /* MAIN AUTHENTICATED WALLET UI                                       */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* -------- Cosmetic animated background -------- */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/30 via-black to-cyan-900/30 animate-pulse" />
      <div className="fixed inset-0 opacity-20">
        <div
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"
          style={{ top: `${scanLines}%`, transition: "top 0.1s linear" }}
        />
      </div>

      {/* -------- Sidebar & backdrop -------- */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-md z-40" />
      )}

      {/* -------- Main wrapper -------- */}
      <div className="relative z-10 p-4 max-w-sm mx-auto">
        {/* --------------- Header --------------- */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="text-cyan-400 hover:bg-cyan-500/20 hover:scale-110 transition"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                TPulseFi
              </h1>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLogoutModalOpen(true)}
              className="text-red-400 hover:bg-red-500/20 hover:scale-110 transition"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Connected wallet badge */}
          {user?.walletAddress && (
            <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="text-xs font-mono">
                {user.walletAddress.slice(0, 6)}…{user.walletAddress.slice(-4)}
              </span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                CONNECTED
              </Badge>
            </div>
          )}
        </div>

        {/* --------------- Global status & debug --------------- */}
        <WorldChainStatus />
        <DebugConsole />
        {connectionStatus !== "connected" && <SDKTest />}

        {/* --------------- Main Tabs --------------- */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="wallet">
              <Wallet className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* ---------- WALLET TAB ---------- */}
          <TabsContent value="wallet" className="space-y-4">
            {/* Balance card - REAL QUANTITIES ONLY */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Tokens Reais</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={refreshWalletTokens}
                      disabled={isLoadingTokens}
                      className="h-8 w-8 text-purple-400 hover:bg-purple-500/20"
                    >
                      <Search className={`w-4 h-4 ${isLoadingTokens ? "animate-spin" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowBalance((v) => !v)}>
                      {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showBalance
                    ? tpfAmount > 0
                      ? tpfAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })
                      : "0.00"
                    : "••••••••"}
                </div>
                <div className="text-xs text-gray-400">TPF (Quantidade Real)</div>
                <div className="text-sm text-cyan-400 mt-1">
                  {totalTokens} tokens com saldo • {walletTokens.length} contratos
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => setSendModalOpen(true)} className="h-16 flex flex-col gap-1">
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-xs">Enviar</span>
              </Button>
              <Button onClick={() => setReceiveModalOpen(true)} className="h-16 flex flex-col gap-1">
                <ArrowDownLeft className="w-5 h-5" />
                <span className="text-xs">Receber</span>
              </Button>
              <Button onClick={() => setSwapModalOpen(true)} className="h-16 flex flex-col gap-1">
                <RefreshCw className="w-5 h-5" />
                <span className="text-xs">Swap</span>
              </Button>
            </div>

            {/* Real blockchain stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400">Tokens Únicos</div>
                  <div className="text-lg font-bold text-cyan-400">{walletTokens.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs text-gray-400">Com Saldo</div>
                  <div className="text-lg font-bold text-green-400">{totalTokens}</div>
                </CardContent>
              </Card>
            </div>

            {/* Token balances - REAL QUANTITIES */}
            <TokenBalanceCard tokenBalances={tokenBalances} isLoading={isLoadingBalances} onRefresh={refreshBalances} />
          </TabsContent>

          {/* ---------- HISTORY TAB ---------- */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Histórico</CardTitle>
                <CardDescription>Transações reais da blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">Histórico real será implementado em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- SETTINGS TAB ---------- */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configurações</CardTitle>
                <CardDescription>Gerencie sua carteira</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40">
                    <div>
                      <h3 className="text-sm text-gray-300">Endereço</h3>
                      <p className="text-xs text-gray-500">{user.walletAddress}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40">
                    <div>
                      <h3 className="text-sm text-gray-300">Tokens Encontrados</h3>
                      <p className="text-xs text-gray-500">{walletTokens.length} contratos únicos</p>
                    </div>
                    <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      REAL
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* -------- Modals -------- */}
      <SendModal open={sendModalOpen} onOpenChange={setSendModalOpen} />
      <ReceiveModal open={receiveModalOpen} onOpenChange={setReceiveModalOpen} />
      <SwapModal open={swapModalOpen} onOpenChange={setSwapModalOpen} />
      <LogoutModal open={logoutModalOpen} onOpenChange={setLogoutModalOpen} />
    </div>
  )
}
