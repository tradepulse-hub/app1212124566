"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 🔥 USA A VERSÃO V0 BROWSER-NATIVE
import { loadWorldChainSDKV0Native, testBigNumberBrowserNative } from "@/lib/worldchain-sdk-v0-native"

let ethers: any = null

interface TokenDetails {
  address: string
  chainId: number
  decimals: number
  symbol: string
  name: string
}

interface WorldChainContextType {
  tokenProvider: any | null
  isConnected: boolean
  walletAddress: string | null
  tokenBalances: Record<string, string>
  tokenDetails: Record<string, TokenDetails>
  walletTokens: string[]
  isLoadingBalances: boolean
  isLoadingTokens: boolean
  refreshBalances: () => Promise<void>
  refreshWalletTokens: () => Promise<void>
  sdkLoaded: boolean
  connectionStatus: "loading" | "connected" | "error"
  dependencyStatus: {
    ethers: boolean
    sdk: boolean
    tokenProvider: boolean
  }
  // 🔥 Autenticação
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
  const [tokenDetails, setTokenDetails] = useState<Record<string, TokenDetails>>({})
  const [walletTokens, setWalletTokens] = useState<string[]>([])
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"loading" | "connected" | "error">("loading")
  const [dependencyStatus, setDependencyStatus] = useState({
    ethers: false,
    sdk: false,
    tokenProvider: false,
  })

