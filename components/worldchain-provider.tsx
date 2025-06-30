"use client"

/* 🔗 2. IMPORTA QUALQUER COISA **DEPOIS** do alias já ter sido aplicado.
       Não precisamos carregar manualmente um shim; o alias garante que
       `import { BigNumber } from "bignumber.js"` funcione em todo lugar   */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

let ethers: any = null
let TokenProvider: any = null
let sdkLoaded = false

// -----------------------------------------------------------------------------
// 1. Carrega dependências com FALBACK SEGURO
// -----------------------------------------------------------------------------
async function loadDeps() {
  if (sdkLoaded) return
  try {
    // a) ethers
    const ethersMod = await import("ethers")
    ethers = ethersMod.ethers ?? ethersMod

    // b) WorldChain SDK — pode falhar por causa do BigNumber
    const sdk = await import("@holdstation/worldchain-sdk")
    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider
    sdkLoaded = true
    console.log("✅ WorldChain SDK carregado")
  } catch (err) {
    sdkLoaded = false
    TokenProvider = null
    console.warn("⚠️ Não foi possível carregar o SDK real; ativando modo Mock.\nDetalhe:", (err as Error).message)
  }
}

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
      console.log("🚀 Inicializando TPulseFi Wallet...")

      // Carrega dependências
      await loadDeps()

      // Se o SDK REAL não carregou, continuamos em modo Mock sem lançar exceção
      if (!TokenProvider) {
        setDependencyStatus({ ethers: !!ethers, sdk: false, tokenProvider: false })
        console.log("🚧 Executando com dados simulados do TPulseFi")
        setConnectionStatus("mock")
        setMockData()
        return
      }

      // Declare setSdkLoaded variable
      const setSdkLoaded = (loaded: boolean) => {
        sdkLoaded = loaded
      }

      // Atualiza status das dependências
      setDependencyStatus({
        ethers: !!ethers,
        sdk: !!TokenProvider,
        tokenProvider: !!TokenProvider,
      })

      if (!ethers || !TokenProvider) {
        console.log("⚠️ Dependências não disponíveis, usando modo mock...")
        setConnectionStatus("mock")
        setSdkLoaded(false)
        setMockData()
        return
      }

      setSdkLoaded(true)

      // Tenta conectar ao WorldChain
      try {
        console.log("🌐 Conectando ao WorldChain...")
        const provider = new ethers.providers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public")

        // Testa conexão com timeout
        const networkPromise = provider.getNetwork()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout de conexão")), 15000),
        )

        const network = await Promise.race([networkPromise, timeoutPromise])
        console.log("✅ Conectado ao WorldChain:", network)

        const tokenProviderInstance = new TokenProvider({ provider })
        setTokenProvider(tokenProviderInstance)
        setIsConnected(true)
        setConnectionStatus("connected")

        // Endereço de exemplo
        const exampleWallet = "0x14a028cC500108307947dca4a1Aa35029FB66CE0"
        setWalletAddress(exampleWallet)

        console.log("🎉 TPulseFi Wallet inicializado com sucesso!")

        // Carregar balances
        await loadBalances(tokenProviderInstance, exampleWallet)
      } catch (networkError) {
        console.error("❌ Erro de rede:", networkError.message)
        setConnectionStatus("mock")
        setMockData()
      }
    } catch (error) {
      console.error("❌ Erro geral:", error.message)
      setConnectionStatus("error")
      setMockData()
    }
  }

  const setMockData = () => {
    console.log("🎭 Carregando dados mock do TPulseFi...")
    setIsConnected(false)
    setWalletAddress("0x14a028cC500108307947dca4a1Aa35029FB66CE0")
    setTokenBalances({
      "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45": "15420750000000000000000", // 15,420.75 TPF
      "0x4200000000000000000000000000000000000006": "2450000000000000000", // 2.45 WETH
      "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": "1250000000", // 1,250 USDCe
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": "5000000000000000000000", // 5,000 WLD
    })
    console.log("✅ Dados mock do TPulseFi carregados")
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
      console.error("❌ Erro ao carregar balances reais:", error.message)
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
      console.error("❌ Erro ao buscar detalhes:", error.message)
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
      console.error("❌ Erro ao buscar tokens:", error.message)
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
    sdkLoaded,
    connectionStatus,
    dependencyStatus,
  }

  return <WorldChainContext.Provider value={value}>{children}</WorldChainContext.Provider>
}
