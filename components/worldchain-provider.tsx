"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  loadWorldChainSDKComplete,
  createTokenProviderComplete,
  createSwapHelperComplete,
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
  symbol: string
  name: string
  decimals: number
  chainId?: number
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
  // SDK Status
  isSDKLoaded: boolean
  isConnected: boolean
  walletAddress: string | null
  sdkError: string | null

  // Token Data
  tokenDetails: Record<string, TokenDetails>
  tokenBalances: Record<string, string>
  walletTokens: string[]
  popularTokens: TokenDetails[]

  // Transaction History
  transactionHistory: Transaction[]
  isLoadingHistory: boolean

  // Loading States
  isLoadingTokens: boolean
  isLoadingBalances: boolean

  // Functions
  connectWallet: (address: string) => void
  disconnectWallet: () => void
  refreshTokenData: () => Promise<void>
  refreshHistory: () => Promise<void>
  getSwapQuote: (params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    slippage: string
    fee: string
  }) => Promise<any>
  executeSwap: (params: {
    tokenIn: string
    tokenOut: string
    amountIn: string
    slippage: string
    fee: string
  }) => Promise<any>
  sendToken: (params: {
    to: string
    amount: number
    token?: string
  }) => Promise<any>
  getSimpleQuote: (tokenIn: string, tokenOut: string) => Promise<any>
  getSmartQuote: (tokenIn: string, options: { slippage: number; deadline: number }) => Promise<any>
}

const WorldChainContext = createContext<WorldChainContextType | undefined>(undefined)