  // 🔥 Estados de autenticação
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    initializeProvider()
  }, [])

  const initializeProvider = async () => {
    try {
      setConnectionStatus("loading")
      console.log("🚀 Inicializando TPulseFi Wallet - Holdstation SDK REAL...")

      // Testa BigNumber browser-native primeiro
      const bigNumberOK = testBigNumberBrowserNative()
      console.log("🧮 BigNumber v0 browser-native test:", bigNumberOK ? "✅ OK" : "❌ FALHOU")

      // 🔥 CARREGA ETHERS CORRETAMENTE
      try {
        const ethersMod = await import("ethers")
        // Ethers v5/v6 compatibility
        if (ethersMod.ethers) {
          ethers = ethersMod.ethers
        } else {
          ethers = ethersMod
        }
        console.log("✅ Ethers.js carregado:", ethers.version || "v6+")
      } catch (ethersError) {
        console.error("❌ Erro ao carregar Ethers:", ethersError)
        setConnectionStatus("error")
        return
      }

      // Carrega WorldChain SDK
      const { TokenProvider, sdkLoaded } = await loadWorldChainSDKV0Native()

      // Atualiza status das dependências
      setDependencyStatus({
        ethers: !!ethers,
        sdk: sdkLoaded,
        tokenProvider: !!TokenProvider,
      })

      if (!TokenProvider || !sdkLoaded) {
        console.error("❌ SDK não carregou - TPulseFi requer Holdstation SDK!")
        setConnectionStatus("error")
        return
      }

      console.log("🎯 Holdstation SDK carregado! Configurando provider...")

      // 🔥 CONFIGURA PROVIDER CONFORME DOCUMENTAÇÃO
      try {
        console.log("🌐 Conectando ao WorldChain RPC...")

        // Cria provider ethers
        let provider
        if (ethers.providers?.JsonRpcProvider) {
          // Ethers v5
          provider = new ethers.providers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
        } else if (ethers.JsonRpcProvider) {
          // Ethers v6
          provider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")
        } else {
          throw new Error("JsonRpcProvider não encontrado")
        }

        // Testa conexão
        const network = await provider.getNetwork()
        console.log("✅ Conectado ao WorldChain:", network)

        // 🔥 CRIA TOKENPROVIDER CONFORME DOCUMENTAÇÃO
        const tokenProviderInstance = new TokenProvider({ provider })

        // Configura partner code
        if (tokenProviderInstance.setPartnerCode) {
          tokenProviderInstance.setPartnerCode("tpulsefi")
          console.log("✅ Partner code 'tpulsefi' configurado")
        }

        setTokenProvider(tokenProviderInstance)
        setConnectionStatus("connected")

        console.log("🎉 TPulseFi Wallet inicializado com Holdstation SDK!")
      } catch (networkError) {
        console.error("❌ Erro de rede:", (networkError as Error).message)
        setConnectionStatus("error")
      }
    } catch (error) {
      console.error("❌ Erro geral:", (error as Error).message)
      setConnectionStatus("error")
    }
  }

  const connectRealWallet = async (userWalletAddress: string) => {
    if (!tokenProvider) {
      console.error("❌ TokenProvider não disponível!")
      return
    }

    try {
      setIsConnected(true)
      setWalletAddress(userWalletAddress)
      console.log("🎉 Carteira conectada:", userWalletAddress)

      // 🔥 BUSCA TOKENS REAIS DA CARTEIRA
      await refreshWalletTokens()
    } catch (error) {
      console.error("❌ Erro ao conectar carteira:", (error as Error).message)
    }
  }

  // 🔥 BUSCA TODOS OS TOKENS DA CARTEIRA (conforme documentação)
  const refreshWalletTokens = async () => {
    if (!tokenProvider || !walletAddress) {
      console.log("⚠️ Sem provider ou wallet para buscar tokens")
      return
    }

    setIsLoadingTokens(true)
    try {
      console.log("🔍 Buscando tokens REAIS da carteira...")

      // Busca todos os tokens da carteira usando tokenOf()
      const tokens = await tokenProvider.tokenOf(walletAddress)
      console.log("✅ Tokens encontrados:", tokens)

      setWalletTokens(tokens)

      if (tokens.length > 0) {
        // Busca detalhes dos tokens usando details()
        const details = await tokenProvider.details(...tokens)
        console.log("✅ Detalhes dos tokens:", details)
        setTokenDetails(details)

        // Busca balances dos tokens usando balanceOf()
        await loadBalances(tokens)
      }
    } catch (error) {
      console.error("❌ Erro ao buscar tokens da carteira:", (error as Error).message)
      setWalletTokens([])
      setTokenDetails({})
      setTokenBalances({})
    } finally {
      setIsLoadingTokens(false)
    }
  }

  // 🔥 BUSCA BALANCES REAIS (conforme documentação)
  const loadBalances = async (tokens: string[]) => {
    if (!tokenProvider || !walletAddress) {
      console.log("⚠️ Sem provider ou wallet para buscar balances")
      return
    }

    setIsLoadingBalances(true)
    try {
      console.log("💰 Carregando balances REAIS do WorldChain...")

      // Busca balances usando balanceOf() conforme documentação
      const balances = await tokenProvider.balanceOf({
        wallet: walletAddress,
        tokens: tokens,
      })

      console.log("✅ Balances REAIS carregados:", balances)
      setTokenBalances(balances)
    } catch (error) {
      console.error("❌ Erro ao carregar balances reais:", (error as Error).message)
      setTokenBalances({})
    } finally {
      setIsLoadingBalances(false)
    }
  }

  const refreshBalances = async () => {
    if (walletTokens.length > 0) {
      await loadBalances(walletTokens)
    } else {
      await refreshWalletTokens()
    }
  }

  // 🔥 Funções de autenticação
  const login = async (userData: any) => {
    console.log("🔐 Login TPulseFi:", userData)
    setUser(userData)
    setIsAuthenticated(true)

    // Conectar carteira real imediatamente
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
    setTokenBalances({})
    setTokenDetails({})
    setWalletTokens([])
  }

  const value: WorldChainContextType = {
    tokenProvider,
    isConnected,
    walletAddress,
    tokenBalances,
    tokenDetails,
    walletTokens,
    isLoadingBalances,
    isLoadingTokens,
    refreshBalances,
    refreshWalletTokens,
    sdkLoaded: dependencyStatus.sdk,
    connectionStatus,
    dependencyStatus,
    // 🔥 Autenticação
    user,
    isAuthenticated,
    login,
    logout,
  }

  return <WorldChainContext.Provider value={value}>{children}</WorldChainContext.Provider>
}
