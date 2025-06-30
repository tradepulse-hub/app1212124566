"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, TestTube, AlertTriangle, Zap } from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

export default function SDKTest() {
  const { dependencyStatus, connectionStatus, sdkLoaded } = useWorldChain()
  const [isLoading, setIsLoading] = useState(false)

  const getIcon = (result: boolean) => {
    return result ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />
  }

  const getStatus = (result: boolean) => {
    return result ? "OK" : "Falhou"
  }

  const getStatusColor = (result: boolean) => {
    return result
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case "loading":
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin text-blue-400" />,
          text: "Carregando...",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        }
      case "connected":
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-400" />,
          text: "Conectado",
          color: "bg-green-500/20 text-green-400 border-green-500/30",
        }
      case "mock":
        return {
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          text: "Modo Demo",
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        }
      case "error":
        return {
          icon: <XCircle className="w-4 h-4 text-red-400" />,
          text: "Erro",
          color: "bg-red-500/20 text-red-400 border-red-500/30",
        }
    }
  }

  const statusInfo = getConnectionStatusInfo()
  const allDepsOK = Object.values(dependencyStatus).every(Boolean)

  return (
    <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-sm text-gray-300">Status do Sistema</CardTitle>
          </div>
          <Badge variant="secondary" className={`text-xs ${statusInfo.color}`}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.text}
            </div>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Ethers.js Test */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 border border-gray-700/40">
            <div className="flex items-center gap-2">
              {getIcon(dependencyStatus.ethers)}
              <span className="text-sm text-gray-300">Ethers.js</span>
            </div>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(dependencyStatus.ethers)}`}>
              {getStatus(dependencyStatus.ethers)}
            </Badge>
          </div>

          {/* WorldChain SDK Test */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 border border-gray-700/40">
            <div className="flex items-center gap-2">
              {getIcon(dependencyStatus.sdk)}
              <span className="text-sm text-gray-300">WorldChain SDK</span>
            </div>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(dependencyStatus.sdk)}`}>
              {getStatus(dependencyStatus.sdk)}
            </Badge>
          </div>

          {/* TokenProvider Test */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 border border-gray-700/40">
            <div className="flex items-center gap-2">
              {getIcon(dependencyStatus.tokenProvider)}
              <span className="text-sm text-gray-300">TokenProvider</span>
            </div>
            <Badge variant="secondary" className={`text-xs ${getStatusColor(dependencyStatus.tokenProvider)}`}>
              {getStatus(dependencyStatus.tokenProvider)}
            </Badge>
          </div>

          {/* Overall Status */}
          <div className="mt-4 p-3 rounded-lg border-2 border-dashed">
            {allDepsOK && connectionStatus === "connected" ? (
              <div className="flex items-center gap-2 text-green-400 border-green-500/30 bg-green-500/10">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <div className="font-medium">Sistema Completo Ativo!</div>
                  <div className="text-xs text-green-300">TPulseFi conectado ao WorldChain real</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-400 border-yellow-500/30 bg-yellow-500/10">
                <Zap className="w-5 h-5 animate-pulse" />
                <div>
                  <div className="font-medium">Modo Demo TPulseFi</div>
                  <div className="text-xs text-yellow-300">Funciona perfeitamente com dados simulados do TPulseFi</div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {!allDepsOK && (
            <div className="mt-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400">
                <AlertTriangle className="w-4 h-4" />
                <div className="text-xs">
                  <div className="font-medium">Para ativar modo completo:</div>
                  <div className="mt-1 font-mono text-blue-300">npm run install-missing</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
