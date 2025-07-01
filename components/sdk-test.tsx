"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

export default function SDKTest() {
  const { isSDKLoaded, sdkError } = useWorldChain()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Recarrega a página para tentar novamente
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusText = (status: boolean) => {
    return status ? "Carregado" : "Falhou"
  }

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30"
  }

  // Status das dependências baseado no SDK
  const dependencies = [
    { name: "Ethers.js", status: isSDKLoaded },
    { name: "WorldChain SDK", status: isSDKLoaded },
    { name: "Holdstation Client", status: isSDKLoaded },
    { name: "Multicall3", status: isSDKLoaded },
    { name: "TokenProvider", status: isSDKLoaded },
  ]

  return (
    <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-purple-400">Status do SDK</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-purple-400 hover:bg-purple-500/20"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isRefreshing ? "Recarregando..." : "Tentar Novamente"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {sdkError && (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">
              <strong>Erro ao carregar SDK:</strong> {sdkError}
            </AlertDescription>
          </Alert>
        )}

        {/* Dependencies Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Dependências</h4>
          {dependencies.map((dep) => (
            <div key={dep.name} className="flex items-center justify-between p-2 bg-gray-800/40 rounded">
              <span className="text-sm text-gray-300">{dep.name}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(dep.status)}
                <Badge variant="secondary" className={`text-xs ${getStatusColor(dep.status)}`}>
                  {getStatusText(dep.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg border">
          <span className="font-medium text-gray-200">Status Geral</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(isSDKLoaded)}
            <Badge
              variant={isSDKLoaded ? "default" : "destructive"}
              className={isSDKLoaded ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
            >
              {isSDKLoaded ? "Operacional" : "Indisponível"}
            </Badge>
          </div>
        </div>

        {/* Instructions */}
        {!isSDKLoaded && (
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-400">
              <strong>SDK não disponível:</strong> Para usar funcionalidades reais, instale as dependências:
              <br />
              <code className="text-xs bg-gray-800 px-1 py-0.5 rounded mt-1 block">
                npm install @holdstation/worldchain-sdk @holdstation/worldchain-ethers-v6 ethers
              </code>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
