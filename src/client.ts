import Decimal from "decimal.js"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import {
  Transaction,
  TransactionObjectArgument,
} from "@mysten/sui/transactions"
import { Signer } from "@mysten/sui/cryptography"
import BN from "bn.js"
import { SUI_FRAMEWORK_ADDRESS } from "@mysten/sui/utils"
import {
  Dex,
  extractStructTagFromType,
  FindRouterParams,
  getRouterResult,
  Router,
  RouterData,
  getDeepbookV3Config,
  processEndpoint,
  DeepbookV3Config,
} from "."
import { Aftermath } from "./transaction/aftermath"
import { DeepbookV2 } from "./transaction/deepbook_v2"
import { KriyaV2 } from "./transaction/kriya_v2"
import { KriyaV3 } from "./transaction/kriya_v3"
import { FlowxV2 } from "./transaction/flowx_v2"
import { FlowxV3 } from "./transaction/flowx_v3"
import { Turbos } from "./transaction/turbos"
import { Cetus } from "./transaction/cetus"
import { swapInPools } from "./transaction/swap"
import { CalculateAmountLimit, CalculateAmountLimitBN } from "./math"
import { Haedal } from "./transaction/haedal"
import { Afsui } from "./transaction/afsui"
import { Volo } from "./transaction/volo"
import { Bluemove } from "./transaction/bluemove"
import { CoinAsset } from "./types/sui"
import { buildInputCoin } from "./utils/coin"
import { DeepbookV3 } from "./transaction/deepbook_v3"
import { Scallop } from "./transaction/scallop"
import { Suilend } from "./transaction/suilend"

export const CETUS = "CETUS"
export const DEEPBOOKV2 = "DEEPBOOK"
export const KRIYA = "KRIYA"
export const FLOWXV2 = "FLOWX"
export const FLOWXV3 = "FLOWXV3"
export const KRIYAV3 = "KRIYAV3"
export const TURBOS = "TURBOS"
export const AFTERMATH = "AFTERMATH"
export const HAEDAL = "HAEDAL"
export const VOLO = "VOLO"
export const AFSUI = "AFSUI"
export const BLUEMOVE = "BLUEMOVE"
export const DEEPBOOKV3 = "DEEPBOOKV3"
export const SCALLOP = "SCALLOP"
export const SUILEND = "SUILEND"
export const DEFAULT_ENDPOINT = "https://api-sui.cetus.zone/router_v2"
export const DEFAULT_PACKAGE = "0x57d4f00af225c487fd21eed6ee0d11510d04347ee209d2ab48d766e48973b1a4"
export const DEFAULT_CONFIG_OBJECT = "0x48c7524e9487d9c80fabb3740fb9d653e9e09271f1871e5acc14e24943976812"

export type BuildRouterSwapParams = {
  routers: Router[]
  byAmountIn: boolean
  inputCoin: TransactionObjectArgument
  slippage: number
  txb: Transaction
  partner?: string
  // This parameter is used to pass the Deep token object. When using the DeepBook V3 provider,
  // users must pay fees with Deep tokens in non-whitelisted pools.
  deepbookv3DeepFee?: TransactionObjectArgument
}

export type BuildFastRouterSwapParams = {
  routers: Router[]
  byAmountIn: boolean
  slippage: number
  txb: Transaction
  partner?: string
  isMergeTragetCoin?: boolean
  refreshAllCoins?: boolean
  payDeepFeeAmount?: number
}

export interface SwapInPoolsParams {
  from: string
  target: string
  amount: BN
  byAmountIn: boolean
  pools: string[]
}

export interface SwapInPoolsResult {
  isExceed: boolean
  routeData?: RouterData
}

export class AggregatorClient {
  public endpoint: string
  public signer: string
  public client: SuiClient
  public publishedAt: string
  public configObject: string
  private allCoins: Map<string, CoinAsset[]>

  constructor(
    endpoint?: string,
    signer?: string,
    publishedAt?: string,
    configObject?: string,
    client?: SuiClient,
  ) {
    this.endpoint = endpoint ? processEndpoint(endpoint) : DEFAULT_ENDPOINT
    this.client = client || new SuiClient({ url: getFullnodeUrl("mainnet") })
    this.publishedAt = publishedAt || DEFAULT_PACKAGE,
    this.configObject = configObject || DEFAULT_CONFIG_OBJECT,
    this.signer = signer || "",
    this.allCoins = new Map<string, CoinAsset[]>()
  }

