"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipos para o contexto
interface WorldChainContextType {
  isSDKLoaded: boolean
  sdkError: string | null
  isConnected: boolean
  address: string | null
  balance: string | null
  tokens: any[]
  transactions: any[]
  // Funções
  connect: () => Promise<void>
  disconnect: () => void
  sendToken: (to: string, amount: string, token?: string) => Promise<string>
  swapTokens: (fromToken: string, toToken: string, amount: string) => Promise<string>
  getQuote: (fromToken: string, toToken: string, amount: string) => Promise<any>
  refreshBalance: () => Promise<void>
  refreshTransactions: () => Promise<void>
}

const WorldChainContext = createContext<WorldChainContextType | undefined>(undefined)

export function useWorldChain() {
  const context = useContext(WorldChainContext)
  if (context === undefined) {
    throw new Error("useWorldChain must be used within a WorldChainProvider")
  }
  return context
}

interface WorldChainProviderProps {
  children: ReactNode
}

export function WorldChainProvider({ children }: WorldChainProviderProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [tokens, setTokens] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  // SDK e componentes
  const [sdk, setSdk] = useState<any>(null)
  const [ethersAdapter, setEthersAdapter] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)

  // Carregar SDK
  useEffect(() => {
    async function loadSDK() {
      try {
        console.log("🔄 Carregando WorldChain SDK...")

        // Tentar carregar as dependências
        const [worldchainSDK, ethersV6, ethers, BigNumber] = await Promise.all([
          import("@holdstation/worldchain-sdk").catch(() => null),
          import("@holdstation/worldchain-ethers-v6").catch(() => null),
          import("ethers").catch(() => null),
          import("bignumber.js").catch(() => null),
        ])

        if (!worldchainSDK || !ethersV6 || !ethers || !BigNumber) {
          throw new Error("Dependências do WorldChain SDK não encontradas")
        }

        console.log("✅ Dependências carregadas")

        // Criar provider
        const rpcProvider = new ethers.JsonRpcProvider("https://worldchain-mainnet.g.alchemy.com/public", {
          chainId: 480,
          name: "worldchain",
        })

        // Criar client
        const client = new ethersV6.Client(rpcProvider)
        const multicall3 = new ethersV6.Multicall3(rpcProvider)

        // Criar componentes do SDK
        const tokenProvider = new worldchainSDK.TokenProvider({ client, multicall3 })
        const swapHelper = new worldchainSDK.SwapHelper({ client, multicall3 })
        const sender = new worldchainSDK.Sender({ client })
        const manager = new worldchainSDK.Manager({ client, multicall3 })

        setSdk({
          TokenProvider: tokenProvider,
          SwapHelper: swapHelper,
          Sender: sender,
          Manager: manager,
          worldchainSDK,
          ethersV6,
          ethers,
          BigNumber,
        })

        setEthersAdapter(ethersV6)
        setProvider(rpcProvider)
        setIsSDKLoaded(true)
        setSdkError(null)

        console.log("🎉 WorldChain SDK carregado com sucesso!")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
        console.error("❌ Falha ao carregar WorldChain SDK:", errorMessage)
        setSdkError(errorMessage)
        setIsSDKLoaded(false)
      }
    }

    loadSDK()
  }, [])

  // Funções do contexto
  const connect = async () => {
    if (!isSDKLoaded || !sdk) {
      throw new Error("SDK não carregado")
    }

    try {
      // Conectar com MetaMask ou carteira
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const account = accounts[0]

        setAddress(account)
        setIsConnected(true)

        // Atualizar balance
        await refreshBalance()
        await refreshTransactions()

        console.log("✅ Conectado:", account)
      } else {
        throw new Error("MetaMask não encontrado")
      }
    } catch (error) {
      console.error("❌ Erro ao conectar:", error)
      throw error
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance(null)
    setTokens([])
    setTransactions([])
    console.log("🔌 Desconectado")
  }

  const sendToken = async (to: string, amount: string, token?: string): Promise<string> => {
    if (!isSDKLoaded || !sdk || !address) {
      throw new Error("SDK não carregado ou não conectado")
    }

    try {
      // Usar o Sender do SDK
      const result = await sdk.Sender.send({
        to,
        amount,
        token: token || "ETH",
        from: address,
      })

      // Atualizar dados após envio
      await refreshBalance()
      await refreshTransactions()

      return result.hash
    } catch (error) {
      console.error("❌ Erro ao enviar token:", error)
      throw error
    }
  }

  const swapTokens = async (fromToken: string, toToken: string, amount: string): Promise<string> => {
    if (!isSDKLoaded || !sdk || !address) {
      throw new Error("SDK não carregado ou não conectado")
    }

    try {
      // Usar o SwapHelper do SDK
      const result = await sdk.SwapHelper.swap({
        fromToken,
        toToken,
        amount,
        slippage: 0.5, // 0.5%
        from: address,
      })

      // Atualizar dados após swap
      await refreshBalance()
      await refreshTransactions()

      return result.hash
    } catch (error) {
      console.error("❌ Erro ao fazer swap:", error)
      throw error
    }
  }

  const getQuote = async (fromToken: string, toToken: string, amount: string) => {
    if (!isSDKLoaded || !sdk) {
      throw new Error("SDK não carregado")
    }

    try {
      // Usar o SwapHelper para obter quote
      const quote = await sdk.SwapHelper.getQuote({
        fromToken,
        toToken,
        amount,
      })

      return quote
    } catch (error) {
      console.error("❌ Erro ao obter quote:", error)
      throw error
    }
  }

  const refreshBalance = async () => {
    if (!isSDKLoaded || !sdk || !address) return

    try {
      // Obter balance usando TokenProvider
      const balanceData = await sdk.TokenProvider.getBalance(address)
      setBalance(balanceData.formatted)

      // Obter lista de tokens
      const tokenList = await sdk.TokenProvider.getTokens(address)
      setTokens(tokenList)
    } catch (error) {
      console.error("❌ Erro ao atualizar balance:", error)
    }
  }

  const refreshTransactions = async () => {
    if (!isSDKLoaded || !sdk || !address) return

    try {
      // Obter histórico de transações
      const txHistory = await sdk.Manager.getTransactions(address)
      setTransactions(txHistory)
    } catch (error) {
      console.error("❌ Erro ao atualizar transações:", error)
    }
  }

  const value: WorldChainContextType = {
    isSDKLoaded,
    sdkError,
    isConnected,
    address,
    balance,
    tokens,
    transactions,
    connect,
    disconnect,
    sendToken,
    swapTokens,
    getQuote,
    refreshBalance,
    refreshTransactions,
  }

  return <WorldChainContext.Provider value={value}>{children}</WorldChainContext.Provider>
}
