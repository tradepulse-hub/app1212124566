"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// 🔥 USA A VERSÃO HIJACK TOTAL
import { loadWorldChainSDKV0Hijack, testBigNumberHijack } from "@/lib/worldchain-sdk-v0-hijack"
import { EthersMulticall3 } from "@/lib/multicall3-ethers"
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
      console.log("🚀 Inicializando TPulseFi Wallet - HIJACK TOTAL V0...")

      // Testa BigNumber hijack primeiro
      const bigNumberOK = testBigNumberHijack()
      console.log("🧮 BigNumber HIJACK test:", bigNumberOK ? "✅ OK" : "❌ FALHOU")

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

      /* -------------------------------------------------------------------- */
      /* 1) Tenta carregar o SDK oficial com hijack                           */
      /* -------------------------------------------------------------------- */
      const { TokenProvider, sdkLoaded } = await loadWorldChainSDKV0Hijack()

      let TokenProviderClass: any = null
      let usingMock = false

      if (sdkLoaded && TokenProvider) {
        console.log("✅ Holdstation SDK (hijack) carregado com sucesso")
        TokenProviderClass = TokenProvider
      } else {
        /* ----------------------- FALLBACK PARA MOCK ----------------------- */
        console.warn("⚠️ SDK oficial falhou - usando mock TokenProvider")
        const mock = await import("@/lib/mock-worldchain-sdk")
        TokenProviderClass = mock.TokenProvider
        usingMock = true
      }

      console.log("🎯 Holdstation SDK carregado com HIJACK TOTAL!")

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
        console.log("🔧 Configurando Holdstation Client...")
        const client = new EthersHoldstationClient(provider, ethers)

        // Testa se o client implementa a interface corretamente
        console.log("🧪 Testando interface Client...")
        console.log("├─ name():", client.name())
        console.log("├─ getChainId():", client.getChainId())
        console.log("├─ isValidAddress():", client.isValidAddress("0x742d35Cc6Bf8B2C4D8f9E1A3B7C5F2E8D4A6B9C1"))

        // 🔥 CRIA MULTICALL3 INSTANCE
        console.log("🔧 Configurando Multicall3...")
        const multicall3 = new EthersMulticall3(provider, ethers)

        // 🔥 TESTA MULTICALL3 COM MÉTODO CORRETO
        console.log("🧪 Testando Multicall3 com método correto...")
        const multicall3Works = await multicall3.testContract()
        console.log("📋 Multicall3 status:", multicall3Works ? "✅ OK" : "❌ FALHOU")

        // 🔥 CRIA TOKENPROVIDER COM CONFIGURAÇÃO CORRETA
        console.log("🎯 Criando TokenProvider com HIJACK TOTAL...")

        // Primeiro, cria uma instância básica para definir o partner code
        let tokenProviderInstance
        try {
          tokenProviderInstance = new TokenProviderClass({
            provider,
            client,
            multicall3,
          })
          console.log("✅ TokenProvider criado com HIJACK TOTAL!")
        } catch (createError) {
          console.warn("⚠️ Erro ao criar TokenProvider:", createError)
          // Tenta sem multicall3 se falhar
          tokenProviderInstance = new TokenProviderClass({
            provider,
            client,
          })
          console.log("✅ TokenProvider criado sem Multicall3")
        }

        // 🔥 CONFIGURA PARTNER CODE ANTES DE USAR
        console.log("🏷️ Configurando partner code 'tpulsefi'...")

        // Aguarda um pouco para garantir que o provider está pronto
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Tenta várias formas de definir o partner code
        let partnerCodeSet = false
        try {
          // Método 1: setPartnerCode
          if (typeof tokenProviderInstance.setPartnerCode === "function") {
            await tokenProviderInstance.setPartnerCode("tpulsefi")
            console.log("✅ Partner code definido via setPartnerCode()")
            partnerCodeSet = true
          }

          // Método 2: propriedade direta
          if (!partnerCodeSet && tokenProviderInstance.partnerCode !== undefined) {
            tokenProviderInstance.partnerCode = "tpulsefi"
            console.log("✅ Partner code definido via propriedade")
            partnerCodeSet = true
          }

          // Método 3: config
          if (!partnerCodeSet && tokenProviderInstance.config) {
            tokenProviderInstance.config.partnerCode = "tpulsefi"
            console.log("✅ Partner code definido via config")
            partnerCodeSet = true
          }

          // Método 4: forçar no construtor
          if (!partnerCodeSet) {
            console.log("🔄 Recriando TokenProvider com partner code...")
            tokenProviderInstance = new TokenProviderClass({
              provider,
              client,
              multicall3: multicall3Works ? multicall3 : undefined,
              partnerCode: "tpulsefi", // Tenta passar direto no construtor
            })
            console.log("✅ TokenProvider recriado com partner code")
            partnerCodeSet = true
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

        // Testa se o client está funcionando com método simples
        try {
          console.log("🧪 Testando Holdstation Client...")
          const blockNumber = await client.getBlockNumber()
          console.log("✅ Client getBlockNumber():", blockNumber)
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
          multicall3: multicall3Works,
          client: true,
        })

        console.log("🎉 TPulseFi Wallet HIJACK TOTAL inicializado!")
        console.log("📋 Configuração final:")
        console.log("├─ Provider: ✅")
        console.log("├─ Client: ✅")
        console.log("├─ Multicall3:", multicall3Works ? "✅" : "⚠️ Opcional")
        console.log("├─ TokenProvider: ✅")
        console.log("└─ Partner Code:", partnerCodeSet ? "✅ tpulsefi" : "⚠️ Não definido")
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
