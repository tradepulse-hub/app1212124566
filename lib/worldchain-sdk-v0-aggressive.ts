/**
 * WorldChain SDK com patch AGRESSIVO para v0
 */

// 🔥 CARREGA O PATCH AGRESSIVO PRIMEIRO
import "./v0-bignumber-aggressive"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKV0Aggressive() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🚀 Carregando WorldChain SDK com PATCH AGRESSIVO v0...")

    // Aguarda para garantir que os patches foram aplicados
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Força teste do BigNumber antes de carregar SDK
    console.log("🧪 Testando BigNumber após patch agressivo...")
    try {
      const bn = new BigNumberOriginal("123.456")
      console.log("✅ BigNumber funcionando:", bn.toString())

      // Testa se o global está funcionando
      const globalBN = (globalThis as any).BigNumber
      if (globalBN) {
        const bn2 = new globalBN("789.123")
        console.log("✅ Global BigNumber funcionando:", bn2.toString())
      }
    } catch (bnError) {
      console.error("❌ BigNumber ainda não funciona:", bnError)
      return { TokenProvider: null, sdkLoaded: false }
    }

    console.log("🔄 Tentando carregar SDK após patch agressivo...")

    // Tenta carregar o SDK
    const sdk = await import("@holdstation/worldchain-sdk")

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider) {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado com PATCH AGRESSIVO!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      return { TokenProvider, sdkLoaded: true }
    } else {
      throw new Error("TokenProvider não encontrado no SDK")
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK agressivo:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // Se ainda falhar, tenta uma última vez com delay maior
    if ((error as Error).message.includes("BigNumber")) {
      console.log("🔥 Tentando ÚLTIMA CHANCE com delay maior...")

      try {
        // Aguarda mais tempo
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Re-aplica patches
        ;(globalThis as any).BigNumber = BigNumberOriginal
        ;(globalThis as any).__BIGNUMBER_MODULE__ = {
          default: BigNumberOriginal,
          BigNumber: BigNumberOriginal,
        }

        // Tenta carregar novamente
        const sdk = await import("@holdstation/worldchain-sdk")
        TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

        if (TokenProvider) {
          sdkLoaded = true
          console.log("🎉 SDK carregado na ÚLTIMA CHANCE!")
          return { TokenProvider, sdkLoaded: true }
        }
      } catch (lastChanceError) {
        console.error("❌ ÚLTIMA CHANCE falhou:", lastChanceError)
      }
    }

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Importa BigNumber para ter acesso direto
import BigNumberOriginal from "bignumber.js"

// Função para testar BigNumber agressivo
export function testBigNumberAggressive() {
  try {
    console.log("🧪 Testando BigNumber AGRESSIVO...")

    // Teste 1: Import direto
    const bn1 = new BigNumberOriginal("123.456")
    console.log("✅ Import direto:", bn1.toString())

    // Teste 2: Global
    const globalBN = (globalThis as any).BigNumber
    if (globalBN) {
      const bn2 = new globalBN("789.123")
      console.log("✅ Global BigNumber:", bn2.toString())
    }

    // Teste 3: Módulo mock
    const moduleBN = (globalThis as any).__BIGNUMBER_MODULE__?.BigNumber
    if (moduleBN) {
      const bn3 = new moduleBN("456.789")
      console.log("✅ Module BigNumber:", bn3.toString())
    }

    // Teste 4: Window
    if (typeof window !== "undefined") {
      const windowBN = (window as any).BigNumber
      if (windowBN) {
        const bn4 = new windowBN("999.111")
        console.log("✅ Window BigNumber:", bn4.toString())
      }
    }

    console.log("🎉 Todos os testes BigNumber AGRESSIVO passaram!")
    return true
  } catch (error) {
    console.error("❌ Teste BigNumber AGRESSIVO falhou:", error)
    return false
  }
}
