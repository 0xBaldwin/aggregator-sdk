import {
  Transaction,
  TransactionObjectArgument,
} from "@mysten/sui/transactions"
import { AggregatorClient, CLOCK_ADDRESS, Dex, Path } from ".."

export class Scallop implements Dex {
  private version: string
  private market: string

  constructor() {
    this.version = "0x07871c4b3c847a0f674510d4978d5cf6f960452795e8ff6f189fd2088a3f6ac7"
    this.market = "0xa757975255146dc9686aa823b7838b507f315d704f428cbadad2f4ea061939d9"
  }

  async swap(
    client: AggregatorClient,
    txb: Transaction,
    path: Path,
    inputCoin: TransactionObjectArgument
  ): Promise<TransactionObjectArgument> {
    const { direction, from, target } = path

    // in scallop swap, the first coin type is always the common coin, the second coin type is always the special
    const [func, coinAType, coinBType] = direction
      ? ["swap_a2b", from, target]
      : ["swap_b2a", from, target]

    if (path.extendedDetails == null) {
      throw new Error("Extended details not supported")
    } else {
      if (path.extendedDetails.scallopScoinTreasury == null) {
        throw new Error("Scallop coin treasury not supported")
      }
    }

    const args = [
      txb.object(client.configObject),
      txb.object(this.version),
      txb.object(this.market),
      txb.object(path.extendedDetails.scallopScoinTreasury),
      inputCoin,
      txb.object(CLOCK_ADDRESS),
    ]

    const res = txb.moveCall({
      target: `${client.publishedAt}::scallop::${func}`,
      typeArguments: [coinAType, coinBType],
      arguments: args,
    }) as TransactionObjectArgument

    return res
  }
}