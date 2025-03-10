import { fakePriceSol, listenToSolPrice, getSolanaGasFee } from './priceFetcher';
import { AMOUNT_OF_SOL, BUY_SOLANA, SELL_SOLANA } from "../config";
import { buySolana, sellSolana } from './userTrade';

const getTimestamp = (): string => new Date().toLocaleTimeString("en-US", { hour12: false });

let boughtTokens: boolean = false;
let current_price: number | null = null;
let previous_price: number | null = null;
let originalBuyPrice: number | null = null;
let totalAmountIncrease: number = 0;
let totalLoss: number = 0;
let totalNetProfit: number = 0;

function buySolanaTrade(price: number): void {
    buySolana(AMOUNT_OF_SOL);
    console.log(`${getTimestamp()} | ✅ Buying ${AMOUNT_OF_SOL} SOL at $${price} (Total: $${(AMOUNT_OF_SOL * price).toFixed(2)})`);
    boughtTokens = true;
    originalBuyPrice = price;
    totalAmountIncrease = 0;
    totalLoss = 0;
}

async function sellSolanaTrade(price: number): Promise<void> {
    if (originalBuyPrice === null) return;

    const totalAmount: number = price * AMOUNT_OF_SOL;
    const gasFee: number = await getSolanaGasFee();
    const profit: number = (price - originalBuyPrice) * AMOUNT_OF_SOL;
    const netProfit: number = profit - gasFee;
    totalNetProfit += netProfit;

    sellSolana(AMOUNT_OF_SOL);
    console.log(`${getTimestamp()} | 🚀 Selling ${AMOUNT_OF_SOL} SOL for $${totalAmount.toFixed(2)}`);
    console.log(`Profit: $${profit.toFixed(2)} | Gas fees: $${gasFee} | Net Profit: $${netProfit.toFixed(2)} | Total Net Profit: $${totalNetProfit.toFixed(6)}`);

    boughtTokens = false;
    originalBuyPrice = null;
    totalAmountIncrease = 0;
    totalLoss = 0;
}

function checkBuyCondition(priceChange: number): void {
    if (!boughtTokens && priceChange > 0) {
        totalAmountIncrease += priceChange;
    }

    if (!boughtTokens && totalAmountIncrease >= BUY_SOLANA && current_price !== null) {
        buySolanaTrade(current_price);
    }
}

async function checkSellCondition(priceChange: number): Promise<void> {
    if (!boughtTokens || originalBuyPrice === null) return;

    if (priceChange < 0) {
        totalLoss += Math.abs(priceChange);
    }

    if (totalLoss >= SELL_SOLANA && current_price !== null) {
        await sellSolanaTrade(current_price);
    }
}

async function executeTrade(): Promise<void> {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        previous_price = current_price;
        try {
            current_price = await listenToSolPrice();
        } catch (error) {
            console.log("Could not fetch price. Retrying...");
            continue;
        }

        if (previous_price === null || current_price === null) continue;

        const priceChange: number = current_price - previous_price;
        const trendIcon: string = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➖";
        console.log(`${getTimestamp()} | ${trendIcon} Price: $${current_price} | Change: $${priceChange.toFixed(2)}`);

        if (boughtTokens) {
            await checkSellCondition(priceChange);
        } else {
            checkBuyCondition(priceChange);
        }
    }
}

console.log("Starting katas ng miming bot...");

(async function main() {
    try {
        await executeTrade();
    } catch (error) {
        console.error("Unhandled error:", error);
    }
})();
