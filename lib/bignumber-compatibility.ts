/**
 * Compatibilidade para BigNumber.js v9.3.0+
 * Resolve problemas de import/export para o WorldChain SDK
 */

// Importa BigNumber da forma mais compatível possível
let BigNumber: any

try {
  // Tenta importação ES6 primeiro
  const bignumberModule = await import("bignumber.js")
  BigNumber = bignumberModule.default || bignumberModule.BigNumber || bignumberModule
} catch (e1) {
  try {
    // Fallback para require (CommonJS)
    BigNumber = require("bignumber.js")
  } catch (e2) {
    console.warn("⚠️ BigNumber.js não encontrado, usando implementação mock")

    // Mock básico para desenvolvimento
    BigNumber = class MockBigNumber {
      constructor(value: any) {
        this.value = value
      }

      toString() {
        return String(this.value)
      }

      toFixed(decimals?: number) {
        return Number(this.value).toFixed(decimals)
      }

      static isBigNumber(value: any) {
        return value instanceof MockBigNumber
      }
    }
  }
}

// Exporta de todas as formas possíveis
export default BigNumber
export { BigNumber }
export const BN = BigNumber

// Garante compatibilidade global
if (typeof globalThis !== "undefined") {
  ;(globalThis as any).BigNumber = BigNumber
}

// Compatibilidade com CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = BigNumber
  module.exports.BigNumber = BigNumber
  module.exports.default = BigNumber
}

console.log("✅ BigNumber compatibility layer initialized")
