export declare enum TypesErrorCode {
    InvalidType = "InvalidType"
}
export declare enum ConfigErrorCode {
    MissAggregatorPackage = "MissAggregatorPackage",
    MissGlobalConfig = "MissGlobalConfig",
    InvalidWallet = "InvalidWallet",
    SimulateError = "SimulateError"
}
export declare enum TransactionErrorCode {
    InsufficientBalance = "InsufficientBalance",
    SimulateEventError = "simulateEventError",
    CannotGetDecimals = "CannotGetDecimals",
    MissCoinA = "MissCoinA",
    MissCoinB = "MissCoinB",
    MissTurbosFeeType = "MissTurbosFeeType",
    MissAftermathLpSupplyType = "MissAftermathLpSupplyType"
}
export type AggregatorErrorCode = TypesErrorCode | ConfigErrorCode | TransactionErrorCode;
/**
 * AggregatorError is a custom error class that extends the built-in Error class. It is used to represent errors that occur during aggregation operations.
 * The key functionality of this code includes:
 * - Defining the AggregatorError class that represents an error during aggregation. It includes a message property and an optional errorCode property.
 * - Providing a static method isAggregatorErrorCode() that checks if a given error instance is an instance of AggregatorError and has a specific error code.
 */
export declare class AggregatorError extends Error {
    message: string;
    errorCode?: AggregatorErrorCode;
    constructor(message: string, errorCode?: AggregatorErrorCode);
    static isAggregatorErrorCode(e: any, code: AggregatorErrorCode): boolean;
}
export declare enum AggregatorServerErrorCode {
    CalculateError = 10000,
    NumberTooLarge = 10001,
    NoRouter = 10002,
    InsufficientLiquidity = 10003
}
export declare function getAggregatorServerErrorMessage(code: AggregatorServerErrorCode): string;
