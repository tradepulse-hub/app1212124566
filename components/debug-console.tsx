"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Terminal,
  Play,
  Trash2,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bug,
  Zap,
} from "lucide-react"
import { testBigNumberBrowserNative } from "@/lib/worldchain-sdk-v0-native"

interface LogEntry {
  timestamp: string
  level: "info" | "warn" | "error" | "success"
  message: string
  details?: any
}

export default function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [command, setCommand] = useState("")
  const logsEndRef = useRef<HTMLDivElement>(null)

  const addLog = (level: LogEntry["level"], message: string, details?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      details,
    }
    setLogs((prev) => [...prev, newLog])
  }

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  // Intercepta console.log, console.error, etc.
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    console.log = (...args) => {
      originalLog(...args)
      addLog("info", args.join(" "), args.length > 1 ? args : undefined)
    }

    console.error = (...args) => {
      originalError(...args)
      addLog("error", args.join(" "), args.length > 1 ? args : undefined)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog("warn", args.join(" "), args.length > 1 ? args : undefined)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  const runDiagnostic = async () => {
    setIsRunning(true)
    addLog("info", "🔍 Iniciando diagnóstico v0 browser-native...")

    try {
      // Test 1: Ambiente
      addLog("info", "📋 Verificando ambiente v0...")
      addLog("info", `User Agent: ${navigator.userAgent.slice(0, 50)}...`)
      addLog("info", `Platform: ${navigator.platform}`)
      addLog("info", `Location: ${window.location.href.slice(0, 50)}...`)

      // Test 2: BigNumber.js browser-native
      addLog("info", "🧮 Testando BigNumber.js browser-native...")
      const bigNumberResult = testBigNumberBrowserNative()
      if (bigNumberResult) {
        addLog("success", "✅ BigNumber.js browser-native funcionando")
      } else {
        addLog("error", "❌ BigNumber.js browser-native com problemas")
      }

      // Test 3: Verificar patches aplicados
      addLog("info", "🔧 Verificando patches aplicados...")
      const globalBN = (globalThis as any).BigNumber
      const windowBN = typeof window !== "undefined" ? (window as any).BigNumber : null
      const moduleBN = (globalThis as any).__BIGNUMBER_MODULE__
      const fetchPatched = globalThis.fetch !== fetch

      addLog("info", `Global BigNumber: ${typeof globalBN}`)
      addLog("info", `Window BigNumber: ${typeof windowBN}`)
      addLog("info", `Module BigNumber: ${typeof moduleBN?.BigNumber}`)
      addLog("info", `Fetch patchado: ${fetchPatched}`)

      // Test 4: Import function
      addLog("info", "🔄 Verificando função import...")
      const importFn = (globalThis as any).import
      addLog("info", `Import function: ${typeof importFn}`)

      // Test 5: Ethers.js
      addLog("info", "⚡ Testando Ethers.js...")
      try {
        const ethers = await import("ethers")
        addLog("success", "✅ Ethers.js carregado")
        addLog("info", `Ethers version: ${ethers.version || "unknown"}`)
      } catch (error) {
        addLog("error", `❌ Erro no Ethers.js: ${error.message}`)
      }

      // Test 6: WorldChain SDK v0 native
      addLog("info", "🌐 Testando WorldChain SDK v0 native...")
      try {
        const { loadWorldChainSDKV0Native } = await import("@/lib/worldchain-sdk-v0-native")
        const { TokenProvider, sdkLoaded } = await loadWorldChainSDKV0Native()

        if (sdkLoaded && TokenProvider) {
          addLog("success", "✅ WorldChain SDK v0 native carregado!")
          addLog("info", `TokenProvider type: ${typeof TokenProvider}`)
        } else {
          addLog("error", "❌ WorldChain SDK v0 native falhou")
        }
      } catch (error) {
        addLog("error", `❌ Erro no SDK v0 native: ${error.message}`)
      }

      // Test 7: Network connectivity
      addLog("info", "🌐 Testando conectividade WorldChain...")
      try {
        const response = await fetch("https://worldchain-mainnet.g.alchemy.com/public", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_chainId",
            params: [],
            id: 1,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          addLog("success", `✅ WorldChain RPC respondeu: ${data.result}`)
        } else {
          addLog("warn", `⚠️ WorldChain RPC status: ${response.status}`)
        }
      } catch (error) {
        addLog("error", `❌ Erro de conectividade: ${error.message}`)
      }

      addLog("success", "🎉 Diagnóstico v0 browser-native completo!")
    } catch (error) {
      addLog("error", `❌ Erro geral no diagnóstico: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const runCommand = async () => {
    if (!command.trim()) return

    addLog("info", `> ${command}`)
    setIsRunning(true)

    try {
      if (command.startsWith("test ")) {
        const testName = command.replace("test ", "")
        await runSpecificTest(testName)
      } else if (command === "clear") {
        setLogs([])
      } else if (command === "env") {
        addLog("info", `Location: ${window.location.href}`)
        addLog("info", `User Agent: ${navigator.userAgent}`)
        addLog("info", `Platform: ${navigator.platform}`)
      } else if (command === "patch") {
        const result = testBigNumberBrowserNative()
        addLog(result ? "success" : "error", `Patch BigNumber V0 Native: ${result ? "✅ OK" : "❌ FALHOU"}`)
      } else if (command === "globals") {
        const globalBN = (globalThis as any).BigNumber
        const windowBN = (window as any).BigNumber
        const moduleBN = (globalThis as any).__BIGNUMBER_MODULE__
        addLog("info", `Global: ${typeof globalBN}, Window: ${typeof windowBN}, Module: ${typeof moduleBN}`)
      } else if (command.startsWith("import ")) {
        const moduleName = command.replace("import ", "")
        try {
          const module = await import(moduleName)
          addLog("success", `✅ ${moduleName} importado com sucesso`)
          addLog("info", `Exports: ${Object.keys(module).slice(0, 10).join(", ")}`)
        } catch (error) {
          addLog("error", `❌ Erro ao importar ${moduleName}: ${error.message}`)
        }
      } else {
        addLog("warn", `Comando não reconhecido: ${command}`)
        addLog("info", "Comandos: test <nome>, clear, env, patch, globals, import <módulo>")
      }
    } catch (error) {
      addLog("error", `❌ Erro ao executar comando: ${error.message}`)
    } finally {
      setIsRunning(false)
      setCommand("")
    }
  }

  const runSpecificTest = async (testName: string) => {
    switch (testName) {
      case "bignumber":
        const result = testBigNumberBrowserNative()
        addLog(result ? "success" : "error", `BigNumber v0 native test: ${result ? "✅ OK" : "❌ FALHOU"}`)
        break

      case "sdk":
        try {
          const { loadWorldChainSDKV0Native } = await import("@/lib/worldchain-sdk-v0-native")
          const { sdkLoaded } = await loadWorldChainSDKV0Native()
          addLog(sdkLoaded ? "success" : "error", `SDK v0 native test: ${sdkLoaded ? "✅ OK" : "❌ FALHOU"}`)
        } catch (error) {
          addLog("error", `❌ SDK v0 native test failed: ${error.message}`)
        }
        break

      case "network":
        try {
          const response = await fetch("https://worldchain-mainnet.g.alchemy.com/public")
          addLog("success", `✅ Network test: ${response.status}`)
        } catch (error) {
          addLog("error", `❌ Network test failed: ${error.message}`)
        }
        break

      default:
        addLog("warn", `Teste não encontrado: ${testName}`)
        addLog("info", "Testes disponíveis: bignumber, sdk, network")
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  const copyLogs = () => {
    const logText = logs.map((log) => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`).join("\n")
    navigator.clipboard.writeText(logText)
    addLog("success", "📋 Logs copiados para clipboard")
  }

  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      logs: logs,
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        location: window.location.href,
      },
    }

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tpulsefi-debug-v0-native-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    addLog("success", "💾 Logs v0 native exportados")
  }

  const getLogIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case "error":
        return <XCircle className="w-3 h-3 text-red-400" />
      case "warn":
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />
      default:
        return <Zap className="w-3 h-3 text-blue-400" />
    }
  }

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      default:
        return "text-gray-300"
    }
  }

  return (
    <Card className="bg-gray-900/95 border-2 border-red-500/40 backdrop-blur-xl text-white shadow-2xl shadow-red-500/20 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-red-400 animate-pulse" />
            <CardTitle className="text-lg text-red-400">Debug Console V0 Native</CardTitle>
            <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
              V0-NATIVE
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={runDiagnostic}
              disabled={isRunning}
              className="h-8 w-8 text-green-400 hover:bg-green-500/20 border border-green-500/30"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={copyLogs}
              className="h-8 w-8 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
            >
              <Copy className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={exportLogs}
              className="h-8 w-8 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={clearLogs}
              className="h-8 w-8 text-gray-400 hover:bg-gray-500/20 border border-gray-500/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="bg-gradient-to-r from-red-500/30 to-red-600/30 border border-red-500/40 hover:from-red-500/50 hover:to-red-600/50 text-xs"
          >
            {isRunning ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            Diagnóstico
          </Button>

          <Button
            onClick={() => runSpecificTest("bignumber")}
            disabled={isRunning}
            className="bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border border-yellow-500/40 hover:from-yellow-500/50 hover:to-yellow-600/50 text-xs"
          >
            <Zap className="w-3 h-3 mr-1" />
            BigNumber
          </Button>

          <Button
            onClick={() => {
              setCommand("patch")
              runCommand()
            }}
            disabled={isRunning}
            className="bg-gradient-to-r from-green-500/30 to-green-600/30 border border-green-500/40 hover:from-green-500/50 hover:to-green-600/50 text-xs"
          >
            <Bug className="w-3 h-3 mr-1" />
            Patch
          </Button>

          <Button
            onClick={() => {
              setCommand("globals")
              runCommand()
            }}
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-500/30 to-blue-600/30 border border-blue-500/40 hover:from-blue-500/50 hover:to-blue-600/50 text-xs"
          >
            <Zap className="w-3 h-3 mr-1" />
            Globals
          </Button>
        </div>

        {/* Command Input */}
        <div className="flex gap-2 mb-4">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Digite um comando (ex: test bignumber, patch, globals, import ethers)"
            className="bg-gray-800/60 border border-gray-700 text-white placeholder:text-gray-500 resize-none h-10 text-sm font-mono"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                runCommand()
              }
            }}
          />
          <Button
            onClick={runCommand}
            disabled={isRunning || !command.trim()}
            className="bg-gradient-to-r from-cyan-500/30 to-cyan-600/30 border border-cyan-500/40"
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>

        {/* Console Output */}
        <div className="bg-black/80 border border-gray-700 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Console v0 native vazio. Execute um diagnóstico para começar.
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-gray-500 text-xs shrink-0">{log.timestamp}</span>
                  {getLogIcon(log.level)}
                  <span className={getLogColor(log.level)}>{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>

        {/* Status Summary */}
        <div className="mt-4 p-3 rounded-lg bg-gray-800/40 border border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Status V0 Native:</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
              Console V0 Native Ativo
            </Badge>
            <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
              {logs.length} logs
            </Badge>
            {isRunning && (
              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                Executando...
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
