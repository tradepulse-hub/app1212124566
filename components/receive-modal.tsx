"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowDownLeft, Copy, QrCode, Share } from "lucide-react"

interface ReceiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReceiveModal({ open, onOpenChange }: ReceiveModalProps) {
  const [amount, setAmount] = useState("")
  const walletAddress = "0x742d35Cc6Bf8B2C4D8f9E1A3B7C5F2E8D4A6B9C1E3F7A2B5C8D1E4F7A0B3C6D9E2F5A8B1C4D7E0F3A6B9C2E5F8"

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  const shareAddress = () => {
    if (navigator.share) {
      navigator.share({
        title: "Meu endereço TPulseFi",
        text: walletAddress,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-2 border-green-500/40 backdrop-blur-xl text-white shadow-2xl shadow-green-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 animate-pulse" />
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2 text-green-400 animate-pulse">
            <ArrowDownLeft className="w-5 h-5" />
            Receber TPulseFi
          </DialogTitle>
          <DialogDescription className="text-gray-400">Compartilhe seu endereço para receber</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 relative z-10">
          {/* Enhanced QR Code */}
          <div className="flex justify-center">
            <div className="w-40 h-40 bg-gray-800/60 border-2 border-green-500/40 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent animate-pulse" />
              <QrCode className="w-20 h-20 text-green-400 animate-pulse relative z-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-300">
              Seu Endereço
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={`${walletAddress.slice(0, 15)}...${walletAddress.slice(-15)}`}
                readOnly
                className="font-mono text-xs bg-gray-800/60 border-2 border-gray-700 text-white hover:border-gray-600 transition-all duration-300"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyAddress}
                className="border-2 border-gray-700 text-green-400 hover:bg-green-500/20 bg-transparent hover:scale-110 transition-all duration-300"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-amount" className="text-gray-300">
              Quantidade (Opcional)
            </Label>
            <Input
              id="request-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800/60 border-2 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-green-500/50 transition-all duration-300"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={shareAddress}
              className="flex-1 border-2 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent hover:scale-105 transition-all duration-300"
            >
              <Share className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button
              onClick={copyAddress}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-300 border-2 border-green-500/50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
