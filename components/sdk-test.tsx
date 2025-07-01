"use client"
import { useWorldChain } from "./worldchain-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function SDKTest() {
  const { isSDKLoaded, sdkError, isConnected, address, connect, disconnect } = useWorldChain()

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === false) return <XCircle className="h-4 w-4 text-red-500" />
    return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
  }

  const getStatusBadge = (status: boolean | null, loadingText: string, successText: string, errorText: string) => {
    if (status === true)
      return (
        <Badge variant="default" className="bg-green-500">
          {successText}
        </Badge>
      )
    if (status === false) return <Badge variant="destructive">{errorText}</Badge>
    return <Badge variant="secondary">{loadingText}</Badge>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Status do Sistema TPulseFi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status do SDK */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(isSDKLoaded)}
            <span className="font-medium">WorldChain SDK</span>
          </div>
          {getStatusBadge(isSDKLoaded, "Carregando...", "Carregado", "Falhou")}
        </div>

        {/* Erro do SDK */}
        {sdkError && (
          <div className="p-3 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Erro do SDK:</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{sdkError}</p>
          </div>
        )}

        {/* Status da Conexão */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(isConnected)}
            <span className="font-medium">Conexão da Carteira</span>
          </div>
          {getStatusBadge(isConnected, "Desconectado", "Conectado", "Desconectado")}
        </div>

        {/* Endereço da Carteira */}
        {address && (
          <div className="p-3 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Endereço:</span>
            </div>
            <p className="text-sm text-green-600 mt-1 font-mono">{address}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-4">
          {!isConnected ? (
            <Button onClick={connect} disabled={!isSDKLoaded} className="flex-1">
              {isSDKLoaded ? "Conectar Carteira" : "SDK não disponível"}
            </Button>
          ) : (
            <Button onClick={disconnect} variant="outline" className="flex-1 bg-transparent">
              Desconectar
            </Button>
          )}
        </div>

        {/* Instruções */}
        {!isSDKLoaded && (
          <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Dependências não encontradas</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Execute: <code className="bg-yellow-100 px-1 rounded">npm run manual-install</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
