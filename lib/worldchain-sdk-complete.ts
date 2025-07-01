/**
 * WorldChain SDK COMPLETO - Implementação baseada na documentação oficial da Holdstation
 * SEM SIMULAÇÕES - Apenas funcionalidades reais
 */

import BigNumberOriginal from "bignumber.js"

let TokenProvider: any = null
let SwapHelper: any = null
let Sender: any = null
let Manager: any = null
let HoldSo: any = null
let ZeroX: any = null
let Quoter: any = null
let sdkLoaded = false
let config: any = null

// Endereços conhecidos do WorldChain
export const WORLDCHAIN_ADDRESSES = {
  MULTICALL3: "0xcA11bde05977b3631167028862bE2a173976CA11",
  WETH: "0x4200000000000000000000000000000000000006",
  USDC: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
  USDT: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  DAI: "0xEd10C200aFc35AF91A45E8BE53cd5a299F93F32F",
}

// Tokens populares do WorldChain
export const POPULAR_TOKENS = [
  {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  {
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
    symbol: "USDCe",
    name: "USD Coin (Ethereum)",
    decimals: 6,
  },
  {
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
  },
  {
    address: "0xEd10C200aFc35AF91A45E8BE53cd5a299F93F32F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
  },
]

export async function loadWorldChainSDKComplete() {
  if (sdkLoaded && TokenProvider && SwapHelper && Sender && Manager) {
    return {
      TokenProvider,
      SwapHelper,
      Sender,
      Manager,
      HoldSo,
      ZeroX,
      Quoter,
      sdkLoaded: true,
      config,
    }
  }

  try {
    console.log("🚀 Carregando WorldChain SDK COMPLETO - Holdstation oficial...")

    // Carrega dependências reais - SEM FALLBACK
    console.log("📦 Importando @holdstation/worldchain-sdk...")
    const sdk = await import("@holdstation/worldchain-sdk")
    console.log("✅ SDK importado:", Object.keys(sdk))

    console.log("📦 Importando @holdstation/worldchain-ethers-v6...")
    const ethersAdapter = await import("@holdstation/worldchain-ethers-v6")
    console.log("✅ Ethers adapter importado:", Object.keys(ethersAdapter))

    console.log("📦 Importando ethers...")
    const ethers = await import("ethers")
    console.log("✅ Ethers importado:", ethers.version || "v6+")

    // Configura Partner Code para TPulseFi
    console.log("🏷️ Configurando Partner Code TPulseFi...")
    if (sdk.setPartnerCode) {
      sdk.setPartnerCode("TPULSEFI")
      console.log("✅ Partner Code TPulseFi configurado!")
    }

    // Configura Provider conforme documentação
    console.log("🌐 Configurando provider WorldChain...")
    const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"

    const provider = new ethers.JsonRpcProvider(
      RPC_URL,
      {
        chainId: 480,
        name: "worldchain",
      },
      {
        staticNetwork: true,
      },
    )

    // Testa conexão
    const network = await provider.getNetwork()
    console.log("✅ Conectado ao WorldChain:", {
      chainId: Number(network.chainId),
      name: network.name,
    })

    // Cria Client e Multicall3 conforme documentação
    console.log("🔧 Configurando Client e Multicall3...")
    const client = new ethersAdapter.Client(provider)
    const multicall3 = new ethersAdapter.Multicall3(provider)
    const quoter = new ethersAdapter.Quoter(client)

    // Configura o SDK globalmente
    console.log("⚙️ Configurando SDK globalmente...")
    sdk.config.client = client
    sdk.config.multicall3 = multicall3

    // Cria TokenProvider conforme documentação
    console.log("🎯 Criando TokenProvider...")
    const tokenProvider = new sdk.TokenProvider({
      client,
      multicall3,
    })

    // Cria SwapHelper conforme documentação
    console.log("🔄 Configurando SwapHelper...")
    const swapHelper = new sdk.SwapHelper(client, {
      tokenStorage: sdk.inmemoryTokenStorage,
    })

    // Cria Sender conforme documentação
    console.log("📤 Configurando Sender...")
    const sender = new sdk.Sender(provider)

    // Cria Manager para histórico conforme documentação
    console.log("📋 Configurando Manager para histórico...")
    const manager = new sdk.Manager(provider, 480) // WorldChain chainId

    // Cria routers de swap
    console.log("🌐 Configurando routers de swap...")
    const zeroX = new sdk.ZeroX(tokenProvider, sdk.inmemoryTokenStorage)
    const holdSo = new sdk.HoldSo(tokenProvider, sdk.inmemoryTokenStorage)

    // Carrega routers no SwapHelper
    console.log("📡 Carregando routers no SwapHelper...")
    swapHelper.load(zeroX)
    swapHelper.load(holdSo)

    console.log("✅ SwapHelper configurado com routers!")

    // Testa funcionalidades básicas
    console.log("🧪 Testando SDK completo...")

    // Testa TokenProvider
    console.log("📞 Testando tokenProvider.details()...")
    const testTokens = await tokenProvider.details(WORLDCHAIN_ADDRESSES.USDC, WORLDCHAIN_ADDRESSES.WETH)
    console.log("✅ Teste TokenProvider funcionou:", testTokens)

    // Salva referências globais
    TokenProvider = sdk.TokenProvider
    SwapHelper = sdk.SwapHelper
    Sender = sdk.Sender
    Manager = sdk.Manager
    HoldSo = sdk.HoldSo
    ZeroX = sdk.ZeroX
    Quoter = ethersAdapter.Quoter
    config = sdk.config
    sdkLoaded = true

    console.log("🎉 WorldChain SDK COMPLETO carregado com sucesso!")

    return {
      TokenProvider: sdk.TokenProvider,
      SwapHelper: sdk.SwapHelper,
      Sender: sdk.Sender,
      Manager: sdk.Manager,
      HoldSo: sdk.HoldSo,
      ZeroX: sdk.ZeroX,
      Quoter: ethersAdapter.Quoter,
      sdkLoaded: true,
      config: sdk.config,
      client,
      multicall3,
      provider,
      tokenProvider,
      swapHelper,
      sender,
      manager,
      quoter,
      zeroX,
      holdSo,
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // NÃO USA FALLBACK - Retorna erro real
    return {
      TokenProvider: null,
      SwapHelper: null,
      Sender: null,
      Manager: null,
      HoldSo: null,
      ZeroX: null,
      Quoter: null,
      sdkLoaded: false,
      config: null,
      error: (error as Error).message,
    }
  }
}

// Função para criar TokenProvider com configuração específica
export async function createTokenProviderComplete(walletAddress?: string) {
  const result = await loadWorldChainSDKComplete()

  if (!result.TokenProvider || !result.sdkLoaded) {
    throw new Error(`SDK não carregado: ${result.error || "Dependências não disponíveis"}`)
  }

  return new result.TokenProvider({
    client: result.client,
    multicall3: result.multicall3,
  })
}

// Função para criar SwapHelper com configuração específica
export async function createSwapHelperComplete() {
  const result = await loadWorldChainSDKComplete()

  if (!result.SwapHelper || !result.sdkLoaded) {
    throw new Error(`SDK não carregado: ${result.error || "Dependências não disponíveis"}`)
  }

  return result.swapHelper
}

// Função para criar Sender com configuração específica
export async function createSenderComplete() {
  const result = await loadWorldChainSDKComplete()

  if (!result.Sender || !result.sdkLoaded) {
    throw new Error(`SDK não carregado: ${result.error || "Dependências não disponíveis"}`)
  }

  return result.sender
}

// Função para criar Manager para histórico
export async function createManagerComplete() {
  const result = await loadWorldChainSDKComplete()

  if (!result.Manager || !result.sdkLoaded) {
    throw new Error(`SDK não carregado: ${result.error || "Dependências não disponíveis"}`)
  }

  return result.manager
}

// Função para criar Quoter
export async function createQuoterComplete() {
  const result = await loadWorldChainSDKComplete()

  if (!result.Quoter || !result.sdkLoaded) {
    throw new Error(`SDK não carregado: ${result.error || "Dependências não disponíveis"}`)
  }

  return result.quoter
}

// Função para executar swap
export async function executeSwap(params: {
  tokenIn: string
  tokenOut: string
  amountIn: string
  slippage: string
  fee: string
  preferRouters?: string[]
  walletAddress: string
}) {
  try {
    console.log("🔄 Executando swap via Holdstation SDK...")

    const swapHelper = await createSwapHelperComplete()

    // 1. Obter quote
    console.log("📞 Obtendo quote...")
    const quoteParams = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      slippage: params.slippage,
      fee: params.fee,
    }

    const quote = await swapHelper.quote(quoteParams)
    console.log("✅ Quote obtido:", quote)

    // 2. Executar swap
    console.log("🚀 Executando swap...")
    const swapParams = {
      tokenIn: params.tokenIn,
      tokenOut: params.tokenOut,
      amountIn: params.amountIn,
      tx: {
        data: quote.data,
        to: quote.to,
        value: quote.value,
      },
      feeAmountOut: quote.addons?.feeAmountOut,
      fee: params.fee,
      feeReceiver: "0x0000000000000000000000000000000000000000",
    }

    const result = await swapHelper.swap(swapParams)
    console.log("✅ Swap executado:", result)

    return {
      success: true,
      quote,
      result,
      txHash: result.hash,
    }
  } catch (error) {
    console.error("❌ Erro ao executar swap:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Função para enviar tokens
export async function sendToken(params: {
  to: string
  amount: number
  token?: string
}) {
  try {
    console.log("📤 Enviando token via Holdstation SDK...")

    const sender = await createSenderComplete()

    const sendParams = {
      to: params.to,
      amount: params.amount,
      ...(params.token && { token: params.token }),
    }

    console.log("📞 Chamando sender.send()...")
    const result = await sender.send(sendParams)
    console.log("✅ Token enviado:", result)

    return {
      success: true,
      result,
      txHash: result.hash,
    }
  } catch (error) {
    console.error("❌ Erro ao enviar token:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Função para obter quote simples
export async function getSimpleQuote(tokenIn: string, tokenOut: string) {
  try {
    console.log("📊 Obtendo quote simples...")

    const quoter = await createQuoterComplete()

    const quote = await quoter.simple(tokenIn, tokenOut)
    console.log("✅ Quote simples obtido:", quote)

    return {
      success: true,
      quote,
      best: quote.best,
    }
  } catch (error) {
    console.error("❌ Erro ao obter quote simples:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Função para obter quote inteligente
export async function getSmartQuote(
  tokenIn: string,
  options: {
    slippage: number
    deadline: number
  },
) {
  try {
    console.log("🧠 Obtendo quote inteligente...")

    const quoter = await createQuoterComplete()

    const quote = await quoter.smart(tokenIn, options)
    console.log("✅ Quote inteligente obtido:", quote)

    return {
      success: true,
      quote: quote.quote,
    }
  } catch (error) {
    console.error("❌ Erro ao obter quote inteligente:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Função para monitorar histórico de transações
export async function watchTransactionHistory(walletAddress: string, callback: () => void) {
  try {
    console.log("👀 Iniciando monitoramento de histórico...")

    const manager = await createManagerComplete()

    const watcher = await manager.watch(walletAddress, callback)
    console.log("✅ Watcher criado para:", walletAddress)

    return {
      success: true,
      watcher,
      start: watcher.start,
      stop: watcher.stop,
    }
  } catch (error) {
    console.error("❌ Erro ao criar watcher:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Função para buscar histórico de transações
export async function getTransactionHistory(offset = 0, limit = 100) {
  try {
    console.log("📋 Buscando histórico de transações...")

    const result = await loadWorldChainSDKComplete()

    if (!result.manager) {
      throw new Error("Manager não disponível")
    }

    const transactions = (await result.manager.storage?.tx?.find(offset, limit)) || []
    console.log("✅ Histórico obtido:", transactions.length, "transações")

    return {
      success: true,
      transactions,
      count: transactions.length,
    }
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error)
    return {
      success: false,
      error: (error as Error).message,
      transactions: [],
    }
  }
}

// Função para testar BigNumber
export function testBigNumberComplete() {
  try {
    console.log("🧪 Testando BigNumber...")

    const bn = new BigNumberOriginal("123.456")
    console.log("✅ BigNumber funcionando:", bn.toString())

    return true
  } catch (error) {
    console.error("❌ BigNumber falhou:", error)
    return false
  }
}

// Função para obter tokens populares
export function getPopularTokens() {
  return POPULAR_TOKENS
}

// Função para obter endereços do WorldChain
export function getWorldChainAddresses() {
  return WORLDCHAIN_ADDRESSES
}
