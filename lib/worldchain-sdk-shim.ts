/**
 * Shim para compatibilizar `bignumber.js` com libs que fazem
 * `import { BigNumber } from "bignumber.js"`
 */
import BigNumberDefault from "bignumber.js"
export const BigNumber = BigNumberDefault // named export
export default BigNumberDefault // default export (inalterado)

/* ------------------------------------------------------------------ *
 * Re-exportamos tudo do SDK original para que o consumo permaneça
 * idêntico: `import { TokenProvider } from "@/lib/worldchain-sdk-shim"`
 * ------------------------------------------------------------------ */
export * from "@holdstation/worldchain-sdk"

import type { TokenProvider as OriginalTokenProvider } from "@holdstation/worldchain-sdk"

export type TokenProvider = OriginalTokenProvider
