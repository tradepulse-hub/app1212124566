/**
 * Patch AGRESSIVO para BigNumber no v0
 * Intercepta TODOS os imports antes que aconteçam
 */

import BigNumberOriginal from "bignumber.js"

// 🔥 PATCH ULTRA-AGRESSIVO: Substitui import() globalmente
const originalImport = globalThis.import

// Intercepta TODOS os dynamic imports
globalThis.import = async (specifier: string) => {
  console.log(`🔄 INTERCEPTANDO IMPORT: ${specifier}`)

  // Se for qualquer coisa relacionada a bignumber
  if (specifier.includes("bignumber") || specifier.includes("BigNumber")) {
    console.log(`🎯 RETORNANDO BIGNUMBER PATCHADO PARA: ${specifier}`)
    return {
      default: BigNumberOriginal,
      BigNumber: BigNumberOriginal,
      BN: BigNumberOriginal,
    }
  }

  // Se for um blob URL, verifica se contém bignumber
  if (specifier.includes("blob:") && specifier.includes("lite.vusercontent.net")) {
    console.log(`🔍 VERIFICANDO BLOB URL: ${specifier.slice(-20)}...`)

    try {
      // Tenta fazer fetch do blob para ver o conteúdo
      const response = await fetch(specifier)
      const text = await response.text()

      // Se contém BigNumber, retorna nossa versão
      if (text.includes("BigNumber") || text.includes("bignumber")) {
        console.log(`🎯 BLOB CONTÉM BIGNUMBER - RETORNANDO PATCH`)
        return {
          default: BigNumberOriginal,
          BigNumber: BigNumberOriginal,
          BN: BigNumberOriginal,
        }
      }

      // Se não é BigNumber, executa o código original
      console.log(`✅ BLOB NÃO É BIGNUMBER - EXECUTANDO ORIGINAL`)
      const module = new Function("exports", "require", "module", text)
      const exports = {}
      const moduleObj = { exports }
      module(exports, () => {}, moduleObj)
      return moduleObj.exports
    } catch (error) {
      console.warn(`⚠️ ERRO AO PROCESSAR BLOB: ${error}`)
    }
  }

  // Para outros imports, usa o original
  try {
    return await originalImport(specifier)
  } catch (error) {
    console.warn(`⚠️ IMPORT ORIGINAL FALHOU: ${specifier}`, error)
    throw error
  }
}

// 🔥 PATCH FETCH PARA INTERCEPTAR BLOB URLs
const originalFetch = globalThis.fetch
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString()

  if (url.includes("blob:") && url.includes("lite.vusercontent.net")) {
    console.log(`🔄 INTERCEPTANDO FETCH BLOB: ${url.slice(-20)}...`)

    try {
      const response = await originalFetch(input, init)
      const text = await response.text()

      // Se contém BigNumber, substitui pelo nosso módulo
      if (text.includes("BigNumber") || text.includes("bignumber")) {
        console.log(`🎯 SUBSTITUINDO BLOB BIGNUMBER`)

        const patchedModule = `
// Módulo BigNumber patchado para v0
import BigNumberDefault from "bignumber.js";

// TODOS os exports possíveis
export default BigNumberDefault;
export const BigNumber = BigNumberDefault;
export { BigNumberDefault as BN };

// Para compatibilidade CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BigNumberDefault;
  module.exports.BigNumber = BigNumberDefault;
  module.exports.default = BigNumberDefault;
}

console.log("✅ BigNumber v0 patch aplicado via fetch intercept");
`

        return new Response(patchedModule, {
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
          },
        })
      }

      // Se não é BigNumber, retorna original
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    } catch (error) {
      console.warn(`⚠️ ERRO NO FETCH INTERCEPT: ${error}`)
      return originalFetch(input, init)
    }
  }

  return originalFetch(input, init)
}

// 🔥 REGISTRA BIGNUMBER GLOBALMENTE
;(globalThis as any).BigNumber = BigNumberOriginal
if (typeof window !== "undefined") {
  ;(window as any).BigNumber = BigNumberOriginal
}
// 🔥 CRIA MÓDULO MOCK GLOBAL
;(globalThis as any).__BIGNUMBER_MODULE__ = {
  default: BigNumberOriginal,
  BigNumber: BigNumberOriginal,
  BN: BigNumberOriginal,
}

// 🔥 PATCH WEBPACK SE EXISTIR
if (typeof window !== "undefined" && (window as any).__webpack_require__) {
  const originalWebpackRequire = (window as any).__webpack_require__
  ;(window as any).__webpack_require__ = (moduleId: string) => {
    if (moduleId.includes("bignumber")) {
      console.log(`🎯 WEBPACK REQUIRE INTERCEPTADO: ${moduleId}`)
      return {
        default: BigNumberOriginal,
        BigNumber: BigNumberOriginal,
        BN: BigNumberOriginal,
      }
    }
    return originalWebpackRequire(moduleId)
  }
}

console.log("🔥 PATCH AGRESSIVO BIGNUMBER V0 APLICADO!")
console.log("✅ Import interceptado:", typeof globalThis.import)
console.log("✅ Fetch interceptado:", typeof globalThis.fetch)
console.log("✅ BigNumber global:", typeof (globalThis as any).BigNumber)

export const BigNumber = BigNumberOriginal
export default BigNumberOriginal
