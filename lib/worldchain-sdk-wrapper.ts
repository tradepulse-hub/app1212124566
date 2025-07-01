/**
 * Wrapper para o WorldChain SDK que garante compatibilidade
 */

// 🔥 CARREGA O PATCH PRIMEIRO
import "./bignumber-global-patch"

// Aguarda um tick para garantir que o patch foi aplicado
await new Promise((resolve) => setTimeout(resolve, 0))

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDK() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🌐 Carregando WorldChain SDK com patch global...")

    // Tenta carregar o SDK
    const sdk = await import("@holdstation/worldchain-sdk")

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider) {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado com sucesso!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      // Testa se consegue criar uma instância
      try {
        const testProvider = new TokenProvider({})
        console.log("✅ TokenProvider instanciado com sucesso")
      } catch (testError) {
        console.warn("⚠️ Erro ao testar TokenProvider:", testError)
      }

      return { TokenProvider, sdkLoaded: true }
    } else {
      throw new Error("TokenProvider não encontrado no SDK")
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // Análise detalhada do erro
    if ((error as Error).message.includes("BigNumber")) {
      console.error("🔍 Erro do BigNumber - tentando patch adicional...")

      // Patch adicional de emergência
      try {
        const BigNumber = (await import("bignumber.js")).default
        ;(globalThis as any).BigNumber = BigNumber

        // Tenta novamente
        const sdk = await import("@holdstation/worldchain-sdk")
        TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

        if (TokenProvider) {
          sdkLoaded = true
          console.log("🎉 SDK carregado após patch de emergência!")
          return { TokenProvider, sdkLoaded: true }
        }
      } catch (emergencyError) {
        console.error("❌ Patch de emergência falhou:", emergencyError)
      }
    }

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Função para testar BigNumber
export function testBigNumber() {
  try {
    console.log("🧪 Testando BigNumber...")

    // Teste 1: Import default
    const BigNumberDefault = require("bignumber.js")
    console.log("✅ Default import:", typeof BigNumberDefault)

    // Teste 2: Named export
    const namedExport = (globalThis as any).__BIGNUMBER_MODULE__?.BigNumber
    console.log("✅ Named export:", typeof namedExport)

    // Teste 3: Criação de instância
    const bn = new BigNumberDefault("123.456")
    console.log("✅ Instância criada:", bn.toString())

    return true
  } catch (error) {
    console.error("❌ Teste BigNumber falhou:", error)
    return false
  }
}
