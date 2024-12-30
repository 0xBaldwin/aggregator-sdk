import { SwapInPoolsParams } from "~/client";
import { SwapInPoolsResult } from "..";
import { SuiClient } from "@mysten/sui/client";
export declare function swapInPools(client: SuiClient, params: SwapInPoolsParams, sender: string): Promise<SwapInPoolsResult>;
