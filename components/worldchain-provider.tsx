"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 🔥 USA A VERSÃO V0 BROWSER-NATIVE
import { loadWorldChainSDKV0Native, testBigNumberBrowserNative } from "@/lib/worldchain-sdk-v0-native"

let ethers: any = null

interface WorldChainContextType {
  tokenProvider: any | null
  isConnected: boolean
  walletAddress: string | null
  tokenBalances: Record<string, string>
  isLoadingBalances: boolean
  refreshBalances: () => Promise<void>
  getTokenDetails: (tokens: string[]) => Promise<any>
  getWalletTokens: (wallet: string) => Promise<string[]>
  sdkLoaded: boolean
  connectionStatus: "loading" | "connected" | "mock" | "error"
  dependencyStatus: {
    ethers: boolean
    sdk: boolean
    tokenProvider: boolean
  }
  // 🔥 NOVOS: Autenticação
  user: any | null
  isAuthenticated: boolean
  login: (userData: any) => void
  logout: () => void
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
  const [tokenProvider, setTokenProvider] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "connected" | "mock" | "error">("loading")
  const [dependencyStatus, setDependencyStatus] = useState({
    ethers: false,
    sdk: false,
    tokenProvider: false,
  })

  // 🔥 NOVOS: Estados de autenticação
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
      setConnectionStatus("loading")
      console.log("🚀 Inicializando TPulseFi Wallet com autenticação...")

      // Testa BigNumber browser-native primeiro
      const bigNumberOK = testBigNumberBrowserNative()
      console.log("🧮 BigNumber v0 browser-native test:", bigNumberOK ? "✅ OK" : "❌ FALHOU")

      // Carrega Ethers
      try {
        const ethersMod = await import("ethers")
        ethers = ethersMod.ethers ?? ethersMod
        console.log("✅ Ethers.js carregado")
      } catch (ethersError) {
        console.error("❌ Erro ao carregar Ethers:", ethersError)
      }

      // Carrega WorldChain SDK com versão v0 browser-native
      const { TokenProvider, sdkLoaded } = await loadWorldChainSDKV0Native()

      // Atualiza status das dependências
      setDependencyStatus({
        ethers: !!ethers,
        sdk: sdkLoaded,
        tokenProvider: !!TokenProvider,
      })

      // Se o SDK não carregou, usa modo mock
      if (!TokenProvider || !sdkLoaded) {
        console.log("🚧 SDK não carregou - executando com dados simulados do TPulseFi")
        setConnectionStatus("mock")
        setMockData()
        return
      }

      console.log("🎯 SDK carregado! Aguardando autenticação...")
      setConnectionStatus("mock") // Aguarda login real
      setMockData()
    } catch (error) {
      console.error("❌ Erro geral:", (error as Error).message)
      setConnectionStatus("error")
      setMockData()
    }
  }

  const setMockData = () => {
    console.log("🎭 Carregando dados mock do TPulseFi...")
    setTokenBalances({
      "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45": "15420750000000000000000", // 15,420.75 TPF
      "0x4200000000000000000000000000000000000006": "2450000000000000000", // 2.45 WETH
      "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": "1250000000", // 1,250 USDCe
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": "5000000000000000000000", // 5,000 WLD
    })
    console.log("✅ Dados mock do TPulseFi carregados")
  }

  const connectRealWallet = async (userWalletAddress: string) => {
    if (!ethers || !tokenProvider) {
      console.log("⚠️ SDK não disponível, mantendo modo mock...")
      return
    }

    try {
      console.log("🌐 Conectando ao WorldChain RPC com carteira real...")
      const provider = new ethers.providers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

      // Testa conexão com timeout
      const networkPromise = provider.getNetwork()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout de conexão")), 15000),
      )

      const network = await Promise.race([networkPromise, timeoutPromise])
      console.log("✅ Conectado ao WorldChain:", network)

      const tokenProviderInstance = new tokenProvider({ provider })
      setTokenProvider(tokenProviderInstance)
      setIsConnected(true)
      setConnectionStatus("connected")
      setWalletAddress(userWalletAddress)

      console.log("🎉 TPulseFi Wallet conectado ao modo REAL!")

      // Carregar balances reais
      await loadBalances(tokenProviderInstance, userWalletAddress)
    } catch (networkError) {
      console.error("❌ Erro de rede:", (networkError as Error).message)
      console.log("🔄 Mantendo modo mock...")
      setConnectionStatus("mock")
    }
  }

  const loadBalances = async (provider: any, wallet: string) => {
    setIsLoadingBalances(true)
    try {
      console.log("💰 Carregando balances reais do WorldChain...")

      const balances = await provider.balanceOf({
        wallet,
        tokens: Object.values(MAIN_TOKENS),
      })

      console.log("✅ Balances reais carregados:", balances)
      setTokenBalances(balances)
    } catch (error) {
      console.error("❌ Erro ao carregar balances reais:", (error as Error).message)
      console.log("🔄 Usando balances mock...")
      setMockData()
    } finally {
      setIsLoadingBalances(false)
    }
  }

  const refreshBalances = async () => {
    if (!tokenProvider || !walletAddress) {
      console.log("🔄 Atualizando dados mock...")
      setMockData()
      return
    }
    await loadBalances(tokenProvider, walletAddress)
  }

  const getTokenDetails = async (tokens: string[]) => {
    if (!tokenProvider) {
      return {
        "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45": {
          symbol: "TPF",
          name: "TPulseFi",
          decimals: 18,
        },
      }
    }

    try {
      const details = await tokenProvider.details(...tokens)
      return details
    } catch (error) {
      console.error("❌ Erro ao buscar detalhes:", (error as Error).message)
      throw error
    }
  }

  const getWalletTokens = async (wallet: string) => {
    if (!tokenProvider) {
      return Object.values(MAIN_TOKENS)
    }

    try {
      const tokens = await tokenProvider.tokenOf(wallet)
      return tokens
    } catch (error) {
      console.error("❌ Erro ao buscar tokens:", (error as Error).message)
      throw error
    }
  }

  // 🔥 NOVAS: Funções de autenticação
  const login = async (userData: any) => {
    console.log("🔐 Login TPulseFi:", userData)
    setUser(userData)
    setIsAuthenticated(true)
    setWalletAddress(userData.walletAddress)

    // Tentar conectar carteira real
    if (userData.walletAddress) {
      await connectRealWallet(userData.walletAddress)
    }
  }

  const logout = () => {
    console.log("🚪 Logout TPulseFi")
    setUser(null)
    setIsAuthenticated(false)
    setWalletAddress(null)
    setIsConnected(false)
    setConnectionStatus("mock")
    setMockData()
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
    sdkLoaded: dependencyStatus.sdk,
    connectionStatus,
    dependencyStatus,
    // 🔥 NOVOS: Autenticação
    user,
    isAuthenticated,
    login,
    logout,
  }

  return <WorldChainContext.Provider value={value}>{children}</WorldChainContext.Provider>
}
