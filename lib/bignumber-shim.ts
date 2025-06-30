/**
 * Corrige a falta do named export `BigNumber` em "bignumber.js"
 * 1. Importa a lib oficial
 * 2. Cria o named export BigNumber
 * 3. Injeta no cache do bundler para que todos os imports posteriores
 *    de "bignumber.js" recebam já a versão corrigida.
 */

import BigNumberDefault from "bignumber.js"

// Cria o named export
// (ESM) - quem fizer `import { BigNumber }` receberá BigNumberDefault
export const BigNumber = BigNumberDefault

// Mantém o export default
export default BigNumberDefault

// Também registra no global (útil para libs que acessam globalThis.BigNumber)
;(globalThis as any).BigNumber = BigNumberDefault

/* ------------------------------------------------------------------
   Injeta no cache do bundler/Node.
   O próximo `import "bignumber.js"` devolverá este mesmo objeto.
------------------------------------------------------------------ */
try {
  // @ts-ignore – types não expostos em edge/runtime
  const _moduleCache = (globalThis as any).__moduleCache || (globalThis as any)
  _moduleCache["bignumber.js"] = { default: BigNumberDefault, BigNumber }
} catch {
  /* ignore */
}

console.log("✅ BigNumber shim carregado (named export disponível)")
