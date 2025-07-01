/**
 * Patch BigNumber para browser - SEM require()
 * Funciona puramente no lado do cliente
 */

// Importa BigNumber usando ES6 modules (funciona no browser)
import BigNumberOriginal from "bignumber.js"

// 🔥 INTERCEPTA IMPORTS DINÂMICOS NO BROWSER
const originalImport = globalThis.import || ((path: string) => Promise.resolve({}))

// Substitui a função import global
;(globalThis as any).import = async (path: string) => {
  console.log(`🔄 Interceptando import: ${path}`)

  // Se for bignumber.js, retorna nossa versão patchada
  if (path.includes("bignumber.js") || path === "bignumber.js") {
    console.log("✅ Retornando BigNumber patchado")
    return {
      default: BigNumberOriginal,
      BigNumber: BigNumberOriginal, // 🎯 NAMED EXPORT
    }
  }

  // Para outros módulos, usa o import original
  return originalImport(path)
}

// 🔥 PATCH PARA DYNAMIC IMPORTS VIA WEBPACK
if (typeof window !== "undefined") {
  // Intercepta __webpack_require__ se existir
  const webpackRequire = (window as any).__webpack_require__
  if (webpackRequire) {
    const originalWebpackRequire = webpackRequire
    ;(window as any).__webpack_require__ = (moduleId: string) => {
      if (moduleId.includes("bignumber")) {
        console.log("🔄 Webpack require interceptado para BigNumber")
        return {
          default: BigNumberOriginal,
          BigNumber: BigNumberOriginal,
        }
      }
      return originalWebpackRequire(moduleId)
    }
  }
}
// 🔥 CRIA UM MÓDULO MOCK GLOBAL
;(globalThis as any).BigNumberModule = {
  default: BigNumberOriginal,
  BigNumber: BigNumberOriginal,
}

// Registra no window também
if (typeof window !== "undefined") {
  ;(window as any).BigNumber = BigNumberOriginal
  ;(window as any).BigNumberModule = {
    default: BigNumberOriginal,
    BigNumber: BigNumberOriginal,
  }
}

// Exporta para uso direto
export const BigNumber = BigNumberOriginal
export default BigNumberOriginal

console.log("🎯 BigNumber browser patch aplicado")
console.log("✅ Named export disponível:", typeof BigNumber)
console.log("✅ Default export disponível:", typeof BigNumberOriginal)
