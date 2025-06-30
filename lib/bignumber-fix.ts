/**
 * Fix para o erro "bignumber.js" module does not provide an export named "BigNumber"
 * Alguns pacotes esperam named export, mas bignumber.js só exporta default
 */
import BigNumberDefault from "bignumber.js"

// Re-exporta como named export para compatibilidade
export const BigNumber = BigNumberDefault
export default BigNumberDefault

// Também exporta todas as outras funcionalidades que podem ser necessárias
export type BigNumber = BigNumberDefault
