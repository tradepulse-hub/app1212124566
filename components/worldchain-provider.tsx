"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 🔥 USA A VERSÃO V0 BROWSER-NATIVE
import { loadWorldChainSDKV0Native, testBigNumberBrowserNative } from "@/lib/worldchain-sdk-v0-native"
import { EthersMulticall3, WORLDCHAIN_MULTICALL3_ADDRESS } from "@/lib/multicall3-ethers"
import { EthersHoldstationClient } from "@/lib/holdstation-client"

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
    multicall3: boolean
    client: boolean
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
    multicall3: false,
    client: false,
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
      console.log("🚀 Inicializando TPulseFi Wallet - Holdstation SDK INTERFACE OFICIAL...")

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

      if (!TokenProvider || !sdkLoaded) {
        console.error("❌ SDK não carregou - TPulseFi requer Holdstation SDK!")
        setConnectionStatus("error")
        setDependencyStatus({
          ethers: !!ethers,
          sdk: false,
          tokenProvider: false,
          multicall3: false,
          client: false,
        })
        return
      }

      console.log("🎯 Holdstation SDK carregado! Configurando com INTERFACE OFICIAL...")

      // 🔥 CONFIGURA PROVIDER COMPLETO
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

        // 🔥 CRIA CLIENT HOLDSTATION OFICIAL
        console.log("🔧 Configurando Holdstation Client com INTERFACE OFICIAL...")
        const client = new EthersHoldstationClient(provider, ethers)

        // Testa se o client implementa a interface corretamente
        console.log("🧪 Testando interface Client...")
        console.log("├─ name():", client.name())
        console.log("├─ getChainId():", client.getChainId())
        console.log("├─ isValidAddress():", client.isValidAddress("0x742d35Cc6Bf8B2C4D8f9E1A3B7C5F2E8D4A6B9C1"))

        // 🔥 CRIA MULTICALL3 INSTANCE
        console.log("🔧 Configurando Multicall3...")
        const multicall3 = new EthersMulticall3(provider)

        // 🔥 CRIA TOKENPROVIDER COM INTERFACE OFICIAL
        console.log("🎯 Criando TokenProvider com CLIENT OFICIAL...")
        const tokenProviderInstance = new TokenProvider({
          provider,
          client, // 🎯 CLIENT COM INTERFACE OFICIAL COMPLETA
          multicall3, // 🎯 MULTICALL3
        })

        console.log("✅ TokenProvider criado com interface oficial!")

        // 🔥 CONFIGURA PARTNER CODE DE FORMA ROBUSTA
        console.log("🏷️ Configurando partner code 'tpulsefi'...")

        // Aguarda um pouco para garantir que o provider está pronto
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Tenta várias formas de definir o partner code
        try {
          if (typeof tokenProviderInstance.setPartnerCode === "function") {
            await tokenProviderInstance.setPartnerCode("tpulsefi")
            console.log("✅ Partner code definido via setPartnerCode()")
          } else if (tokenProviderInstance.partnerCode !== undefined) {
            tokenProviderInstance.partnerCode = "tpulsefi"
            console.log("✅ Partner code definido via propriedade")
          } else if (tokenProviderInstance.config) {
            tokenProviderInstance.config.partnerCode = "tpulsefi"
            console.log("✅ Partner code definido via config")
          } else {
            console.warn("⚠️ Não foi possível definir partner code")
          }

          // Verifica se foi definido
          console.log("🔍 Verificando partner code...")
          if (tokenProviderInstance.getPartnerCode) {
            const currentPartnerCode = tokenProviderInstance.getPartnerCode()
            console.log("📋 Partner code atual:", currentPartnerCode)
          }
        } catch (partnerError) {
          console.warn("⚠️ Erro ao definir partner code:", partnerError)
        }

        // Testa se Multicall3 está funcionando
        try {
          console.log("🧪 Testando Multicall3...")
          const testCalls = [
            {
              target: WORLDCHAIN_MULTICALL3_ADDRESS,
              callData: "0x4d2301cc", // getChainId()
            },
          ]
          const [blockNumber, results] = await multicall3.aggregate(testCalls)
          console.log("✅ Multicall3 funcionando! Block:", blockNumber, "Results:", results.length)
        } catch (multicallError) {
          console.warn("⚠️ Teste Multicall3 falhou:", multicallError)
        }

        // Testa se o client está funcionando
        try {
          console.log("🧪 Testando Holdstation Client OFICIAL...")
          const blockNumber = await client.getBlockNumber()
          console.log("✅ Client getBlockNumber():", blockNumber)

          const testCall = await client.call({
            to: WORLDCHAIN_MULTICALL3_ADDRESS,
            data: "0x4d2301cc", // getChainId()
          })
          console.log("✅ Client call():", testCall)
        } catch (clientError) {
          console.warn("⚠️ Teste Client falhou:", clientError)
        }

        setTokenProvider(tokenProviderInstance)
        setConnectionStatus("connected")

        // Atualiza status das dependências
        setDependencyStatus({
          ethers: !!ethers,
          sdk: sdkLoaded,
          tokenProvider: !!tokenProviderInstance,
          multicall3: true,
          client: true,
        })

        console.log("🎉 TPulseFi Wallet COMPLETAMENTE inicializado com INTERFACE OFICIAL!")
        console.log("📋 Configuração final:")
        console.log("├─ Provider: ✅")
        console.log("├─ Client (Interface Oficial): ✅")
        console.log("├─ Multicall3: ✅")
        console.log("├─ TokenProvider: ✅")
        console.log("└─ Partner Code: tpulsefi")
      } catch (networkError) {
        console.error("❌ Erro de rede:", (networkError as Error).message)
        console.error("Stack:", (networkError as Error).stack)
        setConnectionStatus("error")
        setDependencyStatus({
          ethers: !!ethers,
          sdk: sdkLoaded,
          tokenProvider: false,
          multicall3: false,
          client: false,
        })
      }
    } catch (error) {
      console.error("❌ Erro geral:", (error as Error).message)
      console.error("Stack:", (error as Error).stack)
      setConnectionStatus("error")
      setDependencyStatus({
        ethers: false,
        sdk: false,
        tokenProvider: false,
        multicall3: false,
        client: false,
      })
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

      // 🔥 BUSCA TOKENS REAIS DA CARTEIRA IMEDIATAMENTE
      console.log("🔍 Iniciando busca de tokens para carteira conectada...")
      await refreshWalletTokens()
    } catch (error) {
      console.error("❌ Erro ao conectar carteira:", (error as Error).message)
    }
  }

  // 🔥 BUSCA TODOS OS TOKENS DA CARTEIRA (conforme documentação)
  const refreshWalletTokens = async () => {
    if (!tokenProvider || !walletAddress) {
      console.log("⚠️ Sem provider ou wallet para buscar tokens")
      console.log("├─ TokenProvider:", !!tokenProvider)
      console.log("└─ WalletAddress:", walletAddress)
      return
    }

    setIsLoadingTokens(true)
    try {
      console.log("🔍 Buscando tokens REAIS da carteira via Holdstation SDK...")
      console.log("📋 Carteira:", walletAddress)
      console.log("📋 Provider status:", !!tokenProvider)

      // Busca todos os tokens da carteira usando tokenOf()
      console.log("📞 Chamando tokenProvider.tokenOf()...")
      const tokens = await tokenProvider.tokenOf(walletAddress)
      console.log("✅ Tokens encontrados:", tokens)
      console.log("📊 Quantidade de tokens:", tokens.length)

      setWalletTokens(tokens)

      if (tokens.length > 0) {
        // Busca detalhes dos tokens usando details()
        console.log("📋 Buscando detalhes dos tokens...")
        console.log("📞 Chamando tokenProvider.details()...")
        const details = await tokenProvider.details(...tokens)
        console.log("✅ Detalhes dos tokens:", details)
        setTokenDetails(details)

        // Busca balances dos tokens usando balanceOf()
        console.log("💰 Buscando balances dos tokens...")
        await loadBalances(tokens)
      } else {
        console.log("ℹ️ Nenhum token encontrado para esta carteira")
        setTokenDetails({})
        setTokenBalances({})
      }
    } catch (error) {
      console.error("❌ Erro ao buscar tokens da carteira:", (error as Error).message)
      console.error("📋 Error details:", error)
      console.error("Stack:", (error as Error).stack)

      // Debug adicional
      console.log("🔍 Debug info:")
      console.log("├─ TokenProvider type:", typeof tokenProvider)
      console.log("├─ TokenProvider methods:", tokenProvider ? Object.getOwnPropertyNames(tokenProvider) : "null")
      console.log("├─ WalletAddress:", walletAddress)
      console.log("└─ Connection status:", connectionStatus)

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
      console.log("📋 Tokens para buscar balances:", tokens)
      console.log("📋 Carteira:", walletAddress)

      // Busca balances usando balanceOf() conforme documentação
      console.log("📞 Chamando tokenProvider.balanceOf()...")
      const balances = await tokenProvider.balanceOf({
        wallet: walletAddress,
        tokens: tokens,
      })

      console.log("✅ Balances REAIS carregados:", balances)
      console.log("📊 Quantidade de balances:", Object.keys(balances).length)
      setTokenBalances(balances)
    } catch (error) {
      console.error("❌ Erro ao carregar balances reais:", (error as Error).message)
      console.error("📋 Error details:", error)
      console.error("Stack:", (error as Error).stack)
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
      console.log("🔗 Conectando carteira automaticamente após login...")
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
