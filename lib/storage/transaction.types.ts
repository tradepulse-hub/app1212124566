export enum TransactionStatus {
  NotDefined = "not_defined",
  Success = "success",
  Failed = "failed",
}

export type Transaction = {
  hash: string // Primary key
  block: number
  to: string
  success: TransactionStatus
  date: Date
  method: string
  protocol: string
  transfers: {
    tokenAddress: string
    amount: string
    from: string
    to: string
  }[]
}

export interface TransactionStorage {
  save(transaction: Transaction): Promise<void>
  saveMultiple(transactions: Transaction[]): Promise<void>
  find(offset: number, limit: number): Promise<Transaction[]>
  findByHash(hash: string): Promise<Transaction>
  findLastBlock(): Promise<number>
  findMinBlock(): Promise<number>
}
