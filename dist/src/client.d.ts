import { SuiClient } from "@mysten/sui/client";
import { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";
import { Signer } from "@mysten/sui/cryptography";
import BN from "bn.js";
import { Dex, FindRouterParams, Router, RouterData, DeepbookV3Config } from ".";
import { CoinAsset } from "./types/sui";
export declare const CETUS = "CETUS";
export declare const DEEPBOOKV2 = "DEEPBOOK";
export declare const KRIYA = "KRIYA";
export declare const FLOWXV2 = "FLOWX";
export declare const FLOWXV3 = "FLOWXV3";
export declare const KRIYAV3 = "KRIYAV3";
export declare const TURBOS = "TURBOS";
export declare const AFTERMATH = "AFTERMATH";
export declare const HAEDAL = "HAEDAL";
export declare const VOLO = "VOLO";
export declare const AFSUI = "AFSUI";
export declare const BLUEMOVE = "BLUEMOVE";
export declare const DEEPBOOKV3 = "DEEPBOOKV3";
export declare const SCALLOP = "SCALLOP";
export declare const SUILEND = "SUILEND";
export declare const DEFAULT_ENDPOINT = "https://api-sui.cetus.zone/router_v2";
export declare const DEFAULT_PACKAGE = "0x57d4f00af225c487fd21eed6ee0d11510d04347ee209d2ab48d766e48973b1a4";
export declare const DEFAULT_CONFIG_OBJECT = "0x48c7524e9487d9c80fabb3740fb9d653e9e09271f1871e5acc14e24943976812";
export type BuildRouterSwapParams = {
    routers: Router[];
    byAmountIn: boolean;
    inputCoin: TransactionObjectArgument;
    slippage: number;
    txb: Transaction;
    partner?: string;
    deepbookv3DeepFee?: TransactionObjectArgument;
};
export type BuildFastRouterSwapParams = {
    routers: Router[];
    byAmountIn: boolean;
    slippage: number;
    txb: Transaction;
    partner?: string;
    isMergeTragetCoin?: boolean;
    refreshAllCoins?: boolean;
    payDeepFeeAmount?: number;
};
export interface SwapInPoolsParams {
    from: string;
    target: string;
    amount: BN;
    byAmountIn: boolean;
    pools: string[];
}
export interface SwapInPoolsResult {
    isExceed: boolean;
    routeData?: RouterData;
}
export declare class AggregatorClient {
    endpoint: string;
    signer: string;
    client: SuiClient;
    publishedAt: string;
    configObject: string;
    private allCoins;
    constructor(endpoint?: string, signer?: string, publishedAt?: string, configObject?: string, client?: SuiClient);
    getCoins(coinType: string, refresh?: boolean): Promise<CoinAsset[]>;
    findRouters(params: FindRouterParams): Promise<RouterData | null>;
    expectInputSwap(txb: Transaction, inputCoin: TransactionObjectArgument, routers: Router[], amountOutLimit: BN, partner?: string, deepbookv3DeepFee?: TransactionObjectArgument): Promise<TransactionObjectArgument>;
    expectOutputSwap(txb: Transaction, inputCoin: TransactionObjectArgument, routers: Router[], partner?: string): Promise<TransactionObjectArgument>;
    swapInPools(params: SwapInPoolsParams): Promise<SwapInPoolsResult | null>;
    routerSwap(params: BuildRouterSwapParams): Promise<TransactionObjectArgument>;
    fastRouterSwap(params: BuildFastRouterSwapParams): Promise<void>;
    deepbookv3DeepFeeType(): string;
    transferOrDestoryCoin(txb: Transaction, coin: TransactionObjectArgument, coinType: string): void;
    checkCoinThresholdAndMergeCoin(txb: Transaction, coins: TransactionObjectArgument[], coinType: string, amountLimit: BN): TransactionObjectArgument;
    newDex(provider: string, partner?: string): Dex;
    signAndExecuteTransaction(txb: Transaction, signer: Signer): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse>;
    devInspectTransactionBlock(txb: Transaction): Promise<import("@mysten/sui/client").DevInspectResults>;
    sendTransaction(txb: Transaction, signer: Signer): Promise<import("@mysten/sui/client").SuiTransactionBlockResponse>;
    getDeepbookV3Config(): Promise<DeepbookV3Config | null>;
}
export declare function parseRouterResponse(data: any): RouterData;
