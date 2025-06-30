/**
 * Mock do WorldChain SDK para desenvolvimento
 * Remove a necessidade de instalar dependências conflitantes
 */

export interface TokenDetails {
  address: string
  chainId: number
  decimals: number
  symbol: string
  name: string
}

export interface TokenProviderConfig {
  provider: any
}

export class TokenProvider {
  private provider: any

  constructor(config: TokenProviderConfig) {
    this.provider = config.provider
  }

  async details(...tokens: string[]): Promise<Record<string, TokenDetails>> {
    // Mock data para os tokens principais do WorldChain
    const mockDetails: Record<string, TokenDetails> = {
      "0x4200000000000000000000000000000000000006": {
        address: "0x4200000000000000000000000000000000000006",
        chainId: 480,
        decimals: 18,
        symbol: "WETH",
        name: "Wrapped Ethereum",
      },
      "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": {
        address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
        chainId: 480,
        decimals: 6,
        symbol: "USDCe",
        name: "USD Coin",
      },
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": {
        address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
        chainId: 480,
        decimals: 18,
        symbol: "WLD",
        name: "Worldcoin",
      },
    }

    const result: Record<string, TokenDetails> = {}
    tokens.forEach((token) => {
      if (mockDetails[token]) {
        result[token] = mockDetails[token]
      }
    })

    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500))
    return result
  }

  async tokenOf(wallet: string): Promise<string[]> {
    // Mock: retorna tokens que a wallet possui
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [
      "0x4200000000000000000000000000000000000006",
      "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    ]
  }

  async balanceOf(params: {
    wallet?: string
    tokens?: string[]
    token?: string
    wallets?: string[]
  }): Promise<Record<string, string>> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock balances - valores aleatórios mas realistas
    const mockBalances: Record<string, string> = {
      "0x4200000000000000000000000000000000000006": "2450000000000000000", // 2.45 WETH
      "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1": "1250000000", // 1,250 USDCe
      "0x2cFc85d8E48F8EAB294be644d9E25C3030863003": "15420750000000000000000", // 15,420.75 WLD
    }

    if (params.wallet && params.tokens) {
      const result: Record<string, string> = {}
      params.tokens.forEach((token) => {
        result[token] = mockBalances[token] || "0"
      })
      return result
    }

    if (params.token && params.wallets) {
      const result: Record<string, string> = {}
      params.wallets.forEach((wallet) => {
        result[wallet] = mockBalances[params.token!] || "0"
      })
      return result
    }

    return mockBalances
  }
}
