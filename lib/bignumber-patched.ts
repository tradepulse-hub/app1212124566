/**
 * bignumber-patched
 *
 * - Exporta `default` e `BigNumber` (named) para manter compatibilidade
 * - Pode ser importado como:
 *     import BigNumber, { BigNumber as BN } from "bignumber.js"
 */

import BigNumberDefault from "bignumber.js"

// named export
export const BigNumber = BigNumberDefault
// default export
export default BigNumberDefault
