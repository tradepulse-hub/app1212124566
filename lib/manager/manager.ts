import { Mutex } from "async-mutex"
import { BigNumber } from "bignumber.js"
import type { Client } from "../client"
import { config } from "../config"
import { logger } from "../logger"
import {
  inmemoryTokenStorage,
  inmemoryTransactionStorage,
  type TokenStorage,
  type Transaction,
  TransactionStatus,
  type TransactionStorage,
} from "../storage"
import { TokenProvider } from "../token"

type TokenTransfer = {
  tokenAddress: string
  amount: string
  from: string
  to: string
}

export class Manager {
  private listeners: Record<string, Runner> = {}
  private readonly mutex = new Mutex()
  private readonly client: Client
  private readonly tokenProvider: TokenProvider
  private readonly tokenStorage: TokenStorage
  private readonly transactionStorage: TransactionStorage

  constructor(
    options?: Partial<{
      client: Client
      tokenProvider: TokenProvider
      storage: Partial<{
        token: TokenStorage
        tx: TransactionStorage
      }>
    }>,
  ) {
    this.client = options?.client ?? config.client

    this.tokenProvider =
      options?.tokenProvider ??
      new TokenProvider({
        client: this.client,
        multicall3: config.multicall3,
        storage: inmemoryTokenStorage,
      })

    this.tokenStorage = options?.storage?.token ?? inmemoryTokenStorage
    this.transactionStorage = options?.storage?.tx ?? inmemoryTransactionStorage
  }

  watch = async (address: string, fromBlock: number, toBlock: number) => {
    const mutex = this.mutex
    const release = await mutex.acquire()

    try {
      if (this.listeners[address.toLowerCase()]) {
        const runner = this.listeners[address.toLowerCase()]
        if (runner) {
          runner.stop()
        }

        delete this.listeners[address.toLowerCase()]
      }

      this.listeners[address.toLowerCase()] = new Runner(address, {
        client: this.client,
        tokenProvider: this.tokenProvider,
        storage: {
          token: this.tokenStorage,
          tx: this.transactionStorage,
        },
      })

      return {
        start: async () => {
          const release = await mutex.acquire()

          try {
            const runner = this.listeners[address.toLowerCase()]

            logger.debug(`Starting runner for ${address}...`)
            await runner.run(fromBlock, toBlock)
            logger.debug(`Runner for ${address} successfully started`)
          } finally {
            release()
          }
        },
        stop: async () => {
          const runner = this.listeners[address.toLowerCase()]
          if (runner) {
            runner.stop()
          }

          delete this.listeners[address.toLowerCase()]
        },
      }
    } finally {
      release()
    }
  }
}

export class Runner {
  private lastBlock = 0
  private minBlock = 0
  private readonly blockstep = 2_000
  private aborted = false

  // delay between range scan
  private delay = 1000

  private readonly client: Client
  private readonly tokenStorage: TokenStorage
  private readonly transactionStorage: TransactionStorage
  private readonly tokenProvider: TokenProvider

  constructor(
    private readonly walletAddress: string,
    options: {
      client: Client
      tokenProvider: TokenProvider
      storage: {
        token: TokenStorage
        tx: TransactionStorage
      }
    },
  ) {
    this.client = options.client
    this.tokenStorage = options.storage.token
    this.transactionStorage = options.storage.tx
    this.tokenProvider = options.tokenProvider
  }

  run = async (fromBlock: number, toBlock: number) => {
    this.lastBlock = await this.client.getBlockNumber()
    const lastBlockScan = await this.transactionStorage.findLastBlock()
    const minBlockScan = await this.transactionStorage.findMinBlock()

    this.minBlock = minBlockScan === 0 ? fromBlock : minBlockScan

    const startBlock = lastBlockScan === 0 ? fromBlock : lastBlockScan

    logger.debug(`Starting scan from block ${startBlock} to ${toBlock}`)

    // scan from start block to to block
    await this.scanRange(startBlock, toBlock)

    // scan from to block to current block
    await this.scanRange(toBlock, this.lastBlock)

    // start live scan
    this.liveScan()
  }

