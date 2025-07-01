;/ 4:=BNabeegilllmnnrtuuy{}

// ----------------------------------------
// Async loader executed AFTER the module
// ----------------------------------------
;(async () => {
  try {
    const bignumberModule = await import("bignumber.js")
    BigNumber = bignumberModule.default || bignumberModule.BigNumber || bignumberModule
  } catch {
    /* fallback branch stays identical */
  }
})()

export { BigNumber }

// Mock BigNumber if it's not available (e.g., in a browser environment without bignumber.js)
if (typeof BigNumber === "undefined") {
  BigNumber = class BigNumberMock {
    value: number
    constructor(value: number | string) {
      this.value = typeof value === "string" ? Number.parseFloat(value) : value
    }
    plus(other: BigNumberMock): BigNumberMock {
      return new BigNumberMock(this.value + other.value)
    }
    minus(other: BigNumberMock): BigNumberMock {
      return new BigNumberMock(this.value - other.value)
    }
    multipliedBy(other: BigNumberMock): BigNumberMock {
      return new BigNumberMock(this.value * other.value)
    }
    dividedBy(other: BigNumberMock): BigNumberMock {
      return new BigNumberMock(this.value / other.value)
    }
    toNumber(): number {
      return this.value
    }
    toString(): string {
      return this.value.toString()
    }
    isEqualTo(other: BigNumberMock): boolean {
      return this.value === other.value
    }
    isGreaterThan(other: BigNumberMock): boolean {
      return this.value > other.value
    }
    isGreaterThanOrEqualTo(other: BigNumberMock): boolean {
      return this.value >= other.value
    }
    isLessThan(other: BigNumberMock): boolean {
      return this.value < other.value
    }
    isLessThanOrEqualTo(other: BigNumberMock): boolean {
      return this.value <= other.value
    }
  }
}
