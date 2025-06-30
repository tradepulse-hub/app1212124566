"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Gift,
  Info,
  Flame,
  Newspaper,
  GraduationCap,
  Crown,
  Handshake,
  X,
  Zap,
  ChevronRight,
} from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const menuItems = [
  {
    icon: Settings,
    label: "Settings",
    description: "Configurações da carteira",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/40",
    hoverColor: "hover:bg-cyan-500/30",
    shadowColor: "hover:shadow-cyan-500/25",
  },
  {
    icon: Gift,
    label: "Airdrop",
    description: "Tokens gratuitos",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/40",
    hoverColor: "hover:bg-green-500/30",
    shadowColor: "hover:shadow-green-500/25",
    badge: "NEW",
  },
  {
    icon: Info,
    label: "About",
    description: "Sobre o TPulseFi",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/40",
    hoverColor: "hover:bg-blue-500/30",
    shadowColor: "hover:shadow-blue-500/25",
  },
  {
    icon: Flame,
    label: "Furnace",
    description: "Queimar tokens",
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/40",
    hoverColor: "hover:bg-orange-500/30",
    shadowColor: "hover:shadow-orange-500/25",
  },
  {
    icon: Newspaper,
    label: "News",
    description: "Últimas notícias",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/40",
    hoverColor: "hover:bg-purple-500/30",
    shadowColor: "hover:shadow-purple-500/25",
    badge: "3",
  },
  {
    icon: GraduationCap,
    label: "Learn",
    description: "Aprenda sobre DeFi",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/20",
    borderColor: "border-indigo-500/40",
    hoverColor: "hover:bg-indigo-500/30",
    shadowColor: "hover:shadow-indigo-500/25",
  },
  {
    icon: Crown,
    label: "Membership",
    description: "Programa VIP",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/40",
    hoverColor: "hover:bg-yellow-500/30",
    shadowColor: "hover:shadow-yellow-500/25",
    badge: "VIP",
  },
  {
    icon: Handshake,
    label: "Partnerships",
    description: "Parcerias estratégicas",
    color: "text-pink-400",
    bgColor: "bg-pink-500/20",
    borderColor: "border-pink-500/40",
    hoverColor: "hover:bg-pink-500/30",
    shadowColor: "hover:shadow-pink-500/25",
  },
]

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-r-2 border-gray-700/60 z-50 transform transition-all duration-500 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      } shadow-2xl shadow-purple-500/10`}
    >
      {/* Enhanced Sidebar Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-cyan-500/20 to-transparent animate-pulse" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/20 to-transparent animate-pulse delay-1000" />

      {/* Energy lines */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"
            style={{
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: "2s",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Enhanced Header */}
        <div className="p-6 border-b-2 border-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse hover:animate-spin transition-all duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                  TPulseFi
                </h2>
                <p className="text-xs text-gray-400">Wallet Menu</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/60 hover:scale-110 transition-all duration-300 border border-gray-600/50 hover:border-gray-500"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Enhanced Menu Items */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {menuItems.map((item, index) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full h-auto p-4 justify-start text-left ${item.hoverColor} ${item.shadowColor} transition-all duration-500 group border-2 ${item.borderColor} bg-transparent hover:shadow-lg hover:scale-[1.02] relative overflow-hidden`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: open ? "slideInLeft 0.5s ease-out forwards" : "none",
              }}
            >
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%]" />

              <div className="flex items-center gap-4 w-full relative z-10">
                <div
                  className={`w-12 h-12 rounded-lg ${item.bgColor} border-2 ${item.borderColor} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                >
                  <item.icon className={`w-6 h-6 ${item.color} group-hover:animate-pulse`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white group-hover:text-gray-100">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-0.5 animate-pulse ${
                          item.badge === "NEW"
                            ? "bg-green-500/30 text-green-400 border-2 border-green-500/40"
                            : item.badge === "VIP"
                              ? "bg-yellow-500/30 text-yellow-400 border-2 border-yellow-500/40"
                              : "bg-purple-500/30 text-purple-400 border-2 border-purple-500/40"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
              </div>
            </Button>
          ))}
        </div>

        {/* Enhanced Footer */}
        <div className="p-4 border-t-2 border-gray-700/60 bg-gradient-to-t from-gray-800/50 to-transparent">
          <div className="text-center">
            <p className="text-xs text-gray-500 animate-pulse">TPulseFi Wallet v2.0</p>
            <p className="text-xs text-gray-600 mt-1">Powered by Blockchain</p>
            <div className="flex justify-center mt-2">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
