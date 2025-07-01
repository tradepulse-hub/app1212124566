/**
 * WorldChain SDK otimizado para v0
 */

// 🔥 CARREGA OS PATCHES V0 PRIMEIRO
import "./v0-module-patch"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKV0() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🌐 Carregando WorldChain SDK otimizado para v0...")

    // Aguarda para garantir que os patches foram aplicados
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Força re-aplicação dos patches antes de carregar o SDK
    const { applyV0Patches } = await import("./v0-module-patch")
    applyV0Patches()

    console.log("🔄 Tentando carregar SDK após patches v0...")

    // Tenta carregar o SDK
    const sdk = await import("@holdstation/worldchain-sdk")

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider) {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado com sucesso no v0!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      return { TokenProvider, sdkLoaded: true }
    } else {
      throw new Error("TokenProvider não encontrado no SDK")
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK v0:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // Se ainda falhar, tenta uma abordagem mais agressiva
    if ((error as Error).message.includes("BigNumber")) {
      console.log("🔥 Tentando patch agressivo...")

      try {
        // Patch agressivo: substitui todos os imports de bignumber.js
        const originalImport = globalThis.import
        globalThis.import = async (specifier: string) => {
          if (specifier.includes("bignumber") || specifier.includes("BigNumber")) {
            console.log("🎯 Patch agressivo ativado para:", specifier)
            const BigNumberOriginal = (await import("bignumber.js")).default
            return {
              default: BigNumberOriginal,
              BigNumber: BigNumberOriginal,
              BN: BigNumberOriginal,
            }
          }
          return originalImport(specifier)
        }

        // Tenta carregar novamente
        const sdk = await import("@holdstation/worldchain-sdk")
        TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

        if (TokenProvider) {
          sdkLoaded = true
          console.log("🎉 SDK carregado após patch agressivo!")
          return { TokenProvider, sdkLoaded: true }
        }
      } catch (aggressiveError) {
        console.error("❌ Patch agressivo falhou:", aggressiveError)
      }
    }

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Função para testar BigNumber no v0
export function testBigNumberV0() {
  try {
    console.log("🧪 Testando BigNumber no v0...")

    // Teste 1: Import direto
    const BigNumberOriginal = require("bignumber.js")
    console.log("✅ BigNumber require:", typeof BigNumberOriginal)

    // Teste 2: Global
    const globalBN = (globalThis as any).BigNumber
    console.log("✅ Global BigNumber:", typeof globalBN)

    // Teste 3: Window
    const windowBN = typeof window !== "undefined" ? (window as any).BigNumber : null
    console.log("✅ Window BigNumber:", typeof windowBN)

    // Teste 4: Criação de instância
    const bn = new BigNumberOriginal("123.456")
    console.log("✅ Instância criada:", bn.toString())

    return true
  } catch (error) {
    console.error("❌ Teste BigNumber v0 falhou:", error)

    // Fallback: tenta sem require
    try {
      const BigNumberOriginal = (globalThis as any).BigNumber
      if (BigNumberOriginal) {
        const bn = new BigNumberOriginal("123.456")
        console.log("✅ Fallback funcionou:", bn.toString())
        return true
      }
    } catch (fallbackError) {
      console.error("❌ Fallback falhou:", fallbackError)
    }

    return false
  }
}
