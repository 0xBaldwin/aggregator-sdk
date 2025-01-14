import BN from "bn.js";
import Decimal from "decimal.js";
export interface FindRouterParams {
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
export interface PreSwapLpChangeParams {
    poolID: string;
    ticklower: number;
    tickUpper: number;
    deltaLiquidity: number;
}
export type ExtendedDetails = {
    aftermathPoolFlatness?: number;
    aftermathLpSupplyType?: string;
    turbosFeeType?: string;
    afterSqrtPrice?: string;
    deepbookv3DeepFee?: number;
    scallopScoinTreasury?: string;
};
export type Path = {
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
export type Router = {
    path: Path[];
    amountIn: BN;
    amountOut: BN;
    initialPrice: Decimal;
};
export type RouterError = {
    code: number;
    msg: string;
};
export type RouterData = {
    amountIn: BN;
    amountOut: BN;
    routes: Router[];
    insufficientLiquidity: boolean;
    totalDeepFee?: number;
    feeRate?: number;
    totalFee?: number;
    error?: RouterError;
};
export type AggregatorResponse = {
    code: number;
    msg: string;
    data: RouterData;
};
export declare function getRouterResult(endpoint: string, params: FindRouterParams): Promise<RouterData | null>;
export type DeepbookV3Config = {
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
export type DeepbookV3ConfigResponse = {
    code: number;
    msg: string;
    data: DeepbookV3Config;
};
export declare function getDeepbookV3Config(endpoint: string): Promise<DeepbookV3ConfigResponse | null>;
