"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut, AlertTriangle } from "lucide-react"

interface LogoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LogoutModal({ open, onOpenChange }: LogoutModalProps) {
  const handleLogout = async () => {
    try {
      console.log("🚪 Iniciando processo de logout...")

      // Chama a API de logout
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        console.log("✅ Logout API bem-sucedido")
      } else {
        console.warn("⚠️ Logout API falhou, mas continuando...")
      }

      // Limpa localStorage
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()
        console.log("🧹 Storage limpo")
      }

      // Fecha o modal
      onOpenChange(false)

      // Força reload da página para garantir limpeza completa
      console.log("🔄 Recarregando página...")
      window.location.reload()
    } catch (error) {
      console.error("❌ Erro no logout:", error)
      // Mesmo com erro, força reload
      onOpenChange(false)
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-2 border-red-500/40 backdrop-blur-xl text-white shadow-2xl shadow-red-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-red-500/5 animate-pulse" />
        <DialogHeader className="relative z-10">
          <DialogTitle className="flex items-center gap-3 text-red-400 text-lg">
            <div className="w-10 h-10 bg-red-500/20 border-2 border-red-500/40 rounded-full flex items-center justify-center animate-pulse">
              <LogOut className="w-5 h-5" />
            </div>
            Confirmar Logout
          </DialogTitle>
          <DialogDescription className="text-gray-400 mt-3">
            Tem certeza que deseja sair da sua carteira TPulseFi?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 relative z-10">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse" />
            <div className="text-sm text-yellow-300">
              Certifique-se de ter feito backup da sua chave privada antes de sair.
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300 hover:scale-105"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 hover:scale-105 border-2 border-red-500/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
