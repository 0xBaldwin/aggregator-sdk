import * as _mysten_sui_client from '@mysten/sui/client';
import { SuiClient } from '@mysten/sui/client';
import { TransactionObjectArgument, Transaction } from '@mysten/sui/transactions';
import { Signer } from '@mysten/sui/cryptography';
import BN from 'bn.js';
import Decimal from 'decimal.js';

/**
 * Represents a SUI address, which is a string.
 */
type SuiAddress = string;
/**
 * Represents a SUI object identifier, which is a string.
 */
type SuiObjectIdType = string;
/**
 * Represents a SUI struct tag.
 */
type SuiStructTag = {
    /**
     * The full address of the struct.
     */
    full_address: string;
    /**
     * The source address of the struct.
     */
    source_address: string;
    /**
     * The address of the struct.
     */
    address: SuiAddress;
    /**
     * The module to which the struct belongs.
     */
    module: string;
    /**
     * The name of the struct.
     */
    name: string;
    /**
     * An array of type arguments (SUI addresses) for the struct.
     */
    type_arguments: SuiAddress[];
};
/**
 * Represents a coin asset with address, object ID, and balance information.
 */
type CoinAsset = {
    /**
     * The address type of the coin asset.
     */
    coinAddress: SuiAddress;
    /**
     * The object identifier of the coin asset.
     */
    coinObjectId: SuiObjectIdType;
    /**
     * The balance amount of the coin asset.
     */
    balance: bigint;
};

declare const CETUS = "CETUS";
declare const DEEPBOOKV2 = "DEEPBOOK";
declare const KRIYA = "KRIYA";
declare const FLOWXV2 = "FLOWX";
declare const FLOWXV3 = "FLOWXV3";
declare const KRIYAV3 = "KRIYAV3";
declare const TURBOS = "TURBOS";
declare const AFTERMATH = "AFTERMATH";
declare const HAEDAL = "HAEDAL";
declare const VOLO = "VOLO";
declare const AFSUI = "AFSUI";
declare const BLUEMOVE = "BLUEMOVE";
declare const DEEPBOOKV3 = "DEEPBOOKV3";
declare const SCALLOP = "SCALLOP";
declare const SUILEND = "SUILEND";
declare const DEFAULT_ENDPOINT = "https://api-sui.cetus.zone/router_v2";
declare const DEFAULT_PACKAGE = "0x57d4f00af225c487fd21eed6ee0d11510d04347ee209d2ab48d766e48973b1a4";
declare const DEFAULT_CONFIG_OBJECT = "0x48c7524e9487d9c80fabb3740fb9d653e9e09271f1871e5acc14e24943976812";
type BuildRouterSwapParams = {
    routers: Router[];
    byAmountIn: boolean;
    inputCoin: TransactionObjectArgument;
    slippage: number;
    txb: Transaction;
    partner?: string;
    deepbookv3DeepFee?: TransactionObjectArgument;
};
type BuildFastRouterSwapParams = {
    routers: Router[];
    byAmountIn: boolean;
    slippage: number;
    txb: Transaction;
    partner?: string;
    isMergeTragetCoin?: boolean;
    refreshAllCoins?: boolean;
    payDeepFeeAmount?: number;
};
interface SwapInPoolsParams {
    from: string;
    target: string;
    amount: BN;
    byAmountIn: boolean;
    pools: string[];
}
interface SwapInPoolsResult {
    isExceed: boolean;
    routeData?: RouterData;
}
declare class AggregatorClient {
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
    signAndExecuteTransaction(txb: Transaction, signer: Signer): Promise<_mysten_sui_client.SuiTransactionBlockResponse>;
    devInspectTransactionBlock(txb: Transaction): Promise<_mysten_sui_client.DevInspectResults>;
    sendTransaction(txb: Transaction, signer: Signer): Promise<_mysten_sui_client.SuiTransactionBlockResponse>;
    getDeepbookV3Config(): Promise<DeepbookV3Config | null>;
}
declare function parseRouterResponse(data: any): RouterData;

declare const CLOCK_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000006";
interface Dex {
    swap(client: AggregatorClient, ptb: Transaction, path: Path, inputCoin: TransactionObjectArgument, deepbookv3DeepFee?: TransactionObjectArgument): Promise<TransactionObjectArgument>;
}

declare function isSortedSymbols(symbolX: string, symbolY: string): boolean;
declare function composeType(address: string, generics: SuiAddress[]): SuiAddress;
declare function composeType(address: string, struct: string, generics?: SuiAddress[]): SuiAddress;
declare function composeType(address: string, module: string, struct: string, generics?: SuiAddress[]): SuiAddress;
declare function extractAddressFromType(type: string): string;
declare function extractStructTagFromType(type: string): SuiStructTag;
declare function normalizeCoinType(coinType: string): string;
declare function fixSuiObjectId(value: string): string;
/**
 * Recursively traverses the given data object and patches any string values that represent Sui object IDs.
 *
 * @param {any} data - The data object to be patched.
 */
