/**
 * Implementação Multicall3 para Ethers.js
 * Baseado na documentação do Holdstation SDK
 */

export interface Aggregate {
  request: {
    target: string
    callData: string
  }
  response: [blockNumber: number, returnData: string[]]
}

export interface Aggregate3 {
  request: {
    target: string
    allowFailure: boolean
    callData: string
  }
  response: {
    returnData: string
    success: boolean
  }
}

export interface Multicall3 {
  aggregate(calls: Aggregate["request"][]): Promise<Aggregate["response"]>
  aggregate3(calls: Aggregate3["request"][]): Promise<Aggregate3["response"][]>
}

// ABI do Multicall3 (do anexo)
export const MULTICALL3_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "callData", type: "bytes" },
        ],
        internalType: "struct Multicall3.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      { internalType: "uint256", name: "blockNumber", type: "uint256" },
      { internalType: "bytes[]", name: "returnData", type: "bytes[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bool", name: "allowFailure", type: "bool" },
          { internalType: "bytes", name: "callData", type: "bytes" },
        ],
        internalType: "struct Multicall3.Call3[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "success", type: "bool" },
          { internalType: "bytes", name: "returnData", type: "bytes" },
        ],
        internalType: "struct Multicall3.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

// Endereço do Multicall3 no WorldChain
export const WORLDCHAIN_MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11"

export class EthersMulticall3 implements Multicall3 {
  private readonly contract: any

  constructor(provider: any) {
    console.log("🔧 Criando EthersMulticall3 para WorldChain...")

    // Cria contrato Multicall3
    if (provider.Contract) {
      // Ethers v6
      this.contract = new provider.Contract(WORLDCHAIN_MULTICALL3_ADDRESS, MULTICALL3_ABI, provider)
    } else {
      // Ethers v5 ou importação direta
      const ethers = require("ethers")
      this.contract = new ethers.Contract(WORLDCHAIN_MULTICALL3_ADDRESS, MULTICALL3_ABI, provider)
    }

    console.log("✅ EthersMulticall3 criado:", WORLDCHAIN_MULTICALL3_ADDRESS)
  }

  async aggregate(calls: Aggregate["request"][]): Promise<Aggregate["response"]> {
    try {
      console.log("📞 Multicall3.aggregate com", calls.length, "chamadas")
      const [block, data] = await this.contract.aggregate(calls)
      console.log("✅ Multicall3.aggregate sucesso:", { block: Number(block), results: data.length })
      return [Number(block), data]
    } catch (error) {
      console.error("❌ Erro no Multicall3.aggregate:", error)
      throw error
    }
  }

  async aggregate3(calls: Aggregate3["request"][]): Promise<Aggregate3["response"][]> {
    try {
      console.log("📞 Multicall3.aggregate3 com", calls.length, "chamadas")
      const results = await this.contract.aggregate3(calls)

      const formatted = results.map((item: any) => ({
        returnData: item.returnData,
        success: item.success,
      }))

      console.log("✅ Multicall3.aggregate3 sucesso:", formatted.length, "resultados")
      return formatted
    } catch (error) {
      console.error("❌ Erro no Multicall3.aggregate3:", error)
      throw error
    }
  }
}
