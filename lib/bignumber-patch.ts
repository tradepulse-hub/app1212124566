/**
 * Patch definitivo para BigNumber.js
 * Cria o named export que o WorldChain SDK precisa
 */

// Importa o BigNumber original
import BigNumberOriginal from "bignumber.js"

// Cria o named export que está faltando
export const BigNumber = BigNumberOriginal

// Mantém o default export
export default BigNumberOriginal

// Registra globalmente para garantir compatibilidade
if (typeof globalThis !== "undefined") {
  ;(globalThis as any).BigNumber = BigNumberOriginal
}

// Para Node.js/CommonJS
if (typeof global !== "undefined") {
  ;(global as any).BigNumber = BigNumberOriginal
}

console.log("✅ BigNumber patch aplicado - named export disponível")
