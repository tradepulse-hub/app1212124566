/**
 * Patch específico para o sistema de módulos do v0
 * Intercepta os blob URLs e substitui o módulo bignumber.js
 */

import BigNumberOriginal from "bignumber.js"

// 🔥 PATCH PARA O SISTEMA DE MÓDULOS DO V0
const patchV0ModuleSystem = () => {
  try {
    console.log("🎯 Aplicando patch para sistema de módulos v0...")

    // Intercepta fetch para blob URLs
    const originalFetch = globalThis.fetch
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString()

      // Se for um blob URL que contém bignumber.js
      if (url.includes("blob:") && url.includes("lite.vusercontent.net")) {
        console.log(`🔄 Interceptando blob URL: ${url.slice(0, 50)}...`)

        try {
          // Tenta fazer o fetch original primeiro
          const response = await originalFetch(input, init)
          const text = await response.text()

          // Se o conteúdo parece ser bignumber.js, substitui
          if (text.includes("BigNumber") || text.includes("bignumber")) {
            console.log("🎯 Detectado módulo BigNumber, aplicando patch...")

            // Cria um módulo ES6 válido com named export
            const patchedModule = `
// Módulo BigNumber patchado para v0
import BigNumberDefault from "bignumber.js";

// Named export que o WorldChain SDK precisa
export const BigNumber = BigNumberDefault;

// Default export
export default BigNumberDefault;

// Compatibilidade adicional
export { BigNumberDefault as BN };

console.log("✅ Módulo BigNumber patchado carregado via v0");
`

            // Retorna uma resposta com o módulo patchado
            return new Response(patchedModule, {
              status: 200,
              statusText: "OK",
              headers: {
                "Content-Type": "application/javascript",
              },
            })
          }
        } catch (fetchError) {
          console.warn("⚠️ Erro ao interceptar blob:", fetchError)
        }
      }

      // Para outros URLs, usa fetch original
      return originalFetch(input, init)
    }

    console.log("✅ Patch v0 fetch aplicado")
  } catch (error) {
    console.warn("⚠️ Erro ao aplicar patch v0:", error)
  }
}

// 🔥 PATCH PARA DYNAMIC IMPORTS DO V0
const patchV0DynamicImports = () => {
  try {
    console.log("🎯 Aplicando patch para dynamic imports v0...")

    // Intercepta import() global
    const originalImport = globalThis.import
    globalThis.import = async (specifier: string) => {
      console.log(`🔄 Dynamic import interceptado: ${specifier}`)

      // Se for bignumber.js, retorna nossa versão
      if (specifier.includes("bignumber") || specifier === "bignumber.js") {
        console.log("🎯 Retornando BigNumber patchado para dynamic import")
        return {
          default: BigNumberOriginal,
          BigNumber: BigNumberOriginal,
          BN: BigNumberOriginal,
        }
      }

      // Para outros módulos, tenta o import original
      try {
        return await originalImport(specifier)
      } catch (error) {
        console.warn(`⚠️ Erro no import original de ${specifier}:`, error)
        throw error
      }
    }

    console.log("✅ Patch v0 dynamic imports aplicado")
  } catch (error) {
    console.warn("⚠️ Erro ao aplicar patch dynamic imports:", error)
  }
}

// 🔥 PATCH PARA WEBPACK DO V0
const patchV0Webpack = () => {
  try {
    console.log("🎯 Aplicando patch para webpack v0...")

    // Verifica se existe __webpack_require__
    const webpackRequire = (globalThis as any).__webpack_require__
    if (webpackRequire) {
      const originalWebpackRequire = webpackRequire
      ;(globalThis as any).__webpack_require__ = (moduleId: string) => {
        console.log(`🔄 Webpack require interceptado: ${moduleId}`)

        if (moduleId.includes("bignumber")) {
          console.log("🎯 Retornando BigNumber patchado para webpack")
          return {
            default: BigNumberOriginal,
            BigNumber: BigNumberOriginal,
            BN: BigNumberOriginal,
          }
        }

        return originalWebpackRequire(moduleId)
      }
      console.log("✅ Patch v0 webpack aplicado")
    }

    // Também verifica window.__webpack_require__
    if (typeof window !== "undefined" && (window as any).__webpack_require__) {
      const originalWindowWebpackRequire = (window as any).__webpack_require__
      ;(window as any).__webpack_require__ = (moduleId: string) => {
        console.log(`🔄 Window webpack require interceptado: ${moduleId}`)

        if (moduleId.includes("bignumber")) {
          console.log("🎯 Retornando BigNumber patchado para window webpack")
          return {
            default: BigNumberOriginal,
            BigNumber: BigNumberOriginal,
            BN: BigNumberOriginal,
          }
        }

        return originalWindowWebpackRequire(moduleId)
      }
      console.log("✅ Patch v0 window webpack aplicado")
    }
  } catch (error) {
    console.warn("⚠️ Erro ao aplicar patch webpack:", error)
  }
}

// 🔥 APLICA TODOS OS PATCHES
export const applyV0Patches = () => {
  console.log("🚀 Aplicando patches completos para v0...")

  patchV0ModuleSystem()
  patchV0DynamicImports()
  patchV0Webpack()

  // Registra BigNumber globalmente
  ;(globalThis as any).BigNumber = BigNumberOriginal
  if (typeof window !== "undefined") {
    ;(window as any).BigNumber = BigNumberOriginal
  }

  console.log("🎉 Todos os patches v0 aplicados!")
}

// Aplica os patches imediatamente
applyV0Patches()

// Exporta para uso direto
export const BigNumber = BigNumberOriginal
export default BigNumberOriginal