  async getCoins(
    coinType: string,
    refresh: boolean = true
  ): Promise<CoinAsset[]> {
    if (this.signer === "") {
      throw new Error("Signer is required, but not provided.")
    }

    let cursor = null
    let limit = 50

    if (!refresh) {
      const gotFromCoins = this.allCoins.get(coinType)
      if (gotFromCoins) {
        return gotFromCoins
      }
    }

    const allCoins: CoinAsset[] = []
    while (true) {
      const gotCoins = await this.client.getCoins({
        owner: this.signer,
        coinType,
        cursor,
        limit,
      })
      for (const coin of gotCoins.data) {
        allCoins.push({
          coinAddress: extractStructTagFromType(coin.coinType).source_address,
          coinObjectId: coin.coinObjectId,
          balance: BigInt(coin.balance),
        })
      }
      if (gotCoins.data.length < limit) {
        break
      }
      cursor = gotCoins.data[limit - 1].coinObjectId
    }

    this.allCoins.set(coinType, allCoins)
    return allCoins
  }

  async findRouters(params: FindRouterParams): Promise<RouterData | null> {
    return getRouterResult(this.endpoint, params)
  }

  async expectInputSwap(
    txb: Transaction,
    inputCoin: TransactionObjectArgument,
    routers: Router[],
    amountOutLimit: BN,
    partner?: string,
    deepbookv3DeepFee?: TransactionObjectArgument
  ) {
    if (routers.length === 0) {
      throw new Error("No router found")
    }
    const splitAmounts = routers.map((router) => router.amountIn.toString())
    const inputCoinType = routers[0].path[0].from
    const outputCoinType = routers[0].path[routers[0].path.length - 1].target
    const inputCoins = txb.splitCoins(inputCoin, splitAmounts)
    const outputCoins = []
    for (let i = 0; i < routers.length; i++) {
      if (routers[i].path.length === 0) {
        throw new Error("Empty path")
      }
      let nextCoin = inputCoins[i] as TransactionObjectArgument
      for (const path of routers[i].path) {
        const dex = this.newDex(path.provider, partner)
        nextCoin = await dex.swap(this, txb, path, nextCoin, deepbookv3DeepFee)
      }

      outputCoins.push(nextCoin)
    }
    this.transferOrDestoryCoin(txb, inputCoin, inputCoinType)
    const mergedTargetCointhis = this.checkCoinThresholdAndMergeCoin(
      txb,
      outputCoins,
      outputCoinType,
      amountOutLimit
    )
    return mergedTargetCointhis
  }

  async expectOutputSwap(
    txb: Transaction,
    inputCoin: TransactionObjectArgument,
    routers: Router[],
    partner?: string
  ): Promise<TransactionObjectArgument> {
    const returnCoins: TransactionObjectArgument[] = []
    const receipts: TransactionObjectArgument[] = []
    const targetCoins = []
    const dex = new Cetus(partner)
    for (let i = 0; i < routers.length; i++) {
      const router = routers[i]
      for (let j = router.path.length - 1; j >= 0; j--) {
        const path = router.path[j]
        const flashSwapResult = dex.flash_swap(this, txb, path, false)
        returnCoins.unshift(flashSwapResult.targetCoin)
        receipts.unshift(flashSwapResult.flashReceipt)
      }

      let nextRepayCoin = inputCoin
      for (let j = 0; j < router.path.length; j++) {
        const path = router.path[j]
        const repayResult = dex.repay_flash_swap(
          this,
          txb,
          path,
          nextRepayCoin,
          receipts[j]
        )
        nextRepayCoin = returnCoins[j]
        if (j === 0) {
          inputCoin = repayResult
        } else {
          this.transferOrDestoryCoin(txb, repayResult, path.from)
        }
        if (j === router.path.length - 1) {
          targetCoins.push(nextRepayCoin)
        }
      }
    }
    const inputCoinType = routers[0].path[0].from
    this.transferOrDestoryCoin(txb, inputCoin, inputCoinType)
    if (targetCoins.length > 1) {
      const vec = txb.makeMoveVec({ elements: targetCoins.slice(1) })
      txb.moveCall({
        target: `${SUI_FRAMEWORK_ADDRESS}::pay::join_vec`,
        typeArguments: [routers[0].path[routers[0].path.length - 1].target],
        arguments: [targetCoins[0], vec],
      })
    }

    return targetCoins[0]
  }

