/**
 * HIJACK COMPLETO do sistema de módulos v0
 * Substitui bignumber.js ANTES de qualquer import
 */

import BigNumberOriginal from "bignumber.js"

// 🔥 CRIA UM MÓDULO BIGNUMBER COMPLETO
const createBigNumberModule = () => ({
  default: BigNumberOriginal,
  BigNumber: BigNumberOriginal,
  BN: BigNumberOriginal,
  __esModule: true,
})

// 🔥 HIJACK TOTAL: Substitui import() ANTES de tudo
const originalImport = globalThis.import
const moduleCache = new Map()

globalThis.import = async (specifier: string) => {
  console.log(`🔄 HIJACK IMPORT: ${specifier}`)

  // Cache hit
  if (moduleCache.has(specifier)) {
    console.log(`💾 CACHE HIT: ${specifier}`)
    return moduleCache.get(specifier)
  }

  // BigNumber direto
  if (specifier === "bignumber.js" || specifier.includes("bignumber")) {
    console.log(`🎯 HIJACK BIGNUMBER: ${specifier}`)
    const module = createBigNumberModule()
    moduleCache.set(specifier, module)
    return module
  }

  // Blob URLs - intercepta TODOS
  if (specifier.includes("blob:")) {
    console.log(`🔍 HIJACK BLOB: ${specifier.slice(-20)}...`)

    try {
      // Faz fetch do blob
      const response = await fetch(specifier)
      const text = await response.text()

      // Se contém BigNumber, substitui COMPLETAMENTE
      if (text.includes("BigNumber") || text.includes("bignumber") || text.includes("BigNumber")) {
        console.log(`🎯 BLOB É BIGNUMBER - HIJACK TOTAL!`)
        const module = createBigNumberModule()
        moduleCache.set(specifier, module)
        return module
      }

      // Se não é BigNumber, executa o código original
      console.log(`✅ BLOB NÃO É BIGNUMBER - EXECUTANDO`)
      try {
        // Cria um módulo executável
        const moduleCode = `
          const exports = {};
          const module = { exports };
          ${text}
          export default module.exports;
          export const __esModule = true;
        `
        const blob = new Blob([moduleCode], { type: "application/javascript" })
        const url = URL.createObjectURL(blob)
        const result = await originalImport(url)
        URL.revokeObjectURL(url)
        moduleCache.set(specifier, result)
        return result
      } catch (execError) {
        console.warn(`⚠️ ERRO AO EXECUTAR BLOB: ${execError}`)
        // Fallback: tenta import original
        const result = await originalImport(specifier)
        moduleCache.set(specifier, result)
        return result
      }
    } catch (fetchError) {
      console.warn(`⚠️ ERRO NO FETCH BLOB: ${fetchError}`)
      // Fallback: tenta import original
      try {
        const result = await originalImport(specifier)
        moduleCache.set(specifier, result)
        return result
      } catch (originalError) {
        console.error(`❌ IMPORT ORIGINAL FALHOU: ${originalError}`)
        throw originalError
      }
    }
  }

  // Para outros módulos, usa import original
  try {
    const result = await originalImport(specifier)
    moduleCache.set(specifier, result)
    return result
  } catch (error) {
    console.warn(`⚠️ IMPORT FALHOU: ${specifier}`, error)
    throw error
  }
}

// 🔥 HIJACK FETCH TAMBÉM
const originalFetch = globalThis.fetch
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInfo) => {
  const url = typeof input === "string" ? input : input.toString()

  if (url.includes("blob:") && url.includes("lite.vusercontent.net")) {
    console.log(`🔄 HIJACK FETCH: ${url.slice(-20)}...`)
    try {
      const response = await originalFetch(input, init)
      const originalText = await response.text()

      // Empacota o JS original acrescentando o named-export BigNumber
      const wrappedCode = `
/* ------ TPulseFi hijack wrapper (BigNumber named-export) ------ */
import BigNumberDefault from "bignumber.js";
${originalText}
/* Garante export nomeado mesmo que o módulo não o declare */
export const BigNumber = BigNumberDefault;
export { BigNumberDefault as BN };
/* -------------------------------------------------------------- */
`

      return new Response(wrappedCode, {
        status: 200,
        statusText: "OK",
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      })
    } catch (error) {
      console.warn(`⚠️ ERRO NO HIJACK FETCH: ${error}`)
      return originalFetch(input, init)
    }
  }

  return originalFetch(input, init)
}

// 🔥 PRE-POPULA O CACHE COM BIGNUMBER
moduleCache.set("bignumber.js", createBigNumberModule())
moduleCache.set("BigNumber", createBigNumberModule())

// 🔥 REGISTRA GLOBALMENTE
;(globalThis as any).BigNumber = BigNumberOriginal
;(globalThis as any).__BIGNUMBER_MODULE__ = createBigNumberModule()

if (typeof window !== "undefined") {
  ;(window as any).BigNumber = BigNumberOriginal
  ;(window as any).__BIGNUMBER_MODULE__ = createBigNumberModule()
}

console.log("🔥 HIJACK TOTAL APLICADO!")
console.log("✅ Import hijacked:", typeof globalThis.import)
console.log("✅ Fetch hijacked:", typeof globalThis.fetch)
console.log("✅ Cache pre-populado:", moduleCache.size, "módulos")
console.log("✅ BigNumber global:", typeof (globalThis as any).BigNumber)

export const BigNumber = BigNumberOriginal
export default BigNumberOriginal
