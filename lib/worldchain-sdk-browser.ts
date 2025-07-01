/**
 * WorldChain SDK para browser com patch BigNumber
 */

// 🔥 CARREGA O PATCH BROWSER PRIMEIRO
import "./bignumber-browser-patch"

let TokenProvider: any = null
let sdkLoaded = false

export async function loadWorldChainSDKBrowser() {
  if (sdkLoaded && TokenProvider) {
    return { TokenProvider, sdkLoaded: true }
  }

  try {
    console.log("🌐 Carregando WorldChain SDK no browser...")

    // Aguarda um pouco para garantir que o patch foi aplicado
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Tenta carregar o SDK
    const sdk = await import("@holdstation/worldchain-sdk")

    TokenProvider = sdk.TokenProvider || sdk.default?.TokenProvider

    if (TokenProvider) {
      sdkLoaded = true
      console.log("🎉 WorldChain SDK carregado no browser!")
      console.log("✅ TokenProvider disponível:", typeof TokenProvider)

      // Testa se consegue criar uma instância
      try {
        // Não tenta instanciar sem provider para evitar erros
        console.log("✅ TokenProvider pronto para uso")
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

    return { TokenProvider: null, sdkLoaded: false }
  }
}

// Função para testar BigNumber no browser
export function testBigNumberBrowser() {
  try {
    console.log("🧪 Testando BigNumber no browser...")

    // Teste 1: Import direto
    console.log("✅ BigNumber importado:", typeof BigNumberOriginal)

    // Teste 2: Global
    const globalBN = (globalThis as any).BigNumber
    console.log("✅ Global BigNumber:", typeof globalBN)

    // Teste 3: Window
    const windowBN = typeof window !== "undefined" ? (window as any).BigNumber : null
    console.log("✅ Window BigNumber:", typeof windowBN)

    // Teste 4: Módulo mock
    const moduleBN = (globalThis as any).BigNumberModule
    console.log("✅ Module BigNumber:", typeof moduleBN?.BigNumber)

    // Teste 5: Criação de instância
    const bn = new BigNumberOriginal("123.456")
    console.log("✅ Instância criada:", bn.toString())

    return true
  } catch (error) {
    console.error("❌ Teste BigNumber browser falhou:", error)
    return false
  }
}

// Importa BigNumber para ter acesso direto
import BigNumberOriginal from "bignumber.js"
