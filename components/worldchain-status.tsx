"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Zap, Globe } from "lucide-react"
import { useWorldChain } from "./worldchain-provider"

export default function WorldChainStatus() {
  const { isConnected, walletAddress } = useWorldChain()

  return (
    <Card className="bg-gray-900/60 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300 mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-gray-300 font-medium">WorldChain</span>
            <Badge variant="secondary" className="text-xs bg-gray-700/50 text-gray-400 border-gray-600/50">
              ID: 480
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={`text-xs animate-pulse ${
                isConnected
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {isConnected ? (
                <div className="flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  CONECTADO
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" />
                  DESCONECTADO
                </div>
              )}
            </Badge>

            {isConnected && walletAddress && (
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                <span className="text-xs text-gray-400 font-mono">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Network Details */}
        <div className="mt-2 pt-2 border-t border-gray-700/30">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>RPC: worldchain-mainnet.g.alchemy.com</span>
            <span>Block Time: 2s</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
