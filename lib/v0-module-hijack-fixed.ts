/**
 * HIJACK COMPLETO CORRIGIDO - Resolve erro "K is not defined"
 */

import BigNumberOriginal from "bignumber.js"

// 🔥 CRIA UM MÓDULO BIGNUMBER COMPLETO E SEGURO
const createBigNumberModule = () => {
  // Garante que BigNumber está funcionando corretamente
  try {
    const testBN = new BigNumberOriginal("123.456")
    console.log("✅ BigNumber test no createModule:", testBN.toString())
  } catch (error) {
    console.error("❌ BigNumber falhou no createModule:", error)
  }

  return {
    default: BigNumberOriginal,
    BigNumber: BigNumberOriginal,
    BN: BigNumberOriginal,
    __esModule: true,
  }
}

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
      if (text.includes("BigNumber") || text.includes("bignumber")) {
        console.log(`🎯 BLOB É BIGNUMBER - HIJACK TOTAL!`)
        const module = createBigNumberModule()
        moduleCache.set(specifier, module)
        return module
      }

      // Se não é BigNumber, executa o código original MAS com proteção
      console.log(`✅ BLOB NÃO É BIGNUMBER - EXECUTANDO COM PROTEÇÃO`)
      try {
        // Executa o código original com proteções
        const wrappedCode = `
          // Proteção contra erros de referência
          const BigNumber = (${BigNumberOriginal.toString()});
          
          // Código original
          ${text}
          
          // Garante exports
          if (typeof module !== 'undefined' && module.exports) {
            if (typeof module.exports === 'function') {
              export default module.exports;
            } else {
              export default module.exports.default || module.exports;
            }
          }
        `

        const blob = new Blob([wrappedCode], { type: "application/javascript" })
        const url = URL.createObjectURL(blob)
        const result = await originalImport(url)
        URL.revokeObjectURL(url)
        moduleCache.set(specifier, result)
        return result
      } catch (execError) {
        console.warn(`⚠️ ERRO AO EXECUTAR BLOB PROTEGIDO: ${execError}`)
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

// 🔥 HIJACK FETCH MELHORADO
const originalFetch = globalThis.fetch
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input.toString()

  if (url.includes("blob:") && url.includes("lite.vusercontent.net")) {
    console.log(`🔄 HIJACK FETCH: ${url.slice(-20)}...`)
    try {
      const response = await originalFetch(input, init)
      const originalText = await response.text()

      // Se contém BigNumber, substitui por módulo seguro
      if (originalText.includes("BigNumber") || originalText.includes("bignumber")) {
        console.log(`🎯 BLOB CONTÉM BIGNUMBER - SUBSTITUINDO POR MÓDULO SEGURO`)

        const safeModule = `
// Módulo BigNumber seguro para v0
import BigNumberDefault from "bignumber.js";

// Testa se BigNumber funciona
try {
  const testBN = new BigNumberDefault("123.456");
  console.log("✅ BigNumber seguro funcionando:", testBN.toString());
} catch (error) {
  console.error("❌ BigNumber seguro falhou:", error);
}

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

console.log("✅ BigNumber v0 seguro carregado via fetch intercept");
`

        return new Response(safeModule, {
          status: 200,
          statusText: "OK",
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        })
      }

      // Se não é BigNumber, retorna original
      return new Response(originalText, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    } catch (error) {
      console.warn(`⚠️ ERRO NO HIJACK FETCH: ${error}`)
      return originalFetch(input, init)
    }
  }

  return originalFetch(input, init)
}

// 🔥 PRE-POPULA O CACHE COM BIGNUMBER SEGURO
moduleCache.set("bignumber.js", createBigNumberModule())
moduleCache.set("BigNumber", createBigNumberModule())

// 🔥 REGISTRA GLOBALMENTE COM PROTEÇÃO
try {
  ;(globalThis as any).BigNumber = BigNumberOriginal
  ;(globalThis as any).__BIGNUMBER_MODULE__ = createBigNumberModule()

  if (typeof window !== "undefined") {
    ;(window as any).BigNumber = BigNumberOriginal
    ;(window as any).__BIGNUMBER_MODULE__ = createBigNumberModule()
  }

  console.log("✅ BigNumber registrado globalmente com proteção")
} catch (globalError) {
  console.error("❌ Erro ao registrar BigNumber globalmente:", globalError)
}

console.log("🔥 HIJACK TOTAL CORRIGIDO APLICADO!")
console.log("✅ Import hijacked:", typeof globalThis.import)
console.log("✅ Fetch hijacked:", typeof globalThis.fetch)
console.log("✅ Cache pre-populado:", moduleCache.size, "módulos")
console.log("✅ BigNumber global:", typeof (globalThis as any).BigNumber)

export const BigNumber = BigNumberOriginal
export default BigNumberOriginal
