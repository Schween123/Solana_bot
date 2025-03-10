import { fakePriceSol, listenToSolPrice, getSolanaGasFee } from './priceFetcher';
import { AMOUNT_TO_BUY, BUY_SOLANA, SELL_SOLANA } from "../config";

const getTimestamp = (): string => new Date().toLocaleTimeString("en-US", { hour12: false });

let boughtTokens: boolean = false;
let current_price: number | null = null;
let previous_price: number | null = null;
let originalBuyPrice: number | null = null;
let totalAmountIncrease: number = 0;
let totalLoss: number = 0;
let totalNetProfit: number = 0;

// Buy function
function buySolana(price: number): void {
    console.log(`${getTimestamp()} | ✅ Buying ${AMOUNT_TO_BUY} SOL at $${price} (Total: $${(AMOUNT_TO_BUY * price).toFixed(2)})`);
    boughtTokens = true;
    originalBuyPrice = price;
    totalAmountIncrease = 0;
    totalLoss = 0;
}

// Sell function
async function sellSolana(price: number): Promise<void> {
    if (originalBuyPrice === null) return;

    const totalAmount: number = price * AMOUNT_TO_BUY;
    const gasFee: number = await getSolanaGasFee();
    const profit: number = ((price - originalBuyPrice) * AMOUNT_TO_BUY) - gasFee;
    totalNetProfit += profit;

    console.log(`${getTimestamp()} | 🚀 Selling ${AMOUNT_TO_BUY} SOL for $${totalAmount.toFixed(2)}`);
    console.log(`Profit: $${profit.toFixed(2)} | Gas fees: $${gasFee} | Net Profit: $${(profit - gasFee).toFixed(2)} | Total Net Profit: $${totalNetProfit.toFixed(6)}`);

    boughtTokens = false;
    originalBuyPrice = null;
    totalAmountIncrease = 0;
    totalLoss = 0;
}


// Handles buy logic
function checkBuyCondition(priceChange: number): void {
    if (!boughtTokens && priceChange > 0) {
        totalAmountIncrease += priceChange;
    }

    if (!boughtTokens && totalAmountIncrease >= BUY_SOLANA) {
        buySolana(current_price!);
    }
}

// Handles sell logic
async function checkSellCondition(priceChange: number): Promise<void> {
    if (!boughtTokens || originalBuyPrice === null) return;

    if (priceChange < 0) {
        totalLoss += Math.abs(priceChange);
    }

    // 🔥 Ensure Immediate Sell when totalLoss >= SELL_SOLANA
    if (totalLoss >= SELL_SOLANA) {
        // console.log(`${getTimestamp()} | 🚨 Total Loss: $${totalLoss.toFixed(2)} reached! Selling SOL...`);
        await sellSolana(current_price!);
        return;
    }
}

// Main bot execution loop
async function executeTrade(): Promise<void> {
    try {
        current_price = await listenToSolPrice();
    } catch (error) {
        console.log("Could not fetch price. Retrying...");
        setTimeout(executeTrade, 1000);
        return;
    }

    buySolana(current_price);

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
            await checkSellCondition(priceChange);  // 🔥 Ensure it's awaited
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
