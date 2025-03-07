"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUSDCbalance = exports.delay = exports.Trade = exports.TradeToken = exports.TradeSide = exports.CurrencyType = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const config_1 = require("../config");
const formatAmmKeysById_1 = require("./formatAmmKeysById");
const util_1 = require("./util");
var CurrencyType;
(function (CurrencyType) {
    CurrencyType[CurrencyType["SOL"] = 0] = "SOL";
    CurrencyType[CurrencyType["USDC"] = 1] = "USDC";
})(CurrencyType || (exports.CurrencyType = CurrencyType = {}));
var TradeSide;
(function (TradeSide) {
    TradeSide[TradeSide["Buy"] = 0] = "Buy";
    TradeSide[TradeSide["Sell"] = 1] = "Sell";
})(TradeSide || (exports.TradeSide = TradeSide = {}));
function TradeToken(rpcProvider, botWallet, amount, tokenAddress, poolAddress, tokenDecimals, currencyType, tradeSide) {
    return __awaiter(this, void 0, void 0, function* () {
        const SolClient = new web3_js_1.Connection(rpcProvider);
        const BotAddress = botWallet.publicKey;
        const TokenAddress = new web3_js_1.PublicKey(tokenAddress);
        const TargetToken = new raydium_sdk_1.Token(spl_token_1.TOKEN_PROGRAM_ID, TokenAddress, tokenDecimals);
        const buyOrderSOLAmount = new raydium_sdk_1.CurrencyAmount(config_1.DEFAULT_TOKEN.SOL, amount, false);
        const buyOrderUSDCAmount = new raydium_sdk_1.CurrencyAmount(config_1.DEFAULT_TOKEN.USDC, amount, false);
        const sellOrderTokenAmount = new raydium_sdk_1.TokenAmount(TargetToken, amount, false);
        const slippage = new raydium_sdk_1.Percent(1, 100);
        const botTokenAccounts = yield (0, util_1.getWalletTokenAccount)(SolClient, BotAddress);
        yield delay(1000);
        console.log('Amount: ' + amount);
        try {
            console.log('Attempting Trade....');
            if (tradeSide == TradeSide.Buy) {
                if (currencyType == CurrencyType.USDC) {
                    yield Trade(SolClient, poolAddress, {
                        outputToken: TargetToken,
                        inputToken: config_1.DEFAULT_TOKEN.SOL,
                        inputTokenAmount: buyOrderUSDCAmount,
                        slippage,
                        walletTokenAccounts: botTokenAccounts,
                        wallet: botWallet,
                    }).then(({ txids }) => {
                        console.log('txids', txids);
                    });
                }
                if (currencyType == CurrencyType.SOL) {
                    yield Trade(SolClient, poolAddress, {
                        outputToken: TargetToken,
                        inputToken: config_1.DEFAULT_TOKEN.SOL,
                        inputTokenAmount: buyOrderSOLAmount,
                        slippage,
                        walletTokenAccounts: botTokenAccounts,
                        wallet: botWallet,
                    }).then(({ txids }) => {
                        console.log('txids', txids);
                    });
                }
            }
            if (tradeSide == TradeSide.Sell) {
                if (currencyType == CurrencyType.SOL) {
                    yield Trade(SolClient, poolAddress, {
                        outputToken: config_1.DEFAULT_TOKEN.SOL,
                        inputToken: TargetToken,
                        inputTokenAmount: sellOrderTokenAmount,
                        slippage,
                        walletTokenAccounts: botTokenAccounts,
                        wallet: botWallet,
                    }).then(({ txids }) => {
                        console.log('txids', txids);
                    });
                }
                if (currencyType == CurrencyType.USDC) {
                    yield Trade(SolClient, poolAddress, {
                        outputToken: config_1.DEFAULT_TOKEN.USDC,
                        inputToken: TargetToken,
                        inputTokenAmount: sellOrderTokenAmount,
                        slippage,
                        walletTokenAccounts: botTokenAccounts,
                        wallet: botWallet,
                    }).then(({ txids }) => {
                        console.log('txids', txids);
                    });
                }
                yield delay(1000);
            }
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.TradeToken = TradeToken;
function Trade(connect, Pool, input) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const targetPool = Pool;
            const targetPoolInfo = {
                official: [],
                unOfficial: [yield (0, formatAmmKeysById_1.formatAmmKeysById)(targetPool, connect)],
            };
            //const targetPoolInfo = formatAmmKeysToApi(MAINNET_PROGRAM_ID.AmmV4.toString(), connect, false)
            // If the Liquidity pool is not required for routing, then this variable can be configured as undefined
            console.log('Collected AMM Key info..');
            // -------- step 1: get all route --------
            const getRoute = raydium_sdk_1.TradeV2.getAllRoute({
                inputMint: input.inputToken instanceof raydium_sdk_1.Token ? input.inputToken.mint : web3_js_1.PublicKey.default,
                outputMint: input.outputToken instanceof raydium_sdk_1.Token ? input.outputToken.mint : web3_js_1.PublicKey.default,
                clmmList: undefined,
                apiPoolList: yield targetPoolInfo,
            });
            console.log('Route retrieved!');
            // -------- step 2: fetch tick array and pool info --------
            const [tickCache, poolInfosCache] = yield Promise.all([
                yield raydium_sdk_1.Clmm.fetchMultiplePoolTickArrays({
                    connection: connect,
                    poolKeys: getRoute.needTickArray,
                    batchRequest: true,
                }),
                yield raydium_sdk_1.TradeV2.fetchMultipleInfo({ connection: connect, pools: getRoute.needSimulate, batchRequest: true }),
            ]);
            console.log('Collected pool info!');
            // -------- step 3: calculation result of all route --------
            const [routeInfo] = raydium_sdk_1.TradeV2.getAllRouteComputeAmountOut({
                directPath: getRoute.directPath,
                routePathDict: getRoute.routePathDict,
                simulateCache: poolInfosCache,
                tickCache,
                inputTokenAmount: input.inputTokenAmount,
                outputToken: input.outputToken,
                slippage: input.slippage,
                chainTime: new Date().getTime() / 1000, // this chain time
                feeConfig: input.feeConfig,
                mintInfos: yield (0, raydium_sdk_1.fetchMultipleMintInfos)({
                    connection: connect,
                    mints: [],
                }),
                epochInfo: yield connect.getEpochInfo(),
            });
            console.log('creating swap transaction...');
            // -------- step 4: create instructions by SDK function --------
            const { innerTransactions } = yield raydium_sdk_1.TradeV2.makeSwapInstructionSimple({
                routeProgram: config_1.PROGRAMIDS.Router,
                connection: connect,
                swapInfo: routeInfo,
                ownerInfo: {
                    wallet: input.wallet.publicKey,
                    tokenAccounts: input.walletTokenAccounts,
                    associatedOnly: true,
                    checkCreateATAOwner: true,
                },
                computeBudgetConfig: {
                    units: 60000,
                    microLamports: 3,
                },
                makeTxVersion: config_1.makeTxVersion,
            });
            console.log('Attempting to send transaction...');
            return {
                txids: yield (0, util_1.buildAndSendTx)(input.wallet, connect, innerTransactions, {
                    skipPreflight: false,
                    maxRetries: 3,
                    preflightCommitment: 'confirmed',
                }),
            };
        }
        catch (error) {
            console.log(error);
            const txids = [];
            return {
                txids: txids,
            };
        }
    });
}
exports.Trade = Trade;
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
function getUSDCbalance(wallet, solanaConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        var TokenBalance = 0;
        try {
            const tokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(solanaConnection, wallet, new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), wallet.publicKey);
            var balance = yield solanaConnection.getTokenAccountBalance(tokenAccount.address);
            if (balance.value.uiAmount != null) {
                TokenBalance = balance.value.uiAmount;
                return TokenBalance;
            }
        }
        catch (error) {
            //error is thrown when no token account exists. The error will go away after you purchase the token for the first time
            console.log('Token Account may not exist yet - Error Message: ' + error);
        }
        return TokenBalance;
    });
}
exports.getUSDCbalance = getUSDCbalance;
//# sourceMappingURL=raydiumBotClient.js.map