  async swapInPools(
    params: SwapInPoolsParams
  ): Promise<SwapInPoolsResult | null> {
    let result
    try {
      result = await swapInPools(this.client, params, this.signer)
    } catch (e) {
      console.error("swapInPools error:", e)
      return null
    }
    return result
  }

  async routerSwap(
    params: BuildRouterSwapParams
  ): Promise<TransactionObjectArgument> {
    const {
      routers,
      inputCoin,
      slippage,
      byAmountIn,
      txb,
      partner,
      deepbookv3DeepFee,
    } = params
    const amountIn = routers.reduce(
      (acc, router) => acc.add(router.amountIn),
      new BN(0)
    )
    const amountOut = routers.reduce(
      (acc, router) => acc.add(router.amountOut),
      new BN(0)
    )
    const amountLimit = CalculateAmountLimitBN(
      byAmountIn ? amountOut : amountIn,
      byAmountIn,
      slippage
    )

    if (byAmountIn) {
      const targetCoin = await this.expectInputSwap(
        txb,
        inputCoin,
        routers,
        amountLimit,
        partner,
        deepbookv3DeepFee
      )
      return targetCoin
    }

    // When exact output, we will set slippage limit in split coin.
    const splitedInputCoins = txb.splitCoins(inputCoin, [
      amountLimit.toString(),
    ])
    this.transferOrDestoryCoin(txb, inputCoin, routers[0].path[0].from)
    const targetCoin = await this.expectOutputSwap(
      txb,
      splitedInputCoins[0],
      routers,
      partner
    )
    return targetCoin
  }

  // auto build input coin
  // auto merge, transfer or destory target coin.
  async fastRouterSwap(params: BuildFastRouterSwapParams) {
    const {
      routers,
      byAmountIn,
      slippage,
      txb,
      partner,
      isMergeTragetCoin,
      refreshAllCoins,
      payDeepFeeAmount,
    } = params

    const fromCoinType = routers[0].path[0].from

    let fromCoins = await this.getCoins(fromCoinType, refreshAllCoins)

    const targetCoinType = routers[0].path[routers[0].path.length - 1].target
    const amountIn = routers.reduce(
      (acc, router) => acc.add(router.amountIn),
      new BN(0)
    )
    const amountOut = routers.reduce(
      (acc, router) => acc.add(router.amountOut),
      new BN(0)
    )
    const amountLimit = CalculateAmountLimit(
      byAmountIn ? amountOut : amountIn,
      byAmountIn,
      slippage
    )
    const amount = byAmountIn ? amountIn : amountLimit
    const buildFromCoinRes = buildInputCoin(
      txb,
      fromCoins,
      BigInt(amount.toString()),
      fromCoinType
    )

    let deepCoin
    if (payDeepFeeAmount && payDeepFeeAmount > 0) {
      let deepCoins = await this.getCoins(this.deepbookv3DeepFeeType())
      deepCoin = buildInputCoin(
        txb,
        deepCoins,
        BigInt(payDeepFeeAmount),
        this.deepbookv3DeepFeeType()
      ).targetCoin
    }

    const targetCoin = await this.routerSwap({
      routers,
      inputCoin: buildFromCoinRes.targetCoin,
      slippage,
      byAmountIn,
      txb,
      partner,
      deepbookv3DeepFee: deepCoin,
    })

    if (isMergeTragetCoin) {
      let targetCoins = await this.getCoins(targetCoinType, refreshAllCoins)
      const targetCoinRes = buildInputCoin(
        txb,
        targetCoins,
        BigInt(0),
        targetCoinType
      )
      txb.mergeCoins(targetCoinRes.targetCoin, [targetCoin])
      if (targetCoinRes.isMintZeroCoin) {
        this.transferOrDestoryCoin(
          txb,
          targetCoinRes.targetCoin,
          targetCoinType
        )
      }
    } else {
      this.transferOrDestoryCoin(txb, targetCoin, targetCoinType)
    }
  }

  deepbookv3DeepFeeType(): string {
    return "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP"
  }

  transferOrDestoryCoin(
    txb: Transaction,
    coin: TransactionObjectArgument,
    coinType: string
  ) {
    txb.moveCall({
      target: `${this.publishedAt}::utils::transfer_or_destroy_coin`,
      typeArguments: [coinType],
      arguments: [coin],
    })
  }

