import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { AggregatorClient, Dex, Path } from "..";
export declare class Aftermath implements Dex {
    private slippage;
    private poolRegistry;
    private protocolFeeVault;
    private treasury;
    private insuranceFund;
    private referrealVault;
    constructor();
    amountLimit(exportAmountOut: number): number;
    swap(client: AggregatorClient, txb: Transaction, path: Path, inputCoin: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}