export function WorldChainProvider({ children }: { children: React.ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [tokenDetails, setTokenDetails] = useState<Record<string, TokenDetails>>({})
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  const [walletTokens, setWalletTokens] = useState<string[]>([])
  const [popularTokens, setPopularTokens] = useState<TokenDetails[]>([])
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const [isLoadingBalances, setIsLoadingBalances] = useState(false)
  const [historyWatcher, setHistoryWatcher] = useState<any>(null)

  // Carrega SDK na inicialização
  useEffect(() => {
    loadSDK()
  }, [])

  // Monitora histórico quando conecta carteira
  useEffect(() => {
    if (walletAddress && isSDKLoaded) {
      startHistoryWatcher()
    } else {
      stopHistoryWatcher()
    }

    return () => {
      stopHistoryWatcher()
    }
  }, [walletAddress, isSDKLoaded])

  const loadSDK = async () => {
    try {
      console.log("🚀 Carregando WorldChain SDK...")
      const result = await loadWorldChainSDKComplete()

      if (result.sdkLoaded) {
        setIsSDKLoaded(true)
        setPopularTokens(getPopularTokens())
        setSdkError(null)
        console.log("✅ WorldChain SDK carregado com sucesso!")
      } else {
        setIsSDKLoaded(false)
        setSdkError(result.error || "Falha ao carregar SDK")
        console.error("❌ Falha ao carregar WorldChain SDK:", result.error)
      }
    } catch (error) {
      console.error("❌ Erro ao carregar SDK:", error)
      setIsSDKLoaded(false)
      setSdkError((error as Error).message)
    }
  }

  const connectWallet = useCallback(
    (address: string) => {
      if (!isSDKLoaded) {
        throw new Error("SDK não carregado")
      }

      console.log("🔗 Conectando carteira:", address)
      setWalletAddress(address)
      setIsConnected(true)

      // Carrega dados da carteira
      refreshTokenData()
    },
    [isSDKLoaded],
  )

  const disconnectWallet = useCallback(() => {
    console.log("🔌 Desconectando carteira")
    setWalletAddress(null)
    setIsConnected(false)
    setTokenDetails({})
    setTokenBalances({})
    setWalletTokens([])
    setTransactionHistory([])
    stopHistoryWatcher()
  }, [])

  const refreshTokenData = useCallback(async () => {
    if (!walletAddress || !isSDKLoaded) {
      throw new Error("SDK não carregado ou carteira não conectada")
    }

    setIsLoadingTokens(true)
    setIsLoadingBalances(true)

    try {
      console.log("🔄 Atualizando dados dos tokens...")
      const tokenProvider = await createTokenProviderComplete(walletAddress)

      // 1. Descobre tokens da carteira
      console.log("🔍 Descobrindo tokens da carteira...")
      const discoveredTokens = await tokenProvider.tokenOf(walletAddress)
      console.log("✅ Tokens descobertos:", discoveredTokens)

      // 2. Combina com tokens populares
      const allTokens = [...new Set([...discoveredTokens, ...popularTokens.map((t) => t.address)])]
      setWalletTokens(discoveredTokens)

      // 3. Busca detalhes dos tokens
      if (allTokens.length > 0) {
        console.log("📋 Buscando detalhes dos tokens...")
        const details = await tokenProvider.details(...allTokens)
        console.log("✅ Detalhes obtidos:", details)
        setTokenDetails(details)

        // 4. Busca balances
        console.log("💰 Buscando balances...")
        const balances = await tokenProvider.balanceOf({
          wallet: walletAddress,
          tokens: allTokens,
        })
        console.log("✅ Balances obtidos:", balances)
        setTokenBalances(balances)
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar dados dos tokens:", error)
      throw error
    } finally {
      setIsLoadingTokens(false)
      setIsLoadingBalances(false)
    }
  }, [walletAddress, isSDKLoaded, popularTokens])

  const startHistoryWatcher = useCallback(async () => {
    if (!walletAddress || !isSDKLoaded || historyWatcher) return

    try {
      console.log("👀 Iniciando monitoramento de histórico...")
      const result = await watchTransactionHistory(walletAddress, () => {
        console.log("🔔 Nova atividade detectada, atualizando histórico...")
        refreshHistory()
      })

      if (result.success && result.watcher) {
        setHistoryWatcher(result.watcher)
        await result.start()
        console.log("✅ Monitoramento de histórico iniciado")

        // Carrega histórico inicial
        refreshHistory()
      }
    } catch (error) {
      console.error("❌ Erro ao iniciar monitoramento:", error)
      throw error
    }
  }, [walletAddress, isSDKLoaded, historyWatcher])

  const stopHistoryWatcher = useCallback(() => {
    if (historyWatcher) {
      console.log("🛑 Parando monitoramento de histórico...")
      if (historyWatcher.stop) {
        historyWatcher.stop()
      }
      setHistoryWatcher(null)
    }
  }, [historyWatcher])

  const refreshHistory = useCallback(async () => {
    if (!walletAddress || !isSDKLoaded) {
      throw new Error("SDK não carregado ou carteira não conectada")
    }

    setIsLoadingHistory(true)
    try {
      console.log("📋 Atualizando histórico de transações...")
      const result = await getTransactionHistory(0, 100)

      if (result.success) {
        setTransactionHistory(result.transactions)
        console.log("✅ Histórico atualizado:", result.transactions.length, "transações")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar histórico:", error)
      throw error
    } finally {
      setIsLoadingHistory(false)
    }
  }, [walletAddress, isSDKLoaded])

  const handleGetSwapQuote = useCallback(
    async (params: {
      tokenIn: string
      tokenOut: string
      amountIn: string
      slippage: string
      fee: string
    }) => {
      if (!isSDKLoaded) {
        throw new Error("SDK não carregado")
      }

      try {
        console.log("📊 Obtendo quote de swap...")
        const swapHelper = await createSwapHelperComplete()

        const quote = await swapHelper.quote({
          tokenIn: params.tokenIn,
          tokenOut: params.tokenOut,
          amountIn: params.amountIn,
          slippage: params.slippage,
          fee: params.fee,
        })

        console.log("✅ Quote obtido:", quote)
        return quote
      } catch (error) {
        console.error("❌ Erro ao obter quote:", error)
        throw error
      }
    },
    [isSDKLoaded],
  )

  const handleExecuteSwap = useCallback(
    async (params: {
      tokenIn: string
      tokenOut: string
      amountIn: string
      slippage: string
      fee: string
    }) => {
      if (!isSDKLoaded || !walletAddress) {
        throw new Error("SDK não carregado ou carteira não conectada")
      }

      try {
        const result = await executeSwap({
          ...params,
          walletAddress,
        })

        if (result.success) {
          // Atualiza dados após swap bem-sucedido
          setTimeout(() => {
            refreshTokenData()
            refreshHistory()
          }, 2000)
        }

        return result
      } catch (error) {
        console.error("❌ Erro ao executar swap:", error)
        throw error
      }
    },
    [isSDKLoaded, walletAddress, refreshTokenData, refreshHistory],
  )

  const handleSendToken = useCallback(
    async (params: {
      to: string
      amount: number
      token?: string
    }) => {
      if (!isSDKLoaded || !walletAddress) {
        throw new Error("SDK não carregado ou carteira não conectada")
      }

      try {
        const result = await sendToken(params)

        if (result.success) {
          // Atualiza dados após envio bem-sucedido
          setTimeout(() => {
            refreshTokenData()
            refreshHistory()
          }, 2000)
        }

        return result
      } catch (error) {
        console.error("❌ Erro ao enviar token:", error)
        throw error
      }
    },
    [isSDKLoaded, walletAddress, refreshTokenData, refreshHistory],
  )

  const handleGetSimpleQuote = useCallback(
    async (tokenIn: string, tokenOut: string) => {
      if (!isSDKLoaded) {
        throw new Error("SDK não carregado")
      }

      try {
        return await getSimpleQuote(tokenIn, tokenOut)
      } catch (error) {
        console.error("❌ Erro ao obter quote simples:", error)
        throw error
      }
    },
    [isSDKLoaded],
  )

  const handleGetSmartQuote = useCallback(
    async (tokenIn: string, options: { slippage: number; deadline: number }) => {
      if (!isSDKLoaded) {
        throw new Error("SDK não carregado")
      }

      try {
        return await getSmartQuote(tokenIn, options)
      } catch (error) {
        console.error("❌ Erro ao obter quote inteligente:", error)
        throw error
      }
    },
    [isSDKLoaded],
  )

  const contextValue: WorldChainContextType = {
    // SDK Status
    isSDKLoaded,
    isConnected,
    walletAddress,
    sdkError,

    // Token Data
    tokenDetails,
    tokenBalances,
    walletTokens,
    popularTokens,

    // Transaction History
    transactionHistory,
    isLoadingHistory,

    // Loading States
    isLoadingTokens,
    isLoadingBalances,

    // Functions
    connectWallet,
    disconnectWallet,
    refreshTokenData,
    refreshHistory,
    getSwapQuote: handleGetSwapQuote,
    executeSwap: handleExecuteSwap,
    sendToken: handleSendToken,
    getSimpleQuote: handleGetSimpleQuote,
    getSmartQuote: handleGetSmartQuote,
  }

  return <WorldChainContext.Provider value={contextValue}>{children}</WorldChainContext.Provider>
}

export function useWorldChain() {
  const context = useContext(WorldChainContext)
  if (context === undefined) {
    throw new Error("useWorldChain must be used within a WorldChainProvider")
  }
  return context
}
