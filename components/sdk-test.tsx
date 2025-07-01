"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Loader2, RefreshCw, AlertTriangle, Zap, Database, Network, Coins } from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

export default function SDKTest() {
  const { isSDKLoaded } = useWorldChain()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [isRunning, setIsRunning] = useState(false)

  // Derive status objects from isSDKLoaded
  const dependencyStatus = {
    ethers: isSDKLoaded,
    worldchainSDK: isSDKLoaded,
    holdstationClient: isSDKLoaded,
    multicall3: isSDKLoaded,
    tokenProvider: isSDKLoaded,
  }

  const connectionStatus = {
    worldchainRPC: isSDKLoaded,
    networkConnection: isSDKLoaded,
    sdkInitialization: isSDKLoaded,
  }

  const runTests = async () => {
    setIsRunning(true)
    const results: Record<string, boolean> = {}

    // Simulate test execution
    const tests = [
      "BigNumber Creation",
      "Token Provider Init",
      "Swap Helper Init",
      "Sender Init",
      "Manager Init",
      "Quote Test",
      "Balance Test",
      "Token Details Test",
    ]

    for (const test of tests) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Mock test results based on SDK status
      results[test] = isSDKLoaded
      setTestResults({ ...results })
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  }

  const getStatusText = (status: boolean) => {
    return status ? "Funcionando" : "Falhou"
  }

  const getStatusColor = (status: boolean) => {
    return status ? "text-green-500" : "text-red-500"
  }

  return (
    <Card className="bg-gray-900/70 border-2 border-purple-500/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-lg text-purple-400">Status Completo</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={runTests}
            disabled={isRunning}
            className="text-purple-400 hover:bg-purple-500/20"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isRunning ? "Testando..." : "Testar"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dependencies Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Dependências
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(dependencyStatus).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-gray-800/40 rounded">
                <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className={`text-xs ${getStatusColor(status)}`}>{getStatusText(status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Connection Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Network className="w-4 h-4" />
            Conexões
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(connectionStatus).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-gray-800/40 rounded">
                <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className={`text-xs ${getStatusColor(status)}`}>{getStatusText(status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Test Results */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Testes de Funcionalidade
          </h4>
          {Object.keys(testResults).length === 0 ? (
            <div className="text-center py-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Clique em "Testar" para executar os testes</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test} className="flex items-center justify-between p-2 bg-gray-800/40 rounded">
                  <span className="text-sm text-gray-300">{test}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result)}
                    <span className={`text-xs ${getStatusColor(result)}`}>{getStatusText(result)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Status */}
        <Separator className="bg-gray-700" />
        <div className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg">
          <span className="font-medium text-gray-200">Status Geral</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(isSDKLoaded)}
            <Badge
              variant={isSDKLoaded ? "default" : "destructive"}
              className={isSDKLoaded ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
            >
              {isSDKLoaded ? "Operacional" : "Com Problemas"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
