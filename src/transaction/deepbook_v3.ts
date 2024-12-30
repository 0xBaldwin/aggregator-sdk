import {
  Transaction,
  TransactionArgument,
  TransactionObjectArgument,
} from "@mysten/sui/transactions"
import { AggregatorClient, CLOCK_ADDRESS, Dex, Path } from ".."
import { mintZeroCoin } from "~/utils/coin"

export type CetusFlashSwapResult = {
  targetCoin: TransactionObjectArgument
  flashReceipt: TransactionObjectArgument
  payAmount: TransactionArgument
}

export class DeepbookV3 implements Dex {
  private deepbookV3Config: string

  constructor() {
    this.deepbookV3Config = "0xe4099d0cda04f3aa80028fac91a9b3dbe50d08f2ff42aa2c29473926e34ca48c"
  }

  async swap(
    client: AggregatorClient,
    txb: Transaction,
    path: Path,
    inputCoin: TransactionObjectArgument,
    deepbookv3DeepFee?: TransactionObjectArgument
  ): Promise<TransactionObjectArgument> {
    const { direction, from, target } = path
    const [func, coinAType, coinBType] = direction
      ? ["swap_a2b", from, target]
      : ["swap_b2a", target, from]

    let deepFee
    if (deepbookv3DeepFee) {
      deepFee = deepbookv3DeepFee
    } else {
      deepFee = mintZeroCoin(txb, client.deepbookv3DeepFeeType())
    }

    const args = [
      txb.object(client.configObject),
      txb.object(this.deepbookV3Config),
      txb.object(path.id),
      inputCoin,
      deepFee,
      txb.object(CLOCK_ADDRESS),
    ]
    const res = txb.moveCall({
      target: `${client.publishedAt}::deepbookv3::${func}`,
      typeArguments: [coinAType, coinBType],
      arguments: args,
    }) as TransactionArgument
    return res
  }
}
