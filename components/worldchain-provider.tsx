"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  loadWorldChainSDKComplete,
  createTokenProviderComplete,
  createSwapHelperComplete,
  createSenderComplete,
  createManagerComplete,
  createQuoterComplete,
  testBigNumberComplete,
  executeSwap,
  sendToken,
  getSimpleQuote,
  getSmartQuote,
  watchTransactionHistory,
  getTransactionHistory,
  getPopularTokens,
} from "@/lib/worldchain-sdk-complete"

interface TokenDetails {
  address: string
  chainId: number
  decimals: number
  symbol: string
  name: string
}

interface SwapQuote {
  data: string
  to: string
  value?: string
  addons?: {
    outAmount: string
    rateSwap: string
    amountOutUsd: string
    minReceived: string
    feeAmountOut: string
    router: string
  }
}

interface Transaction {
  hash: string
  block: number
  to: string
  success: string
  date: Date
  method: string
  protocol: string
  transfers: {
    tokenAddress: string
    amount: string
    from: string
    to: string
  }[]
}

interface WorldChainContextType {
  tokenProvider: any | null
  swapHelper: any | null
  sender: any | null
  manager: any | null
  quoter: any | null
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
    swapHelper: boolean
    sender: boolean
    manager: boolean
    quoter: boolean
  }
  // 🔥 Funcionalidades de Swap
  getSwapQuote: (params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    slippage?: string
    fee?: string
  }) => Promise<SwapQuote | null>
  executeSwap: (params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    slippage?: string
    fee?: string
  }) => Promise<{ success: boolean; txHash?: string; error?: string }>
  // 🔥 Funcionalidades de Send
  sendToken: (params: {
    to: string
    amount: number
    token?: string
  }) => Promise<{ success: boolean; txHash?: string; error?: string }>
  // 🔥 Funcionalidades de Quote
  getSimpleQuote: (tokenIn: string, tokenOut: string) => Promise<any>
  getSmartQuote: (tokenIn: string, options: { slippage: number; deadline: number }) => Promise<any>
  // 🔥 Funcionalidades de Histórico
  transactionHistory: Transaction[]
  isLoadingHistory: boolean
  refreshHistory: () => Promise<void>
  startHistoryWatch: () => Promise<void>
  stopHistoryWatch: () => void
  popularTokens: TokenDetails[]
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
  const [swapHelper, setSwapHelper] = useState<any | null>(null)
  const [sender, setSender] = useState<any | null>(null)
  const [manager, setManager] = useState<any | null>(null)
  const [quoter, setQuoter] = useState<any | null>(null)
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
    swapHelper: false,
    sender: false,
    manager: false,
    quoter: false,
  })

  // 🔥 Estados de histórico
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyWatcher, setHistoryWatcher] = useState<any>(null)

  // 🔥 Estados de autenticação
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 🔥 Tokens populares
  const [popularTokens] = useState<TokenDetails[]>(getPopularTokens())

  useEffect(() => {
    initializeProvider()
  }, [])

  const initializeProvider = async () => {
    try {
      setConnectionStatus("loading")
      console.log("🚀 Inicializando TPulseFi Wallet - SDK COMPLETO da Holdstation...")

      // Testa BigNumber primeiro
      const bigNumberOK = testBigNumberComplete()
      console.log("🧮 BigNumber test:", bigNumberOK ? "✅ OK" : "❌ FALHOU")

      // 🔥 CARREGA SDK COMPLETO CONFORME DOCUMENTAÇÃO
      const sdkResult = await loadWorldChainSDKComplete()

      if (!sdkResult.sdkLoaded || !sdkResult.TokenProvider || !sdkResult.SwapHelper) {
        console.error("🚫 SDK COMPLETO não carregou - sistema não pode continuar")
        setConnectionStatus("error")
        setDependencyStatus({
          ethers: false,
          sdk: false,
          tokenProvider: false,
          multicall3: false,
          client: false,
          swapHelper: false,
          sender: false,
          manager: false,
          quoter: false,
        })
        return
      }

      console.log("✅ SDK COMPLETO carregado com sucesso!")

      // 🔥 CRIA TODOS OS PROVIDERS REAIS
      try {
        console.log("🎯 Criando todos os providers REAIS...")
        const realTokenProvider = await createTokenProviderComplete()
        const realSwapHelper = await createSwapHelperComplete()
        const realSender = await createSenderComplete()
        const realManager = await createManagerComplete()
        const realQuoter = await createQuoterComplete()

        setTokenProvider(realTokenProvider)
        setSwapHelper(realSwapHelper)
        setSender(realSender)
        setManager(realManager)
        setQuoter(realQuoter)
        setConnectionStatus("connected")

        // Atualiza status das dependências
        setDependencyStatus({
          ethers: true,
          sdk: true,
          tokenProvider: true,
          multicall3: true,
          client: true,
          swapHelper: true,
          sender: true,
          manager: true,
          quoter: true,
        })

        console.log("🎉 TPulseFi Wallet com SDK COMPLETO inicializado!")
        console.log("📋 Configuração final:")
        console.log("├─ SDK: ✅ COMPLETO")
        console.log("├─ TokenProvider: ✅ REAL")
        console.log("├─ SwapHelper: ✅ REAL")
        console.log("├─ Sender: ✅ REAL")
        console.log("├─ Manager: ✅ REAL")
        console.log("├─ Quoter: ✅ REAL")
        console.log("├─ Client: ✅ REAL")
        console.log("├─ Multicall3: ✅ REAL")
        console.log("├─ ZeroX Router: ✅ REAL")
        console.log("├─ HoldSo Router: ✅ REAL")
        console.log("└─ Dados: ✅ BLOCKCHAIN REAL")
      } catch (providerError) {
        console.error("❌ Erro ao criar providers REAIS:", providerError)
        setConnectionStatus("error")
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
        swapHelper: false,
        sender: false,
        manager: false,
        quoter: false,
      })
    }
  }

  const connectRealWallet = async (userWalletAddress: string) => {
    if (!tokenProvider) {
      console.error("❌ TokenProvider REAL não disponível!")
      return
    }

    try {
      setIsConnected(true)
      setWalletAddress(userWalletAddress)
      console.log("🎉 Carteira conectada ao SDK COMPLETO:", userWalletAddress)

      // 🔥 BUSCA TOKENS REAIS DA CARTEIRA IMEDIATAMENTE
      console.log("🔍 Iniciando busca de tokens REAIS para carteira conectada...")
      await refreshWalletTokens()

      // 🔥 INICIA MONITORAMENTO DE HISTÓRICO
      console.log("👀 Iniciando monitoramento de histórico...")
      await startHistoryWatch()
    } catch (error) {
      console.error("❌ Erro ao conectar carteira:", (error as Error).message)
    }
  }

  // 🔥 BUSCA TODOS OS TOKENS REAIS DA CARTEIRA
  const refreshWalletTokens = async () => {
    if (!tokenProvider || !walletAddress) {
      console.log("⚠️ Sem provider REAL ou wallet para buscar tokens")
      return
    }

    setIsLoadingTokens(true)
    try {
      console.log("🔍 Buscando tokens REAIS da carteira via Holdstation SDK COMPLETO...")
      console.log("📋 Carteira:", walletAddress)

      // 🔥 USA MÉTODO tokenOf() CONFORME DOCUMENTAÇÃO
      console.log("📞 Chamando tokenProvider.tokenOf()...")
      const tokens = await tokenProvider.tokenOf(walletAddress)
      console.log("✅ Tokens REAIS encontrados:", tokens)
      console.log("📊 Quantidade de tokens REAIS:", tokens.length)

      setWalletTokens(tokens)

      if (tokens.length > 0) {
        // 🔥 BUSCA DETALHES DOS TOKENS CONFORME DOCUMENTAÇÃO
        console.log("📋 Buscando detalhes dos tokens REAIS...")
        console.log("📞 Chamando tokenProvider.details()...")
        const details = await tokenProvider.details(...tokens)
        console.log("✅ Detalhes dos tokens REAIS:", details)
        setTokenDetails(details)

        // 🔥 BUSCA BALANCES DOS TOKENS
        console.log("💰 Buscando balances dos tokens REAIS...")
        await loadBalances(tokens)
      } else {
        console.log("ℹ️ Nenhum token REAL encontrado para esta carteira")
        setTokenDetails({})
        setTokenBalances({})
      }
    } catch (error) {
      console.error("❌ Erro ao buscar tokens REAIS da carteira:", (error as Error).message)
      console.error("📋 Error details:", error)
      console.error("Stack:", (error as Error).stack)

      setWalletTokens([])
      setTokenDetails({})
      setTokenBalances({})
    } finally {
      setIsLoadingTokens(false)
    }
  }

  // 🔥 BUSCA BALANCES REAIS CONFORME DOCUMENTAÇÃO
  const loadBalances = async (tokens: string[]) => {
    if (!tokenProvider || !walletAddress) {
      console.log("⚠️ Sem provider REAL ou wallet para buscar balances")
      return
    }

    setIsLoadingBalances(true)
    try {
      console.log("💰 Carregando balances REAIS do WorldChain...")
      console.log("📋 Tokens para buscar balances REAIS:", tokens)
      console.log("📋 Carteira:", walletAddress)

      // 🔥 USA MÉTODO balanceOf() CONFORME DOCUMENTAÇÃO
      console.log("📞 Chamando tokenProvider.balanceOf()...")
      const balances = await tokenProvider.balanceOf({
        wallet: walletAddress,
        tokens: tokens,
      })

      console.log("✅ Balances REAIS carregados:", balances)
      console.log("📊 Quantidade de balances REAIS:", Object.keys(balances).length)
      setTokenBalances(balances)
    } catch (error) {
      console.error("❌ Erro ao carregar balances REAIS:", (error as Error).message)
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

  // 🔥 FUNÇÃO PARA OBTER QUOTE DE SWAP
  const getSwapQuote = async (params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    slippage?: string
    fee?: string
  }): Promise<SwapQuote | null> => {
    if (!swapHelper) {
      console.error("❌ SwapHelper não disponível!")
      return null
    }

    try {
      console.log("📞 Obtendo quote de swap...")
      const quoteParams = {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        slippage: params.slippage || "0.3",
        fee: params.fee || "0.2",
      }

      const quote = await swapHelper.quote(quoteParams)
      console.log("✅ Quote obtido:", quote)

      return quote
    } catch (error) {
      console.error("❌ Erro ao obter quote:", error)
      return null
    }
  }

  // 🔥 FUNÇÃO PARA EXECUTAR SWAP
  const handleExecuteSwap = async (params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    slippage?: string
    fee?: string
  }) => {
    if (!walletAddress) {
      return { success: false, error: "Carteira não conectada" }
    }

    try {
      const result = await executeSwap({
        ...params,
        slippage: params.slippage || "0.3",
        fee: params.fee || "0.2",
        walletAddress,
      })

      // Atualiza balances após swap
      if (result.success) {
        await refreshBalances()
        await refreshHistory()
      }

      return result
    } catch (error) {
      console.error("❌ Erro ao executar swap:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 🔥 FUNÇÃO PARA ENVIAR TOKENS
  const handleSendToken = async (params: {
    to: string
    amount: number
    token?: string
  }) => {
    try {
      const result = await sendToken(params)

      // Atualiza balances após envio
      if (result.success) {
        await refreshBalances()
        await refreshHistory()
      }

      return result
    } catch (error) {
      console.error("❌ Erro ao enviar token:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 🔥 FUNÇÃO PARA OBTER QUOTE SIMPLES
  const handleGetSimpleQuote = async (tokenIn: string, tokenOut: string) => {
    try {
      return await getSimpleQuote(tokenIn, tokenOut)
    } catch (error) {
      console.error("❌ Erro ao obter quote simples:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 🔥 FUNÇÃO PARA OBTER QUOTE INTELIGENTE
  const handleGetSmartQuote = async (tokenIn: string, options: { slippage: number; deadline: number }) => {
    try {
      return await getSmartQuote(tokenIn, options)
    } catch (error) {
      console.error("❌ Erro ao obter quote inteligente:", error)
      return { success: false, error: (error as Error).message }
    }
  }

  // 🔥 FUNÇÃO PARA INICIAR MONITORAMENTO DE HISTÓRICO
  const startHistoryWatch = async () => {
    if (!walletAddress) {
      console.log("⚠️ Sem wallet para monitorar histórico")
      return
    }

    try {
      console.log("👀 Iniciando watcher de histórico para:", walletAddress)

      const watchResult = await watchTransactionHistory(walletAddress, () => {
        console.log("🔔 Nova atividade detectada - atualizando histórico...")
        refreshHistory()
      })

      if (watchResult.success && watchResult.watcher) {
        setHistoryWatcher(watchResult.watcher)
        await watchResult.start()
        console.log("✅ Watcher de histórico iniciado")

        // Carrega histórico inicial
        await refreshHistory()
      }
    } catch (error) {
      console.error("❌ Erro ao iniciar watcher de histórico:", error)
    }
  }

  // 🔥 FUNÇÃO PARA PARAR MONITORAMENTO DE HISTÓRICO
  const stopHistoryWatch = () => {
    if (historyWatcher && historyWatcher.stop) {
      console.log("🛑 Parando watcher de histórico...")
      historyWatcher.stop()
      setHistoryWatcher(null)
    }
  }

  // 🔥 FUNÇÃO PARA ATUALIZAR HISTÓRICO
  const refreshHistory = async () => {
    setIsLoadingHistory(true)
    try {
      console.log("📋 Atualizando histórico de transações...")

      const historyResult = await getTransactionHistory(0, 100)

      if (historyResult.success) {
        setTransactionHistory(historyResult.transactions)
        console.log("✅ Histórico atualizado:", historyResult.transactions.length, "transações")
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar histórico:", error)
    } finally {
      setIsLoadingHistory(false)
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
    console.log("🚪 Logout TPulseFi - limpando estado completo")

    // Para watcher de histórico
    stopHistoryWatch()

    // Limpa todos os estados
    setUser(null)
    setIsAuthenticated(false)
    setWalletAddress(null)
    setIsConnected(false)
    setTokenBalances({})
    setTokenDetails({})
    setWalletTokens([])
    setIsLoadingBalances(false)
    setIsLoadingTokens(false)
    setTransactionHistory([])
    setIsLoadingHistory(false)

    // Limpa storage se disponível
    if (typeof window !== "undefined") {
      try {
        localStorage.clear()
        sessionStorage.clear()
        console.log("🧹 Storage limpo no logout")
      } catch (storageError) {
        console.warn("⚠️ Erro ao limpar storage:", storageError)
      }
    }

    console.log("✅ Estado TPulseFi limpo completamente")
  }

  const value: WorldChainContextType = {
    tokenProvider,
    swapHelper,
    sender,
    manager,
    quoter,
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
    // 🔥 Funcionalidades de Swap
    getSwapQuote,
    executeSwap: handleExecuteSwap,
    // 🔥 Funcionalidades de Send
    sendToken: handleSendToken,
    // 🔥 Funcionalidades de Quote
    getSimpleQuote: handleGetSimpleQuote,
    getSmartQuote: handleGetSmartQuote,
    // 🔥 Funcionalidades de Histórico
    transactionHistory,
    isLoadingHistory,
    refreshHistory,
    startHistoryWatch,
    stopHistoryWatch,
    popularTokens,
    // 🔥 Autenticação
    user,
    isAuthenticated,
    login,
    logout,
  }

  return <WorldChainContext.Provider value={value}>{children}</WorldChainContext.Provider>
}
