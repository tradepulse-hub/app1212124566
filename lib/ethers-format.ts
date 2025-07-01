/**
 * formatUnits — version-agnostic wrapper
 */
import * as ethersImport from "ethers"

// v6 has default export `{ formatUnits }`; v5 keeps it in utils
const ethers: any = (ethersImport as any).ethers ?? ethersImport

export function formatUnits(value: any, decimals = 18): string {
  try {
    if (typeof ethers.formatUnits === "function") {
      // ethers v6
      return ethers.formatUnits(value, decimals)
    }
    if (ethers.utils?.formatUnits) {
      // ethers v5
      return ethers.utils.formatUnits(value, decimals)
    }
  } catch (_) {
    /* fall through */
  }
  // last-resort fallback
  const bigInt = BigInt(value).toString()
  const point = bigInt.length - decimals
  return `${point > 0 ? bigInt.slice(0, point) : "0"}.${bigInt
    .slice(Math.max(point, 0))
    .padStart(decimals, "0")}`.replace(/\.$/, "")
}
