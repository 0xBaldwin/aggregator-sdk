import {
  Transaction,
  TransactionObjectArgument,
} from "@mysten/sui/transactions"
import { AggregatorClient, CLOCK_ADDRESS, Dex, Path } from ".."

export class Suilend implements Dex {
  private liquid_staking_pool: string
  private sui_system_state: string

  constructor() {
    this.liquid_staking_pool = "0x15eda7330c8f99c30e430b4d82fd7ab2af3ead4ae17046fcb224aa9bad394f6b"

    this.sui_system_state = "0x0000000000000000000000000000000000000000000000000000000000000005"
  }

  async swap(
    client: AggregatorClient,
    txb: Transaction,
    path: Path,
    inputCoin: TransactionObjectArgument
  ): Promise<TransactionObjectArgument> {
    const { direction, from, target } = path

    const [func, springCoinType] = direction
      ? ["swap_a2b", target]
      : ["swap_b2a", from]

    const args = [
      txb.object(client.configObject),
      txb.object(this.liquid_staking_pool),
      txb.object(this.sui_system_state),
      inputCoin,
    ]

    const res = txb.moveCall({
      target: `${client.publishedAt}::suilend::${func}`,
      typeArguments: [springCoinType],
      arguments: args,
    }) as TransactionObjectArgument

    return res
  }
}
