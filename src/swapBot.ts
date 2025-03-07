import { fakePriceSol, listenToSolPrice, getSolanaGasFee } from './priceFetcher';
import { AMOUNT_TO_BUY, UP_TREND_BY_DOLLAR_BUY, DOWN_TREND_BY_DOLLAR_SELL } from "../config";

const getTimestamp = () => new Date().toLocaleTimeString("en-US", { hour12: false });

let boughtTokens = false;
let current_price = null;
let previous_price = null;
let originalBuyPrice = null;
let reachedHighSell = false;
let waitingForDip = false;
let lowestPriceAfterSell = null;
let totalNetProfit = 0;

async function executeTrade() {
  try {
    current_price = await listenToSolPrice();
  } catch (error) {
    console.log("Could not fetch price. Retrying...");
    setTimeout(executeTrade, 1000);
    return;
  }

  console.log(`${getTimestamp()} | ✅ Bought ${AMOUNT_TO_BUY} SOL for $${current_price} with a total value of $${AMOUNT_TO_BUY * current_price}`);
  boughtTokens = true;
  originalBuyPrice = current_price;
  reachedHighSell = false;
  waitingForDip = false;
  lowestPriceAfterSell = null;

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    previous_price = current_price;
    try {
      current_price = await listenToSolPrice();
    } catch (error) {
      console.log("Could not fetch price. Retrying...");
      continue;
    }

    const priceChange = previous_price ? current_price - previous_price : 0;
    const trendIcon = priceChange > 0 ? "📈" : priceChange < 0 ? "📉" : "➖";
    
    console.log(`${getTimestamp()} | ${trendIcon} Price: $${current_price} | Change: $${priceChange.toFixed(2)}`);

    if (boughtTokens) {
      if (originalBuyPrice !== null && current_price >= originalBuyPrice + UP_TREND_BY_DOLLAR_BUY) {
        reachedHighSell = true;
      }
      
      if (reachedHighSell && previous_price !== null && current_price <= previous_price - DOWN_TREND_BY_DOLLAR_SELL && originalBuyPrice !== null && current_price > originalBuyPrice) {
        const totalAmount = current_price * AMOUNT_TO_BUY;
        const gasFee = await getSolanaGasFee();
        const profit = ((current_price - originalBuyPrice) * AMOUNT_TO_BUY) - gasFee;
        totalNetProfit += profit;
        
        console.log(`${getTimestamp()} | 🚀 Selling ${AMOUNT_TO_BUY} SOL for $${totalAmount.toFixed(2)}`);
        console.log(`Profit: $${profit.toFixed(2)} | Gas fees: $${gasFee} | Net Profit: $${(profit - gasFee).toFixed(2)} | Total Net Profit: $${totalNetProfit.toFixed(6)}`);

        boughtTokens = false;
        originalBuyPrice = null;
        reachedHighSell = false;
        waitingForDip = true;
        lowestPriceAfterSell = current_price;
      }
    } else if (waitingForDip) {
      if (lowestPriceAfterSell === null || current_price < lowestPriceAfterSell) {
        lowestPriceAfterSell = current_price;
      }
      
      if (lowestPriceAfterSell !== null && current_price >= lowestPriceAfterSell + UP_TREND_BY_DOLLAR_BUY) {
        console.log(`${getTimestamp()} | ✅ Bought ${AMOUNT_TO_BUY} SOL at $${current_price} with a total value of $${AMOUNT_TO_BUY * current_price}`);
        boughtTokens = true;
        originalBuyPrice = current_price;
        waitingForDip = false;
        reachedHighSell = false;
      }
    }
  }
}

console.log("Starting swapBot...");

(async function main() {
  try {
    await executeTrade();
  } catch (error) {
    console.error("Unhandled error:", error);
  }
})();
