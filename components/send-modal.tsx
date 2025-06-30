"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUpRight, Scan } from "lucide-react"

interface SendModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SendModal({ open, onOpenChange }: SendModalProps) {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")

  const handleSend = () => {
    console.log("Enviando:", { recipient, amount, memo })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-2 border-red-500/40 backdrop-blur-xl text-white shadow-2xl shadow-red-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-500/5 animate-pulse" />
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-2 text-red-400 animate-pulse">
            <ArrowUpRight className="w-5 h-5" />
            Enviar TPulseFi
          </DialogTitle>
          <DialogDescription className="text-gray-400">Envie TPulseFi para outro endereço</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-gray-300">
              Destinatário
            </Label>
            <div className="flex gap-2">
              <Input
                id="recipient"
                placeholder="0x742d35Cc6Bf8B2C4..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-gray-800/60 border-2 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-red-500/50 transition-all duration-300"
              />
              <Button
                variant="outline"
                size="icon"
                className="border-2 border-gray-700 text-gray-400 hover:bg-gray-800 bg-transparent hover:scale-110 transition-all duration-300"
              >
                <Scan className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-300">
              Quantidade
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-gray-800/60 border-2 border-gray-700 text-white placeholder:text-gray-500 hover:border-gray-600 focus:border-red-500/50 transition-all duration-300"
            />
            <div className="text-xs text-gray-500 animate-pulse">Saldo: 15,420.75 TPULSE</div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo" className="text-gray-300">
              Memo (Opcional)
            </Label>
            <Textarea
              id="memo"
              placeholder="Adicione uma nota..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="bg-gray-800/60 border-2 border-gray-700 text-white placeholder:text-gray-500 resize-none h-20 hover:border-gray-600 focus:border-red-500/50 transition-all duration-300"
            />
          </div>
          <div className="bg-gray-800/40 p-3 rounded-lg border-2 border-gray-700/60 hover:border-gray-600/80 transition-all duration-300">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Taxa de rede:</span>
              <span className="text-red-400 animate-pulse">0.001 TPULSE</span>
            </div>
            <div className="flex justify-between text-sm font-medium mt-2 text-white">
              <span>Total:</span>
              <span className="text-red-400 animate-pulse">
                {amount ? (Number.parseFloat(amount) + 0.001).toFixed(3) : "0.001"} TPULSE
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 border-2 border-red-500/50"
            >
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
