import WebSocket from "ws";
// import fetch from "node-fetch";
import { Connection, TransactionMessage, Keypair, VersionedTransaction } from "@solana/web3.js";

// export async function fetchSolPrice(): Promise<number | null> {
//   try {
//     const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
//     if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

//     const data = await response.json();
//     const solPrice: number | undefined = data?.solana?.usd;

//     if (solPrice === undefined) {
//       throw new Error("SOL price data is missing in response.");
//     }

//     console.log(`Real-Time SOL Price: $${solPrice.toFixed(2)}`);
//     return solPrice;
//   } catch (error) {
//     console.error("Error fetching SOL price:", error);
//     return null;
//   }
// }

let basePrice = 100;
let volatility = 0.01; // 5% max change per cycle
let trend: "up" | "down" = Math.random() > 0.5 ? "up" : "down"; // Random initial trend
let trendDuration = Math.floor(Math.random() * 5) + 1;
let trendCounter = 0;
const connection = new Connection("https://api.mainnet-beta.solana.com");

//simulate market prices
export async function fakePriceSol(): Promise<number> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const change = basePrice * (Math.random() * volatility);

      if (trend === "up") {
        basePrice += change; // Increase price
      } else {
        basePrice -= change; // Decrease price
      }

      trendCounter++;

      // Change trend after a set duration
      if (trendCounter >= trendDuration) {
        trend = trend === "up" ? "down" : "up"; // Switch trend
        trendDuration = Math.floor(Math.random() * 11) + 5; // Reset trend
        trendCounter = 0;
      }

      resolve(parseFloat(basePrice.toFixed(2))); // round
    }, 1000);
  });
}

//Websocket for solana price real-time
export function listenToSolPrice(): Promise<number> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channels: [{ name: "ticker", product_ids: ["SOL-USD"] }],
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data.toString());

        if (parsed.type === "ticker" && parsed.price) {
          ws.close();
          resolve(parseFloat(parsed.price)); 
        }
      } catch (error) {
        reject(error);
      }
    };

    ws.onerror = () => {
      reject("WebSocket error");
    };

    ws.onclose = () => {};
  });
}

//solana gas fee
export async function getSolanaGasFee(): Promise<number> {
  try {
      const latestBlockhash = await connection.getLatestBlockhash();
      const dummyPublicKey = Keypair.generate().publicKey;

      const messageV0 = new TransactionMessage({
          payerKey: dummyPublicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const feeForMessage = await connection.getFeeForMessage(transaction.message);

      if (feeForMessage.value === null) {
          return 0;
      }

      const gasFeeSOL = feeForMessage.value / 1_000_000_000; // Convert lamports to SOL

      // Fetch SOL/USD price
      const solPriceUSD = await getSolanaPriceUSD();

      // Convert gas fee to USD
      return gasFeeSOL * solPriceUSD;
  } catch {
      return 0;
  }
}


// sol to usd
async function getSolanaPriceUSD(): Promise<number> {
  try {
      const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
      const data = await response.json();
      return data.solana.usd;
  } catch {
      return 0;
  }
}