  checkCoinThresholdAndMergeCoin(
    txb: Transaction,
    coins: TransactionObjectArgument[],
    coinType: string,
    amountLimit: BN
  ) {
    let targetCoin = coins[0]
    if (coins.length > 1) {
      let vec = txb.makeMoveVec({ elements: coins.slice(1) })
      txb.moveCall({
        target: `${SUI_FRAMEWORK_ADDRESS}::pay::join_vec`,
        typeArguments: [coinType],
        arguments: [coins[0], vec],
      })
      targetCoin = coins[0]
    }

    txb.moveCall({
      target: `${this.publishedAt}::utils::check_coin_threshold`,
      typeArguments: [coinType],
      arguments: [targetCoin, txb.pure.u64(amountLimit.toString())],
    })
    return targetCoin
  }

  newDex(provider: string, partner?: string): Dex {
    switch (provider) {
      case CETUS:
        return new Cetus(partner)
      case DEEPBOOKV2:
        return new DeepbookV2()
      case DEEPBOOKV3:
        return new DeepbookV3()
      case KRIYA:
        return new KriyaV2()
      case KRIYAV3:
        return new KriyaV3()
      case FLOWXV2:
        return new FlowxV2()
      case FLOWXV3:
        return new FlowxV3()
      case TURBOS:
        return new Turbos()
      case AFTERMATH:
        return new Aftermath()
      case HAEDAL:
        return new Haedal()
      case AFSUI:
        return new Afsui()
      case VOLO:
        return new Volo()
      case BLUEMOVE:
        return new Bluemove()
      case SCALLOP:
        return new Scallop()
      case SUILEND:
        return new Suilend()
      default:
        throw new Error(`Unsupported dex ${provider}`)
    }
  }

  async signAndExecuteTransaction(txb: Transaction, signer: Signer) {
    const res = await this.client.signAndExecuteTransaction({
      transaction: txb,
      signer,
      options: {
        showEffects: true,
        showEvents: true,
        showInput: true,
        showBalanceChanges: true,
      },
    })
    return res
  }

  async devInspectTransactionBlock(txb: Transaction) {
    const res = await this.client.devInspectTransactionBlock({
      transactionBlock: txb,
      sender: this.signer,
    })

    return res
  }

  async sendTransaction(txb: Transaction, signer: Signer) {
    const res = await this.client.signAndExecuteTransaction({
      transaction: txb,
      signer,
    })
    return res
  }

  async getDeepbookV3Config(): Promise<DeepbookV3Config | null> {
    const res = await getDeepbookV3Config(this.endpoint)
    if (res) {
      return res.data
    }
    return null
  }
}

export function parseRouterResponse(data: any): RouterData {
  let totalDeepFee = 0
  for (const route of data.routes) {
    for (const path of route.path) {
      if (path.extended_details && path.extended_details.deepbookv3_deep_fee) {
        totalDeepFee += Number(path.extended_details.deepbookv3_deep_fee)
      }
    }
  }

  const routerData: RouterData = {
    amountIn: new BN(data.amount_in.toString()),
    amountOut: new BN(data.amount_out.toString()),
    insufficientLiquidity: false,
    routes: data.routes.map((route: any) => {
      return {
        path: route.path.map((path: any) => {
          let version
          if (path.provider === AFTERMATH) {
            version =
              path.extended_details.aftermath_pool_flatness === 0 ? "v2" : "v3"
          }

          let extendedDetails
          if (
            path.provider === TURBOS ||
            path.provider === AFTERMATH ||
            path.provider === CETUS ||
            path.provider === DEEPBOOKV3 ||
            path.provider === SCALLOP
          ) {
            extendedDetails = {
              aftermathLpSupplyType:
                path.extended_details?.aftermath_lp_supply_type,
              turbosFeeType: path.extended_details?.turbos_fee_type,
              afterSqrtPrice: path.extended_details?.after_sqrt_price,
              deepbookv3DeepFee: path.extended_details?.deepbookv3_deep_fee,
              scallopScoinTreasury:
                path.extended_details?.scallop_scoin_treasury,
            }
          }

          return {
            id: path.id,
            direction: path.direction,
            provider: path.provider,
            from: path.from,
            target: path.target,
            feeRate: path.fee_rate,
            amountIn: path.amount_in,
            amountOut: path.amount_out,
            extendedDetails,
            version,
          }
        }),
        amountIn: new BN(route.amount_in.toString()),
        amountOut: new BN(route.amount_out.toString()),
        initialPrice: new Decimal(route.initial_price.toString()),
      }
    }),
    totalDeepFee: totalDeepFee
  }

  return routerData
}
