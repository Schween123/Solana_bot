import { Connection, PublicKey } from "@solana/web3.js";
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";
import { rpcProvider, POOL_ADDRESS } from "../config";

export const connection = new Connection(rpcProvider, "confirmed");
const poolAddress = new PublicKey(POOL_ADDRESS);

export async function fetchRealTimePrice(): Promise<number | null> {
  try {
    console.log("Fetching real-time SOL/USDC price...");

    const poolAccountInfo = await connection.getAccountInfo(poolAddress, "processed");
    if (!poolAccountInfo) {
      console.error("Failed to fetch pool account data. Check the pool address.");
      return null;
    }

    const poolState = LIQUIDITY_STATE_LAYOUT_V4.decode(poolAccountInfo.data);

    const baseTokenVault = poolState.baseVault ? new PublicKey(poolState.baseVault) : null;
    const quoteTokenVault = poolState.quoteVault ? new PublicKey(poolState.quoteVault) : null;

    if (!baseTokenVault || !quoteTokenVault) {
      console.error("Missing baseVault or quoteVault. Invalid pool address.");
      return null;
    }

    // Fetch vault balances
    const [baseAccountInfo, quoteAccountInfo] = await Promise.all([
      connection.getParsedAccountInfo(baseTokenVault),
      connection.getParsedAccountInfo(quoteTokenVault),
    ]);

    if (!baseAccountInfo.value || !quoteAccountInfo.value) {
      console.error("Could not find vault accounts. Pool might be inactive.");
      return null;
    }

    const baseReserve = parseInt((baseAccountInfo.value.data as any).parsed.info.tokenAmount.amount);
    const quoteReserve = parseInt((quoteAccountInfo.value.data as any).parsed.info.tokenAmount.amount);

    if (baseReserve === 0) {
      console.error("Invalid base reserve value.");
      return null;
    }

    // Calculate SOL/USDC price
    const solUsdcPrice = (quoteReserve / 1_000_000) / (baseReserve / 1_000_000_000);
    console.log(`Real-Time SOL/USDC Price: $${solUsdcPrice.toFixed(4)}`);
    return solUsdcPrice;
  } catch (error) {
    console.error("Error fetching real-time price:", error);
    return null;
  }
}