  stop = () => {
    this.aborted = true
  }

  private liveScan = async () => {
    while (!this.aborted) {
      const currentBlock = await this.client.getBlockNumber()

      if (currentBlock > this.lastBlock) {
        await this.scanRange(this.lastBlock, currentBlock)
        this.lastBlock = currentBlock
      }

      await this.sleep(this.delay)
    }
  }

  private scanRange = async (fromBlock: number, toBlock: number) => {
    if (this.aborted) {
      return
    }

    logger.debug(`Scanning range ${fromBlock} to ${toBlock}`)

    const ranges = this.generateRanges(fromBlock, toBlock, this.blockstep)

    for (const range of ranges) {
      if (this.aborted) {
        return
      }

      await this.scanBlock(range.from, range.to)
    }
  }

  private scanBlock = async (fromBlock: number, toBlock: number) => {
    logger.debug(`Scanning block ${fromBlock} to ${toBlock}`)

    const logs = await this.client.getLogs({
      fromBlock,
      toBlock,
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event signature
        null,
        [this.client.padHex(this.walletAddress, 32), null], // to address (our wallet)
      ],
    })

    const incomingLogs = logs.filter((log) => {
      const to = this.client.getAddress(log.topics[2])
      return to.toLowerCase() === this.walletAddress.toLowerCase()
    })

    const outgoingLogs = await this.client.getLogs({
      fromBlock,
      toBlock,
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event signature
        [this.client.padHex(this.walletAddress, 32), null], // from address (our wallet)
        null,
      ],
    })

    const allLogs = [...incomingLogs, ...outgoingLogs]

    if (allLogs.length === 0) {
      return
    }

    // Group logs by transaction hash
    const logsByTx = allLogs.reduce(
      (acc, log) => {
        if (!acc[log.transactionHash]) {
          acc[log.transactionHash] = []
        }
        acc[log.transactionHash].push(log)
        return acc
      },
      {} as Record<string, typeof allLogs>,
    )

    const transactions: Transaction[] = []

    for (const [txHash, txLogs] of Object.entries(logsByTx)) {
      const tx = await this.client.getTransaction(txHash)
      const receipt = await this.client.getTransactionReceipt(txHash)

      const transfers: TokenTransfer[] = txLogs.map((log) => ({
        tokenAddress: log.address,
        amount: new BigNumber(log.data).toString(),
        from: this.client.getAddress(log.topics[1]),
        to: this.client.getAddress(log.topics[2]),
      }))

      // Save token details
      const tokenAddresses = [...new Set(transfers.map((t) => t.tokenAddress))]
      const tokenDetails = await this.tokenProvider.details(...tokenAddresses)

      for (const [address, details] of Object.entries(tokenDetails)) {
        await this.tokenStorage.save(details)
      }

      const transaction: Transaction = {
        hash: txHash,
        block: receipt.blockNumber,
        to: tx.to,
        success: receipt.status === 1 ? TransactionStatus.Success : TransactionStatus.Failed,
        date: new Date(receipt.timestamp * 1000),
        method: tx.input.slice(0, 10),
        protocol: "Unknown", // TODO: detect protocol
        transfers,
      }

      transactions.push(transaction)
    }

    if (transactions.length > 0) {
      await this.transactionStorage.saveMultiple(transactions)
      logger.debug(`Saved ${transactions.length} transactions`)
    }
  }

  private generateRanges = (fromBlock: number, toBlock: number, step: number) => {
    const ranges: { from: number; to: number }[] = []

    for (let i = fromBlock; i <= toBlock; i += step) {
      const from = i
      const to = Math.min(i + step - 1, toBlock)
      ranges.push({ from, to })
    }

    return ranges
  }

  private sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
}
