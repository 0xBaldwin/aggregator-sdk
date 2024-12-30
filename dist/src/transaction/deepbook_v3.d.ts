import { Transaction, TransactionArgument, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export type CetusFlashSwapResult = {
    targetCoin: TransactionObjectArgument;
    flashReceipt: TransactionObjectArgument;
    payAmount: TransactionArgument;
};
export declare class DeepbookV3 implements Dex {
    private deepbookV3Config;
    constructor();
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument, deepbookv3DeepFee?: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
