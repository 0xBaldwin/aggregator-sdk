import { Transaction, TransactionArgument, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export type CetusFlashSwapResult = {
    targetCoin: TransactionObjectArgument;
    flashReceipt: TransactionObjectArgument;
    payAmount: TransactionArgument;
};
export declare class Cetus implements Dex {
    private globalConfig;
    private partner;
    constructor(partner?: string);
    flash_swap(client: AggregatorClient, txb: Transaction, path: Path, by_amount_in: boolean): CetusFlashSwapResult;
    repay_flash_swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument, receipt: TransactionArgument): TransactionObjectArgument;
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
