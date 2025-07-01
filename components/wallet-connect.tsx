"use client"

import { MiniKit, type WalletAuthInput } from "@worldcoin/minikit-js"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Zap, CheckCircle, RefreshCw, LogOut, Shield, Globe } from "lucide-react"

const walletAuthInput = (nonce: string): WalletAuthInput => {
  return {
    nonce,
    requestId: "0",
    expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    statement: "Welcome to TPulseFi - The Future of DeFi on WorldChain",
  }
}

interface WalletConnectProps {
  onLoginSuccess?: (user: any) => void
  onLogout?: () => void
}

export default function WalletConnect({ onLoginSuccess, onLogout }: WalletConnectProps) {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Verificar sessão existente
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      setIsCheckingSession(true)
      console.log("🔍 Verificando sessão TPulseFi existente...")

      const response = await fetch("/api/auth/session")

      // Garantimos que o corpo é JSON antes de tentar fazer o parse
      const isJson = response.headers.get("content-type")?.toLowerCase().includes("application/json") ?? false

      if (!response.ok || !isJson) {
        console.log(`ℹ️ Sessão TPulseFi não encontrada (status ${response.status}, json=${isJson})`)
        return
      }

      const sessionData = await response.json()

      if (sessionData?.authenticated && sessionData?.user) {
        console.log("✅ Sessão TPulseFi encontrada:", sessionData.user)
        setUser(sessionData.user)
        onLoginSuccess?.(sessionData.user)
      } else {
        console.log("ℹ️ Nenhuma sessão TPulseFi ativa")
      }
    } catch (error) {
      console.error("❌ Erro ao verificar sessão:", error)
    } finally {
      setIsCheckingSession(false)
    }
  }

  const handleLogin = async () => {
    try {
      setLoading(true)
      console.log("🚀 Iniciando processo de login TPulseFi...")

      // Obter nonce
      const res = await fetch(`/api/nonce`)
      const { nonce } = await res.json()
      console.log("✅ Nonce obtido:", nonce)

      // Autenticar com MiniKit
      console.log("🔐 Iniciando autenticação MiniKit...")
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthInput(nonce))
      console.log("📋 Resposta MiniKit:", finalPayload)

      if (finalPayload.status === "error") {
        console.error("❌ Erro na autenticação MiniKit:", finalPayload)
        setLoading(false)
        return
      }

      // Obter endereço da carteira
      const walletAddress = finalPayload.address
      console.log("💰 Endereço da carteira:", walletAddress)

      // Fazer login no backend
      console.log("🔄 Fazendo login no backend TPulseFi...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      if (response.status === 200) {
        const userData = await response.json()
        console.log("🎉 Login TPulseFi bem-sucedido:", userData)

        const userInfo = {
          ...userData.user,
          walletAddress: walletAddress || (MiniKit.user ? MiniKit.user.walletAddress : null),
        }

        setUser(userInfo)

        if (onLoginSuccess) {
          onLoginSuccess(userInfo)
        }
      } else {
        console.error("❌ Erro no login backend")
      }
    } catch (error) {
      console.error("❌ Erro no login TPulseFi:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      console.log("🚪 Fazendo logout TPulseFi...")

      // Chama a API de logout
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        console.log("✅ Logout TPulseFi bem-sucedido")
      } else {
        console.warn("⚠️ Logout API falhou, mas continuando...")
      }

      // Limpa estado local
      setUser(null)

      // Chama callback de logout
      if (onLogout) {
        onLogout()
      }

      // Limpa storage
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
        console.log("🧹 Storage limpo")
      }

      // Força reload para garantir limpeza completa
      console.log("🔄 Recarregando página após logout...")
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("❌ Erro no logout:", error)
      // Mesmo com erro, limpa estado e recarrega
      setUser(null)
      if (onLogout) {
        onLogout()
      }
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } finally {
      setLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <Card className="bg-gray-900/95 border-2 border-cyan-500/40 backdrop-blur-xl text-white shadow-2xl shadow-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-cyan-400">Verificando sessão TPulseFi...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (user) {
    return (
      <Card className="bg-gray-900/95 border-2 border-green-500/40 backdrop-blur-xl text-white shadow-2xl shadow-green-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <CardTitle className="text-lg text-green-400">Carteira Conectada</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              ATIVO
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-300">Endereço</span>
              </div>
              <div className="font-mono text-xs text-cyan-400 break-all">{user.walletAddress}</div>
            </div>

            {/* Network Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Rede</span>
                </div>
                <div className="text-sm text-purple-400 font-medium">WorldChain</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">Chain ID</span>
                </div>
                <div className="text-sm text-yellow-400 font-medium">{user.chainId || "480"}</div>
              </div>
            </div>

            {/* Auth Time */}
            <div className="p-3 rounded-lg bg-gray-800/40 border border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Conectado em</span>
              </div>
              <div className="text-sm text-blue-400">{new Date(user.authTime).toLocaleString()}</div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500/30 to-red-600/30 border-2 border-red-500/40 hover:from-red-500/50 hover:to-red-600/50 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Desconectando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Desconectar Carteira
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/95 border-2 border-cyan-500/40 backdrop-blur-xl text-white shadow-2xl shadow-cyan-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-cyan-400 animate-pulse" />
          <CardTitle className="text-lg text-cyan-400">Conectar Carteira</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Info */}
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">WorldChain Wallet</span>
            </div>
            <p className="text-xs text-cyan-300">
              Conecte sua carteira WorldChain para acessar o TPulseFi e gerenciar seus tokens de forma segura.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Autenticação segura com WorldID
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Acesso completo aos recursos TPulseFi
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-400" />
              Transações na rede WorldChain
            </div>
          </div>

          {/* Connect Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500/30 to-purple-600/30 border-2 border-cyan-500/40 hover:from-cyan-500/50 hover:to-purple-600/50 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Conectando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Conectar WorldChain Wallet
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
