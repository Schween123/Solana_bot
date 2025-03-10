import { TradeToken, TradeSide, CurrencyType } from "./raydiumBotClient";
import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

const RPC_PROVIDER = process.env.RPC_PROVIDER ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const POOL_ADDRESS = process.env.POOL_ADDRESS ?? "";
const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; 

if (!PRIVATE_KEY || !RPC_PROVIDER || !POOL_ADDRESS) {
    console.error("❌ Missing environment variables! Check your .env file.");
    process.exit(1);
}

const connection = new Connection(RPC_PROVIDER, "confirmed");
const botAccount = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));

/**
 * Fetches the SOL balance of the bot's account.
 */
export async function getSolBalance(): Promise<number> {
    try {
        const balance = await connection.getBalance(botAccount.publicKey);
        return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
        console.error("❌ Error fetching SOL balance:", error);
        return 0;
    }
}

/**
 * Fetches the USDC balance of the bot's account.
 */
export async function getUsdcBalance(): Promise<number> {
  try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          botAccount.publicKey,
          { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") } // Token Program ID
      );

      for (const account of tokenAccounts.value) {
          const mintAddress = account.account.data.parsed.info.mint;
          if (mintAddress === USDC_MINT_ADDRESS) {
              return parseFloat(account.account.data.parsed.info.tokenAmount.uiAmount);
          }
      }

      console.warn("⚠️ No USDC account found for this wallet.");
      return 0;
  } catch (error) {
      console.error("❌ Error fetching USDC balance:", error);
      return 0;
  }
}

/**
 * 
 * @param {number} amount - Amount of SOL to buy
 */
export async function buySolana(amount: number): Promise<void> {
  if (!amount || amount <= 0) {
    console.error("❌ Invalid trade amount:", amount);
    return;
}
    try {
        await TradeToken(RPC_PROVIDER, 
          botAccount, 
          amount,
          "So11111111111111111111111111111111111111112", 
          POOL_ADDRESS, 
          9,
          CurrencyType.SOL, 
          TradeSide.Buy);
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
        await TradeToken(RPC_PROVIDER, botAccount, amount, "So11111111111111111111111111111111111111112", POOL_ADDRESS, 9, CurrencyType.SOL, TradeSide.Sell);
    } catch (error) {
        console.error("❌ Error selling SOL:", error);
    }
}