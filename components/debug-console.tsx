"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Terminal, Download, Trash2 } from "lucide-react"

interface LogEntry {
  timestamp: string
  level: "log" | "error" | "warn" | "info"
  message: string
  source?: string
}

export function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Interceptar console.log, console.error, etc.
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn
    const originalInfo = console.info

    const addLog = (level: LogEntry["level"], args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")

      const logEntry: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        source: "console",
      }

      setLogs((prev) => [...prev.slice(-99), logEntry]) // Manter apenas últimos 100 logs
    }

    console.log = (...args) => {
      originalLog(...args)
      addLog("log", args)
    }

    console.error = (...args) => {
      originalError(...args)
      addLog("error", args)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog("warn", args)
    }

    console.info = (...args) => {
      originalInfo(...args)
      addLog("info", args)
    }

    // Log inicial
    console.log("🐛 Debug Console ativado")

    return () => {
      console.log = originalLog
      console.error = originalError
      console.warn = originalWarn
      console.info = originalInfo
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
    console.log("🧹 Logs limpos")
  }

  const exportLogs = () => {
    const logText = logs.map((log) => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`).join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tpulsefi-logs-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50"
      case "warn":
        return "text-yellow-600 bg-yellow-50"
      case "info":
        return "text-blue-600 bg-blue-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getLevelBadge = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return <Badge variant="destructive">ERROR</Badge>
      case "warn":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            WARN
          </Badge>
        )
      case "info":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            INFO
          </Badge>
        )
      default:
        return <Badge variant="outline">LOG</Badge>
    }
  }

  if (!isVisible) {
    return (
      <Button onClick={() => setIsVisible(true)} variant="outline" size="sm" className="fixed bottom-4 right-4 z-50">
        <Terminal className="h-4 w-4 mr-2" />
        Debug ({logs.length})
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Debug Console ({logs.length})
          </CardTitle>
          <div className="flex gap-1">
            <Button onClick={exportLogs} size="sm" variant="outline">
              <Download className="h-3 w-3" />
            </Button>
            <Button onClick={clearLogs} size="sm" variant="outline">
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button onClick={() => setIsVisible(false)} size="sm" variant="outline">
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-52">
          <div className="space-y-1">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum log ainda...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`p-2 rounded text-xs ${getLevelColor(log.level)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {getLevelBadge(log.level)}
                    <span className="text-gray-500">{log.timestamp}</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs">{log.message}</pre>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
