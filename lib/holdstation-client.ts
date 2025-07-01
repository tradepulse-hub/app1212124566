/**
 * Cliente Holdstation COMPLETO para WorldChain
 * Baseado na interface oficial do SDK
 */

export interface FilterLogs {
  request: {
    address: string
    topics: Array<string | Array<string> | null>
    fromBlock: string | number
    toBlock: string | number
  }
  response: {
    blockNumber: number
    blockHash: string
    transactionIndex: number
    removed: boolean
    address: string
    data: string
    topics: Array<string>
    transactionHash: string
    logIndex: number
  }
}

export interface OnchainTransaction {
  hash?: string
  to?: string
  from?: string
  nonce: number
  gasLimit: string
  gasPrice?: string
  data: string
  value: string
  blockNumber?: number
  blockHash?: string
  timestamp?: number
  raw?: string
}

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

export interface AbiCodec {
  encodeFunctionData(functionName: string, params: any[]): string
  decodeFunctionResult(functionName: string, data: string): Result
}

export interface Client {
  name(): string
  isValidAddress(address: string): boolean
  hexZeroPad(value: string, length: number): string
  getBlockNumber(): Promise<number>
  getChainId(): number
  getLogs(filter: Partial<FilterLogs["request"]>): Promise<FilterLogs["response"][]>
  getTransaction(hash: string): Promise<OnchainTransaction>
  codec(abi: any): AbiCodec
}

export class EthersCodec implements AbiCodec {
  private contractInterface: any

  constructor(abi: any, ethers: any) {
    console.log("📋 Criando EthersCodec...")

    // Cria interface do contrato
    if (ethers.utils?.Interface) {
      // Ethers v5
      this.contractInterface = new ethers.utils.Interface(abi)
    } else if (ethers.Interface) {
      // Ethers v6
      this.contractInterface = new ethers.Interface(abi)
    } else {
      throw new Error("Interface não encontrada no ethers")
    }
  }

  encodeFunctionData(functionName: string, params: any[]): string {
    console.log(`🔧 Encoding function: ${functionName}`, params)
    return this.contractInterface.encodeFunctionData(functionName, params)
  }

  decodeFunctionResult(functionName: string, data: string): Result {
    console.log(`🔍 Decoding function result: ${functionName}`)
    const result = this.contractInterface.decodeFunctionResult(functionName, data)

    // Normaliza resultado para o formato Result
    const output: Result = Array.isArray(result) ? Object.assign([...result], result) : Object.assign([], { 0: result })

    return output
  }
}

export class EthersHoldstationClient implements Client {
  private provider: any
  private ethers: any
  private _chainId = 480 // WorldChain default

  constructor(provider: any, ethersLib: any) {
    this.provider = provider
    this.ethers = ethersLib
    console.log("🔧 Criando EthersHoldstationClient COMPLETO...")

    // Obtém chain ID
    this.initializeChainId()
  }

  private async initializeChainId() {
    try {
      const network = await this.provider.getNetwork()
      this._chainId = network.chainId || 480
      console.log("✅ Chain ID obtido:", this._chainId)
    } catch (error) {
      console.warn("⚠️ Erro ao obter chain ID, usando 480:", error)
      this._chainId = 480
    }
  }

  name(): string {
    return "EthersHoldstationClient"
  }

  isValidAddress(address: string): boolean {
    try {
      if (this.ethers.utils?.isAddress) {
        // Ethers v5
        return this.ethers.utils.isAddress(address)
      } else if (this.ethers.isAddress) {
        // Ethers v6
        return this.ethers.isAddress(address)
      } else {
        // Fallback básico
        return /^0x[a-fA-F0-9]{40}$/.test(address)
      }
    } catch (error) {
      console.warn("⚠️ Erro ao validar endereço:", error)
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    }
  }

  hexZeroPad(value: string, length: number): string {
    if (value.length > length) {
      throw new Error(`Value length exceeds the specified length of ${length}`)
    }
    return value.padStart(length, "0")
  }

  async getBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.provider.getBlockNumber()
      console.log("📊 Block number:", blockNumber)
      return blockNumber
    } catch (error) {
      console.error("❌ Erro ao obter block number:", error)
      throw error
    }
  }

  getChainId(): number {
    return this._chainId
  }

  async getLogs(filter: Partial<FilterLogs["request"]>): Promise<FilterLogs["response"][]> {
    try {
      console.log("📋 Buscando logs:", filter)
      const logs = await this.provider.getLogs(filter)

      // Converte para o formato esperado
      return logs.map((log: any) => ({
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionIndex: log.transactionIndex,
        removed: log.removed || false,
        address: log.address,
        data: log.data,
        topics: log.topics,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
      }))
    } catch (error) {
      console.error("❌ Erro ao buscar logs:", error)
      throw error
    }
  }

  async getTransaction(hash: string): Promise<OnchainTransaction> {
    try {
      console.log("🔍 Buscando transação:", hash)
      const tx = await this.provider.getTransaction(hash)

      if (!tx) {
        throw new Error(`Transaction with hash ${hash} not found`)
      }

      return {
        hash: tx.hash,
        to: tx.to || undefined,
        from: tx.from,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit?.toString() || tx.gas?.toString() || "0",
        gasPrice: tx.gasPrice?.toString(),
        data: tx.data || "0x",
        value: tx.value?.toString() || "0",
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
        timestamp: undefined, // Seria necessário buscar o block para obter timestamp
        raw: tx.raw,
      }
    } catch (error) {
      console.error("❌ Erro ao buscar transação:", error)
      throw error
    }
  }

  codec(abi: any): AbiCodec {
    return new EthersCodec(abi, this.ethers)
  }

  // Método adicional para compatibilidade
  async call(params: { to: string; data: string }): Promise<string> {
    console.log("📞 Fazendo call:", params)

    try {
      const result = await this.provider.call({
        to: params.to,
        data: params.data,
      })
      console.log("✅ Call result:", result)
      return result
    } catch (error) {
      console.error("❌ Erro no call:", error)
      throw error
    }
  }
}
