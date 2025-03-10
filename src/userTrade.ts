import { TradeToken, TradeSide, CurrencyType } from "./raydiumBotClient";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const RPC_PROVIDER = process.env.RPC_PROVIDER ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const POOL_ADDRESS = process.env.POOL_ADDRESS ?? "";
const AMOUNT_TO_BUY = parseFloat(process.env.AMOUNT_TO_BUY ?? "100");

if (!PRIVATE_KEY || !RPC_PROVIDER || !POOL_ADDRESS) {
    console.error("❌ Missing environment variables! Check your .env file.");
    process.exit(1);
}

const botAccount = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

/**
 *
 * @param {number} amount - Amount of SOL to buy
 */
export async function buySolana(amount: number): Promise<void> {
    try {
        console.log(`✅ Attempting to buy ${amount} SOL...`);
        await TradeToken(RPC_PROVIDER, botAccount, amount, "So11111111111111111111111111111111111111112", POOL_ADDRESS, 9, CurrencyType.SOL, TradeSide.Buy);
        console.log(`🚀 Successfully bought ${amount} SOL!`);
    } catch (error) {
        console.error("❌ Error buying SOL:", error);
    }
}

/**
 * 
 * @param {number} amount - Amount of SOL to sell
 */
export async function sellSolana(amount: number): Promise<void> {
    try {
        console.log(`✅ Attempting to sell ${amount} SOL...`);
        await TradeToken(RPC_PROVIDER, botAccount, amount, "So11111111111111111111111111111111111111112", POOL_ADDRESS, 9, CurrencyType.SOL, TradeSide.Sell);
        console.log(`🚀 Successfully sold ${amount} SOL!`);
    } catch (error) {
        console.error("❌ Error selling SOL:", error);
    }
}
