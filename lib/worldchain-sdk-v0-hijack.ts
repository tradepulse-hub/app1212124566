/**
 * WorldChain SDK com HIJACK TOTAL do sistema de módulos
 */

// 🔥 APLICA HIJACK ANTES DE TUDO
import "./v0-module-hijack"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKV0Hijack() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🚀 Carregando WorldChain SDK com HIJACK TOTAL...")

    // Aguarda para garantir que o hijack foi aplicado
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Força limpeza de qualquer cache existente
    console.log("🧹 Limpando caches...")
    if (typeof window !== "undefined" && (window as any).__webpack_require__) {
      // Limpa cache webpack se existir
      const webpackRequire = (window as any).__webpack_require__
      if (webpackRequire.cache) {
        Object.keys(webpackRequire.cache).forEach((key) => {
          if (key.includes("bignumber") || key.includes("BigNumber")) {
            delete webpackRequire.cache[key]
            console.log(`🗑️ Removido do cache webpack: ${key}`)
          }
        })
      }
    }

    // Testa BigNumber uma última vez
    console.log("🧪 Teste final BigNumber...")
    try {
      const bn = new BigNumberOriginal("999.888")
      console.log("✅ BigNumber final test:", bn.toString())

      // Testa global
      const globalBN = (globalThis as any).BigNumber
      if (globalBN) {
        const bn2 = new globalBN("777.666")
        console.log("✅ Global BigNumber final:", bn2.toString())
      }
    } catch (bnError) {
      console.error("❌ BigNumber final test falhou:", bnError)
      return { TokenProvider: null, sdkLoaded: false }
    }

    console.log("🔄 Tentando carregar SDK com HIJACK TOTAL...")

    // Tenta carregar o SDK
    const sdk = await import("@holdstation/worldchain-sdk")

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider) {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado com HIJACK TOTAL!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      return { TokenProvider, sdkLoaded: true }
    } else {
      throw new Error("TokenProvider não encontrado no SDK")
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK HIJACK:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // Análise do erro
    if ((error as Error).message.includes("BigNumber")) {
      console.error("🔍 AINDA É ERRO DO BIGNUMBER!")
      console.error("📋 Isso significa que o hijack não funcionou completamente")

      // Tenta uma abordagem ainda mais agressiva
      console.log("🔥 TENTATIVA FINAL - HIJACK EXTREMO...")

      try {
        // Force replace de TODOS os imports de bignumber
        const originalImportBackup = globalThis.import
        globalThis.import = async (spec: string) => {
          if (spec.includes("bignumber") || spec.includes("BigNumber") || spec.includes("blob:")) {
            console.log(`🎯 HIJACK EXTREMO: ${spec}`)
            return {
              default: BigNumberOriginal,
              BigNumber: BigNumberOriginal,
              BN: BigNumberOriginal,
              __esModule: true,
            }
          }
          return originalImportBackup(spec)
        }

        // Aguarda mais
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Tenta novamente
        const sdk = await import("@holdstation/worldchain-sdk")
        TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

        if (TokenProvider) {
          sdkLoaded = true
          console.log("🎉 SDK carregado com HIJACK EXTREMO!")
          return { TokenProvider, sdkLoaded: true }
        }
      } catch (extremeError) {
        console.error("❌ HIJACK EXTREMO falhou:", extremeError)
      }
    }

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Importa BigNumber para ter acesso direto
import BigNumberOriginal from "bignumber.js"

// Função para testar BigNumber hijack
export function testBigNumberHijack() {
  try {
    console.log("🧪 Testando BigNumber HIJACK...")

    // Teste 1: Import direto
    const bn1 = new BigNumberOriginal("123.456")
    console.log("✅ Import direto:", bn1.toString())

    // Teste 2: Global
    const globalBN = (globalThis as any).BigNumber
    if (globalBN) {
      const bn2 = new globalBN("789.123")
      console.log("✅ Global BigNumber:", bn2.toString())
    }

    // Teste 3: Cache check
    const moduleCache = (globalThis as any).__BIGNUMBER_MODULE__
    if (moduleCache) {
      console.log("✅ Module cache:", typeof moduleCache.BigNumber)
    }

    console.log("🎉 Todos os testes BigNumber HIJACK passaram!")
    return true
  } catch (error) {
    console.error("❌ Teste BigNumber HIJACK falhou:", error)
    return false
  }
}
