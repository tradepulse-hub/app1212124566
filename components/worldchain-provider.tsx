"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { ethers } from "ethers"

// Importa o fix do BigNumber primeiro
import "@/lib/bignumber-fix"

// Agora importa o SDK
import { TokenProvider } from "@holdstation/worldchain-sdk"

interface WorldChainContextType {
  tokenProvider: TokenProvider | null
  isConnected: boolean
  walletAddress: string | null
  tokenBalances: Record<string, string>
  isLoadingBalances: boolean
  refreshBalances: () => Promise<void>
  getTokenDetails: (tokens: string[]) => Promise<any>
  getWalletTokens: (wallet: string) => Promise<string[]>
}

const WorldChainContext = createContext<WorldChainContextType | null>(null)

export const useWorldChain = () => {
  const context = useContext(WorldChainContext)
  if (!context) {
    throw new Error("useWorldChain must be used within WorldChainProvider")
  }
  return context
}

interface WorldChainProviderProps {
  children: ReactNode
}

export function WorldChainProvider({ children }: WorldChainProviderProps) {
  const [tokenProvider, setTokenProvider] = useState<TokenProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)

  // Tokens principais do WorldChain incluindo TPulseFi
  const MAIN_TOKENS = {
    TPF: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45", // TPulseFi Token
    WETH: "0x4200000000000000000000000000000000000006", // Wrapped Ethereum
    USDCe: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USD Coin
    WLD: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // Worldcoin
  }

  useEffect(() => {
    initializeProvider()
  }, [])

  const initializeProvider = async () => {
    try {
      console.log("🚀 Inicializando WorldChain Provider...")

      // WorldChain Mainnet RPC oficial
      const provider = new ethers.providers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

      // Testa a conexão
      const network = await provider.getNetwork()
      console.log("🌐 Conectado à rede:", network)

      const tokenProviderInstance = new TokenProvider({ provider })
      setTokenProvider(tokenProviderInstance)
      setIsConnected(true)

      // Endereço de exemplo com atividade real no WorldChain
      const exampleWallet = "0x14a028cC500108307947dca4a1Aa35029FB66CE0"
      setWalletAddress(exampleWallet)

      console.log("✅ WorldChain Provider inicializado com sucesso!")

      // Carregar balances iniciais
      await loadBalances(tokenProviderInstance, exampleWallet)
    } catch (error) {
      console.error("❌ Erro ao inicializar WorldChain Provider:", error)
      setIsConnected(false)

      // Fallback para dados mock do TPulseFi
      console.log("🔄 Usando dados mock como fallback...")
      setTokenBalances({
        "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45": "15420750000000000000000", // 15,420.75 TPF
        "0x4200000000000000000000000000000000000006": "2450000000000000000", // 2.45 WETH
        "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": "1250000000", // 1,250 USDCe
        "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": "5000000000000000000000", // 5,000 WLD
      })
    }
  }

  const loadBalances = async (provider: TokenProvider, wallet: string) => {
    setIsLoadingBalances(true)
    try {
      console.log("🔄 Carregando balances do WorldChain para:", wallet)

      const balances = await provider.balanceOf({
        wallet,
        tokens: Object.values(MAIN_TOKENS),
      })

      console.log("✅ Balances carregados:", balances)
      setTokenBalances(balances)
    } catch (error) {
      console.error("❌ Erro ao carregar balances:", error)

      // Fallback para dados mock
      console.log("🔄 Usando balances mock como fallback...")
      setTokenBalances({
        "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45": "15420750000000000000000", // 15,420.75 TPF
        "0x4200000000000000000000000000000000000006": "2450000000000000000", // 2.45 WETH
        "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": "1250000000", // 1,250 USDCe
        "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": "5000000000000000000000", // 5,000 WLD
      })
    } finally {
      setIsLoadingBalances(false)
    }
  }

  const refreshBalances = async () => {
    if (!tokenProvider || !walletAddress) return
    await loadBalances(tokenProvider, walletAddress)
  }

  const getTokenDetails = async (tokens: string[]) => {
    if (!tokenProvider) throw new Error("TokenProvider não inicializado")

    try {
      console.log("🔍 Buscando detalhes dos tokens:", tokens)
      const details = await tokenProvider.details(...tokens)
      console.log("✅ Detalhes dos tokens:", details)
      return details
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes dos tokens:", error)
      throw error
    }
  }

  const getWalletTokens = async (wallet: string) => {
    if (!tokenProvider) throw new Error("TokenProvider não inicializado")

    try {
      console.log("🔍 Buscando tokens da wallet:", wallet)
      const tokens = await tokenProvider.tokenOf(wallet)
      console.log("✅ Tokens encontrados:", tokens)
      return tokens
    } catch (error) {
      console.error("❌ Erro ao buscar tokens da wallet:", error)
      throw error
    }
  }

  const value: WorldChainContextType = {
    tokenProvider,
    isConnected,
    walletAddress,
    tokenBalances,
    isLoadingBalances,
    refreshBalances,
    getTokenDetails,
    getWalletTokens,
  }

  return <WorldChainContext.Provider value={value}>{children}</WorldChainContext.Provider>
}
