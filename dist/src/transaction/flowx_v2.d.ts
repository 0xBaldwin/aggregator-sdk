import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export declare class FlowxV2 implements Dex {
    private container;
    constructor();
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
