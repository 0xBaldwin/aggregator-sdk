import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export declare class Afsui implements Dex {
    private stakedSuiVault;
    private safe;
    private referVault;
    private validator;
    constructor();
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
