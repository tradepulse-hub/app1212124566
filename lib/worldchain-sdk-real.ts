/**
 * WorldChain SDK REAL - Baseado na documentação oficial da Holdstation
 */

import BigNumberOriginal from "bignumber.js"

let TokenProvider: any = null
let sdkLoaded = false
let config: any = null

export async function loadWorldChainSDKReal() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true, config }
  }

  try {
    console.log("🚀 Carregando WorldChain SDK REAL - Baseado na documentação oficial...")

    // 🔥 CARREGA O SDK OFICIAL
    console.log("📦 Importando @holdstation/worldchain-sdk...")
    const sdk = await import("@holdstation/worldchain-sdk")

    console.log("✅ SDK importado:", Object.keys(sdk))

    // 🔥 CARREGA ETHERS V6 ADAPTER
    console.log("📦 Importando @holdstation/worldchain-ethers-v6...")
    const ethersAdapter = await import("@holdstation/worldchain-ethers-v6")

    console.log("✅ Ethers adapter importado:", Object.keys(ethersAdapter))

    // 🔥 CARREGA ETHERS
    console.log("📦 Importando ethers...")
    const ethers = await import("ethers")

    console.log("✅ Ethers importado:", ethers.version || "v6+")

    // 🔥 CONFIGURA PROVIDER CONFORME DOCUMENTAÇÃO
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

    // 🔥 CRIA CLIENT E MULTICALL3 CONFORME DOCUMENTAÇÃO
    console.log("🔧 Configurando Client e Multicall3...")
    const client = new ethersAdapter.Client(provider)
    const multicall3 = new ethersAdapter.Multicall3(provider)

    // 🔥 CONFIGURA O SDK GLOBALMENTE
    console.log("⚙️ Configurando SDK globalmente...")
    sdk.config.client = client
    sdk.config.multicall3 = multicall3

    // 🔥 CRIA TOKENPROVIDER CONFORME DOCUMENTAÇÃO
    console.log("🎯 Criando TokenProvider...")
    const tokenProvider = new sdk.TokenProvider({
      client,
      multicall3,
    })

    console.log("✅ TokenProvider criado com sucesso!")

    // 🔥 TESTA SE ESTÁ FUNCIONANDO
    console.log("🧪 Testando TokenProvider...")

    // Testa método details com tokens conhecidos do WorldChain
    try {
      console.log("📞 Testando tokenProvider.details()...")
      const testTokens = await tokenProvider.details(
        "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDCe
        "0x4200000000000000000000000000000000000006", // WETH
      )
      console.log("✅ Teste details funcionou:", testTokens)
    } catch (testError) {
      console.warn("⚠️ Teste details falhou:", testError)
    }

    TokenProvider = sdk.TokenProvider
    config = sdk.config
    sdkLoaded = true

    console.log("🎉 WorldChain SDK REAL carregado com sucesso!")
    console.log("📋 Configuração:")
    console.log("├─ Provider: ✅")
    console.log("├─ Client: ✅")
    console.log("├─ Multicall3: ✅")
    console.log("├─ TokenProvider: ✅")
    console.log("└─ Config: ✅")

    return {
      TokenProvider: sdk.TokenProvider,
      sdkLoaded: true,
      config: sdk.config,
      client,
      multicall3,
      provider,
      tokenProvider,
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK REAL:", error)
    console.error("📋 Stack:", (error as Error).stack)

    return { TokenProvider: null, sdkLoaded: false, config: null }
  }
}

// Função para criar TokenProvider com configuração específica
export async function createTokenProvider(walletAddress?: string) {
  const { TokenProvider, config, client, multicall3 } = await loadWorldChainSDKReal()

  if (!TokenProvider || !config) {
    throw new Error("SDK não carregado")
  }

  // Cria instância conforme documentação
  const tokenProvider = new TokenProvider({
    client,
    multicall3,
  })

  return tokenProvider
}

// Função para testar BigNumber
export function testBigNumberReal() {
  try {
    console.log("🧪 Testando BigNumber REAL...")

    const bn = new BigNumberOriginal("123.456")
    console.log("✅ BigNumber funcionando:", bn.toString())

    return true
  } catch (error) {
    console.error("❌ BigNumber falhou:", error)
    return false
  }
}
