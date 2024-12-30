import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
import { SuiClient } from "@mysten/sui/client";
type GetOrCreateAccountCapResult = {
    accountCap: TransactionObjectArgument;
    isCreate: boolean;
};
export declare class DeepbookV2 implements Dex {
    constructor();
    getAccountCap(client: SuiClient, owner: string): Promise<string | null>;
    getOrCreateAccountCap(txb: Transaction, client: SuiClient, owner: string): Promise<GetOrCreateAccountCapResult>;
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
export {};
