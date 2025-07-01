/**
 * WorldChain SDK 100% browser-native para v0
 */

// 🔥 CARREGA PATCHES BROWSER-NATIVE PRIMEIRO
import { applyV0BrowserPatches, testBigNumberBrowserNative } from "./v0-bignumber-native"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKV0Native() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🌐 Carregando WorldChain SDK v0 browser-native...")

    // Aplica patches antes de qualquer coisa
    const patchSuccess = applyV0BrowserPatches()
    if (!patchSuccess) {
      console.warn("⚠️ Patches não aplicados completamente")
    }

    // Testa BigNumber browser-native
    const bigNumberOK = testBigNumberBrowserNative()
    console.log("🧮 BigNumber browser-native:", bigNumberOK ? "✅ OK" : "❌ FALHOU")

    // Aguarda para garantir que patches foram aplicados
    await new Promise((resolve) => setTimeout(resolve, 300))

    console.log("🔄 Tentando carregar SDK após patches browser-native...")

    // Tenta carregar o SDK
    const sdk = await import("@holdstation/worldchain-sdk")

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider) {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado com sucesso no v0 browser-native!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      return { TokenProvider, sdkLoaded: true }
    } else {
      throw new Error("TokenProvider não encontrado no SDK")
    }
  } catch (error) {
    console.error("❌ Erro ao carregar WorldChain SDK v0 native:", error)
    console.error("📋 Stack:", (error as Error).stack)

    // Se ainda falhar com BigNumber, tenta patch de emergência
    if ((error as Error).message.includes("BigNumber")) {
      console.log("🔥 Aplicando patch de emergência browser-native...")

      try {
        // Re-aplica patches com mais força
        applyV0BrowserPatches()

        // Aguarda mais tempo
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Tenta carregar novamente
        const sdk = await import("@holdstation/worldchain-sdk")
        TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

        if (TokenProvider) {
          sdkLoaded = true
          console.log("🎉 SDK carregado após patch de emergência browser-native!")
          return { TokenProvider, sdkLoaded: true }
        }
      } catch (emergencyError) {
        console.error("❌ Patch de emergência browser-native falhou:", emergencyError)
      }
    }

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Exporta função de teste
export { testBigNumberBrowserNative }
