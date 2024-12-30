import {
  Transaction,
  TransactionObjectArgument,
} from "@mysten/sui/transactions"
import { AggregatorClient, Dex, Path } from ".."

export class Haedal implements Dex {
  constructor() {
  }

  async swap(
    client: AggregatorClient,
    txb: Transaction,
    path: Path,
    inputCoin: TransactionObjectArgument
  ): Promise<TransactionObjectArgument> {
    const { direction } = path
    if (!direction) {
      throw new Error("Haedal not support b2a swap")
    }
    const func = "swap_a2b"
    const args = [
      txb.object(client.configObject),
      txb.object(path.id),
      txb.object("0x5"), inputCoin
    ]
    const res = txb.moveCall({
      target: `${client.publishedAt}::haedal::${func}`,
      typeArguments: [],
      arguments: args,
    }) as TransactionObjectArgument

    return res
  }
}