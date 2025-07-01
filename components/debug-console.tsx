"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal, Trash2, Download, AlertCircle } from "lucide-react"

interface LogEntry {
  timestamp: Date
  level: "info" | "warn" | "error"
  message: string
}

export default function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Intercepta console.log, console.warn, console.error
    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    console.log = (...args) => {
      originalLog(...args)
      addLog("info", args.join(" "))
    }

    console.warn = (...args) => {
      originalWarn(...args)
      addLog("warn", args.join(" "))
    }

    console.error = (...args) => {
      originalError(...args)
      addLog("error", args.join(" "))
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  useEffect(() => {
    // Auto-scroll para o final
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (level: "info" | "warn" | "error", message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date(),
        level,
        message,
      },
    ])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const exportLogs = () => {
    const logText = logs
      .map((log) => `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tpulsefi-logs-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      default:
        return "text-gray-300"
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "warn":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  if (!isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-900/80 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
      >
        <Terminal className="w-4 h-4 mr-2" />
        Debug Console
        {logs.filter((log) => log.level === "error").length > 0 && (
          <Badge className="ml-2 bg-red-500/20 text-red-400 border-red-500/30">
            {logs.filter((log) => log.level === "error").length}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-80 bg-gray-900/95 border-2 border-purple-500/30 backdrop-blur-sm z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <CardTitle className="text-sm text-purple-400">Debug Console</CardTitle>
            <Badge className="bg-gray-700 text-gray-300">{logs.length}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={exportLogs} className="h-6 w-6 p-0">
              <Download className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearLogs} className="h-6 w-6 p-0">
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="h-6 w-6 p-0">
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-60 px-3" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              Nenhum log ainda
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className={`text-xs ${getLevelBadge(log.level)}`}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-gray-500">{log.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className={`mt-1 ${getLevelColor(log.level)} break-words`}>{log.message}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
