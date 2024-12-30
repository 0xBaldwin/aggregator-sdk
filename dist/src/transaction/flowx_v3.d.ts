import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export declare class FlowxV3 implements Dex {
    private versioned;
    private poolRegistry;
    constructor();
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