declare function patchFixSuiObjectId(data: any): void;
declare function createTarget(packageName: string, moduleName: string, functionName: string): `${string}::${string}::${string}`;

declare const dealWithFastRouterSwapParamsForMsafe: (data: any) => any;
declare const restituteMsafeFastRouterSwapParams: (data: any) => any;

declare function processEndpoint(endpoint: string): string;

declare function completionCoin(s: string): string;
declare function compareCoins(coinA: string, coinB: string): boolean;
declare function mintZeroCoin(txb: Transaction, coinType: string): TransactionObjectArgument;
type BuildCoinResult = {
    targetCoin: TransactionObjectArgument;
    isMintZeroCoin: boolean;
    targetCoinAmount: number;
};
declare function buildInputCoin(txb: Transaction, allCoins: CoinAsset[], amount: bigint, coinType: string): BuildCoinResult;

declare function printTransaction(tx: Transaction, isPrint?: boolean): Promise<void>;
declare function checkInvalidSuiAddress(address: string): boolean;

declare const ZERO: BN;
declare const ONE: BN;
declare const TWO: BN;
declare const U128: BN;
declare const U64_MAX_BN: BN;
declare const U64_MAX = "18446744073709551615";
declare const TEN_POW_NINE = 1000000000;

interface FindRouterParams {
    from: string;
    target: string;
    amount: BN;
    byAmountIn: boolean;
    depth?: number;
    splitAlgorithm?: string;
    splitFactor?: number;
    splitCount?: number;
    providers?: string[];
    liquidityChanges?: PreSwapLpChangeParams[];
}
interface PreSwapLpChangeParams {
    poolID: string;
    ticklower: number;
    tickUpper: number;
    deltaLiquidity: number;
}
type ExtendedDetails = {
    aftermathPoolFlatness?: number;
    aftermathLpSupplyType?: string;
    turbosFeeType?: string;
    afterSqrtPrice?: string;
    deepbookv3DeepFee?: number;
    scallopScoinTreasury?: string;
};
type Path = {
    id: string;
    direction: boolean;
    provider: string;
    from: string;
    target: string;
    feeRate: number;
    amountIn: number;
    amountOut: number;
    extendedDetails?: ExtendedDetails;
    version?: string;
};
type Router = {
    path: Path[];
    amountIn: BN;
    amountOut: BN;
    initialPrice: Decimal;
};
type RouterError = {
    code: number;
    msg: string;
};
type RouterData = {
    amountIn: BN;
    amountOut: BN;
    routes: Router[];
    insufficientLiquidity: boolean;
    totalDeepFee?: number;
    feeRate?: number;
    totalFee?: number;
    error?: RouterError;
};
type AggregatorResponse = {
    code: number;
    msg: string;
    data: RouterData;
};
declare function getRouterResult(endpoint: string, params: FindRouterParams): Promise<RouterData | null>;
type DeepbookV3Config = {
    id: string;
    is_alternative_payment: boolean;
    alternative_payment_amount: number;
    trade_cap: string;
    balance_manager: string;
    deep_fee_vault: number;
    whitelist: number;
    package_version: 0;
    last_updated_time: number;
    whitelist_pools: string[];
};
type DeepbookV3ConfigResponse = {
    code: number;
    msg: string;
    data: DeepbookV3Config;
};
declare function getDeepbookV3Config(endpoint: string): Promise<DeepbookV3ConfigResponse | null>;

export { AFSUI, AFTERMATH, AggregatorClient, type AggregatorResponse, BLUEMOVE, type BuildCoinResult, type BuildFastRouterSwapParams, type BuildRouterSwapParams, CETUS, CLOCK_ADDRESS, DEEPBOOKV2, DEEPBOOKV3, DEFAULT_CONFIG_OBJECT, DEFAULT_ENDPOINT, DEFAULT_PACKAGE, type DeepbookV3Config, type DeepbookV3ConfigResponse, type Dex, type ExtendedDetails, FLOWXV2, FLOWXV3, type FindRouterParams, HAEDAL, KRIYA, KRIYAV3, ONE, type Path, type PreSwapLpChangeParams, type Router, type RouterData, type RouterError, SCALLOP, SUILEND, type SwapInPoolsParams, type SwapInPoolsResult, TEN_POW_NINE, TURBOS, TWO, U128, U64_MAX, U64_MAX_BN, VOLO, ZERO, buildInputCoin, checkInvalidSuiAddress, compareCoins, completionCoin, composeType, createTarget, dealWithFastRouterSwapParamsForMsafe, extractAddressFromType, extractStructTagFromType, fixSuiObjectId, getDeepbookV3Config, getRouterResult, isSortedSymbols, mintZeroCoin, normalizeCoinType, parseRouterResponse, patchFixSuiObjectId, printTransaction, processEndpoint, restituteMsafeFastRouterSwapParams };
