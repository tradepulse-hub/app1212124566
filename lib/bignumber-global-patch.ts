/**
 * Patch global definitivo para BigNumber.js
 * Funciona em qualquer ambiente (v0, Next.js, etc.)
 */

// Importa BigNumber original
import BigNumberOriginal from "bignumber.js"

// 🔥 PATCH GLOBAL: Injeta o named export diretamente no módulo
const patchBigNumber = () => {
  try {
    // Método 1: Patch no cache do módulo (Node.js)
    if (typeof require !== "undefined" && require.cache) {
      const bignumberPath = require.resolve("bignumber.js")
      if (require.cache[bignumberPath]) {
        const module = require.cache[bignumberPath]
        if (module && module.exports) {
          // Adiciona o named export ao módulo existente
          module.exports.BigNumber = BigNumberOriginal
          console.log("✅ BigNumber named export injetado no cache do Node.js")
        }
      }
    }

    // Método 2: Patch global para browsers/v0
    if (typeof globalThis !== "undefined") {
      // Cria um proxy para interceptar imports
      const originalBigNumber = globalThis.BigNumber || BigNumberOriginal

      // Define BigNumber globalmente
      ;(globalThis as any).BigNumber = BigNumberOriginal

      // Cria um módulo mock para imports
      ;(globalThis as any).__BIGNUMBER_MODULE__ = {
        default: BigNumberOriginal,
        BigNumber: BigNumberOriginal,
      }

      console.log("✅ BigNumber patch global aplicado")
    }

    // Método 3: Patch no window (browsers)
    if (typeof window !== "undefined") {
      ;(window as any).BigNumber = BigNumberOriginal
      ;(window as any).__BIGNUMBER_MODULE__ = {
        default: BigNumberOriginal,
        BigNumber: BigNumberOriginal,
      }
      console.log("✅ BigNumber patch window aplicado")
    }

    // Método 4: Intercepta dynamic imports
    if (typeof globalThis !== "undefined") {
      const originalImport = globalThis.import || ((path: string) => Promise.resolve({}))
      ;(globalThis as any).import = async (path: string) => {
        if (path.includes("bignumber.js")) {
          console.log("🔄 Interceptando import de bignumber.js")
          return {
            default: BigNumberOriginal,
            BigNumber: BigNumberOriginal,
          }
        }
        return originalImport(path)
      }
    }
  } catch (error) {
    console.warn("⚠️ Erro ao aplicar patch BigNumber:", error)
  }
}

// Aplica o patch imediatamente
patchBigNumber()

// Exporta para uso direto
export const BigNumber = BigNumberOriginal
export default BigNumberOriginal

console.log("🎯 BigNumber global patch carregado")
