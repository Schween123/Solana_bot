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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAmmKeysById = formatAmmKeysById;
var raydium_sdk_1 = require("@raydium-io/raydium-sdk");
var web3_js_1 = require("@solana/web3.js");
function formatAmmKeysById(id, connection) {
    return __awaiter(this, void 0, void 0, function () {
        var account, info, marketId, marketAccount, marketInfo, lpMint, lpMintAccount, lpMintInfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connection.getAccountInfo(new web3_js_1.PublicKey(id))];
                case 1:
                    account = _a.sent();
                    if (account === null)
                        throw Error(' get id info error ');
                    info = raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);
                    marketId = info.marketId;
                    return [4 /*yield*/, connection.getAccountInfo(marketId)];
                case 2:
                    marketAccount = _a.sent();
                    if (marketAccount === null)
                        throw Error(' get market info error');
                    marketInfo = raydium_sdk_1.MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);
                    lpMint = info.lpMint;
                    return [4 /*yield*/, connection.getAccountInfo(lpMint)];
                case 3:
                    lpMintAccount = _a.sent();
                    if (lpMintAccount === null)
                        throw Error(' get lp mint info error');
                    lpMintInfo = raydium_sdk_1.SPL_MINT_LAYOUT.decode(lpMintAccount.data);
                    return [2 /*return*/, {
                            id: id,
                            baseMint: info.baseMint.toString(),
                            quoteMint: info.quoteMint.toString(),
                            lpMint: info.lpMint.toString(),
                            baseDecimals: info.baseDecimal.toNumber(),
                            quoteDecimals: info.quoteDecimal.toNumber(),
                            lpDecimals: lpMintInfo.decimals,
                            version: 4,
                            programId: account.owner.toString(),
                            authority: raydium_sdk_1.Liquidity.getAssociatedAuthority({ programId: account.owner }).publicKey.toString(),
                            openOrders: info.openOrders.toString(),
                            targetOrders: info.targetOrders.toString(),
                            baseVault: info.baseVault.toString(),
                            quoteVault: info.quoteVault.toString(),
                            withdrawQueue: info.withdrawQueue.toString(),
                            lpVault: info.lpVault.toString(),
                            marketVersion: 3,
                            marketProgramId: info.marketProgramId.toString(),
                            marketId: info.marketId.toString(),
                            marketAuthority: raydium_sdk_1.Market.getAssociatedAuthority({ programId: info.marketProgramId, marketId: info.marketId }).publicKey.toString(),
                            marketBaseVault: marketInfo.baseVault.toString(),
                            marketQuoteVault: marketInfo.quoteVault.toString(),
                            marketBids: marketInfo.bids.toString(),
                            marketAsks: marketInfo.asks.toString(),
                            marketEventQueue: marketInfo.eventQueue.toString(),
                            lookupTableAccount: web3_js_1.PublicKey.default.toString()
                        }];
            }
        });
    });
}
