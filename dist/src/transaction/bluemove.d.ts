import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export declare class Bluemove implements Dex {
    private dexInfo;
    constructor();
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
