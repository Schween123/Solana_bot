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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const raydiumBotClient_1 = require("./raydiumBotClient");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    var living = true;
    while (living) {
        //Add logic code here - check token price & metrics before buying etc
        const rpcProvider = "https://api.mainnet-beta.solana.com";
        const Account = bs58_1.default.decode('3ioSoQj5vDAXHNaJWWJ3Je1J3drUqPUvhnw4iaL45BNN8Dscqe1RDNgHsSU5qajGjiYuY3AffJ77f73JwhmbquX');
        var botAccount = web3_js_1.Keypair.fromSecretKey(Account);
        //Switch CurrencyType to USDC if you plan to use USDC pool
        yield (0, raydiumBotClient_1.TradeToken)(rpcProvider, botAccount, 1, "So11111111111111111111111111111111111111112", "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2", 9, raydiumBotClient_1.CurrencyType.SOL, raydiumBotClient_1.TradeSide.Buy);
        yield (0, raydiumBotClient_1.delay)(1000000000);
    }
}));
//# sourceMappingURL=swapBot.js.map