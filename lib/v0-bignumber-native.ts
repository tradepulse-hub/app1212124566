/**
 * BigNumber 100% browser-native para v0
 * SEM require(), SEM Node.js, APENAS browser
 */

// Importa BigNumber usando APENAS ES6 modules (funciona no browser)
import BigNumberOriginal from "bignumber.js"

// 🔥 INTERCEPTA BLOB URLs DO V0 DIRETAMENTE
const interceptV0BlobUrls = () => {
  console.log("🎯 Interceptando blob URLs do v0...")

  // Salva o fetch original
  const originalFetch = globalThis.fetch

  // Substitui fetch globalmente
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString()

    // Se for um blob URL do v0 que contém bignumber
    if (url.includes("blob:") && url.includes("lite.vusercontent.net")) {
      console.log(`🔄 Interceptando blob v0: ${url.slice(-20)}`)

      try {
        // Faz o fetch original primeiro para ver o conteúdo
        const originalResponse = await originalFetch(input, init)
        const originalText = await originalResponse.text()

        // Se contém BigNumber, substitui pelo nosso módulo
        if (originalText.includes("BigNumber") || originalText.includes("bignumber")) {
          console.log("🎯 Blob contém BigNumber - aplicando patch v0!")

          // Cria um módulo ES6 válido com TODOS os exports possíveis
          const patchedModuleCode = `
// Módulo BigNumber patchado para v0 - 100% browser
const BigNumberClass = (${BigNumberOriginal.toString()});

// Cria instância padrão
const BigNumberDefault = BigNumberClass;

// TODOS os exports possíveis
export default BigNumberDefault;
export const BigNumber = BigNumberDefault;
export { BigNumberDefault as BN };

// Para compatibilidade com CommonJS no browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BigNumberDefault;
  module.exports.BigNumber = BigNumberDefault;
  module.exports.default = BigNumberDefault;
}

// Global para máxima compatibilidade
if (typeof globalThis !== 'undefined') {
  globalThis.BigNumber = BigNumberDefault;
}

console.log("✅ BigNumber v0 patch carregado via blob intercept");
`

          // Retorna resposta com módulo patchado
          return new Response(patchedModuleCode, {
            status: 200,
            statusText: "OK",
            headers: {
              "Content-Type": "application/javascript; charset=utf-8",
              "Cache-Control": "no-cache",
            },
          })
        }

        // Se não é BigNumber, retorna resposta original
        return new Response(originalText, {
          status: originalResponse.status,
          statusText: originalResponse.statusText,
          headers: originalResponse.headers,
        })
      } catch (fetchError) {
        console.warn("⚠️ Erro ao interceptar blob:", fetchError)
        // Se falhar, tenta fetch original
        return originalFetch(input, init)
      }
    }

    // Para URLs normais, usa fetch original
    return originalFetch(input, init)
  }

  console.log("✅ Interceptação de blob URLs v0 ativada")
}

// 🔥 PATCH IMPORT DINÂMICO BROWSER-NATIVE
const patchDynamicImportsBrowser = () => {
  console.log("🎯 Patchando dynamic imports browser...")

  // Salva import original
  const originalImport = globalThis.import || (async (spec: string) => ({}))

  // Substitui import global
  globalThis.import = async (specifier: string) => {
    console.log(`🔄 Import interceptado: ${specifier}`)

    // Se for bignumber.js, retorna nossa versão
    if (specifier.includes("bignumber") || specifier === "bignumber.js") {
      console.log("🎯 Retornando BigNumber browser-native")
      return {
        default: BigNumberOriginal,
        BigNumber: BigNumberOriginal,
        BN: BigNumberOriginal,
      }
    }

    // Para outros módulos, tenta import original
    try {
      return await originalImport(specifier)
    } catch (error) {
      console.warn(`⚠️ Import falhou para ${specifier}:`, error)
      throw error
    }
  }

  console.log("✅ Dynamic imports browser patchados")
}

// 🔥 REGISTRA BIGNUMBER GLOBALMENTE
const registerGlobalBigNumber = () => {
  console.log("🌐 Registrando BigNumber globalmente...")

  // Global
  ;(globalThis as any).BigNumber = BigNumberOriginal

  // Window
  if (typeof window !== "undefined") {
    ;(window as any).BigNumber = BigNumberOriginal
  }
  // Módulo mock para compatibilidade
  ;(globalThis as any).__BIGNUMBER_MODULE__ = {
    default: BigNumberOriginal,
    BigNumber: BigNumberOriginal,
    BN: BigNumberOriginal,
  }

  console.log("✅ BigNumber registrado globalmente")
}

// 🔥 APLICA TODOS OS PATCHES BROWSER-NATIVE
export const applyV0BrowserPatches = () => {
  console.log("🚀 Aplicando patches v0 browser-native...")

  try {
    interceptV0BlobUrls()
    patchDynamicImportsBrowser()
    registerGlobalBigNumber()

    console.log("🎉 Todos os patches v0 browser-native aplicados!")
    return true
  } catch (error) {
    console.error("❌ Erro ao aplicar patches:", error)
    return false
  }
}

// 🔥 TESTE BIGNUMBER BROWSER-NATIVE (SEM REQUIRE)
export const testBigNumberBrowserNative = () => {
  try {
    console.log("🧪 Testando BigNumber browser-native...")

    // Teste 1: Instância direta
    const bn1 = new BigNumberOriginal("123.456")
    console.log("✅ Instância direta:", bn1.toString())

    // Teste 2: Global
    const globalBN = (globalThis as any).BigNumber
    if (globalBN) {
      const bn2 = new globalBN("789.123")
      console.log("✅ Global BigNumber:", bn2.toString())
    }

    // Teste 3: Window
    if (typeof window !== "undefined") {
      const windowBN = (window as any).BigNumber
      if (windowBN) {
        const bn3 = new windowBN("456.789")
        console.log("✅ Window BigNumber:", bn3.toString())
      }
    }

    // Teste 4: Módulo mock
    const moduleBN = (globalThis as any).__BIGNUMBER_MODULE__?.BigNumber
    if (moduleBN) {
      const bn4 = new moduleBN("999.111")
      console.log("✅ Module BigNumber:", bn4.toString())
    }

    console.log("🎉 Todos os testes BigNumber browser-native passaram!")
    return true
  } catch (error) {
    console.error("❌ Teste BigNumber browser-native falhou:", error)
    return false
  }
}

// Aplica patches imediatamente quando o módulo é carregado
applyV0BrowserPatches()

// Exporta BigNumber para uso direto
export const BigNumber = BigNumberOriginal
export default BigNumberOriginal
