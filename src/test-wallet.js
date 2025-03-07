require("dotenv").config();
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

// Load environment variables
const RPC_PROVIDER = process.env.RPC_PROVIDER
let PRIVATE_KEY = process.env.PRIVATE_KEY

// Debugging: Check if .env is loading correctly
if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY is missing! Check your .env file.");
    process.exit(1);
}

console.log("🔍 Loaded PRIVATE_KEY:", PRIVATE_KEY);

// Check if the private key is in Base58 format
let secretKey;
try {
    if (PRIVATE_KEY.startsWith("[") && PRIVATE_KEY.endsWith("]")) {
        // If the private key looks like a JSON array, parse it
        console.log("🟡 Detected JSON format private key.");
        secretKey = Uint8Array.from(JSON.parse(PRIVATE_KEY));
    } else {
        // Otherwise, assume it's Base58 and decode it
        console.log("🟢 Using Base58 format private key.");
        secretKey = bs58.decode(PRIVATE_KEY);
    }

    // Create a wallet from the secret key
    const wallet = Keypair.fromSecretKey(secretKey);
    console.log(`✅ Wallet Address: ${wallet.publicKey.toBase58()}`);

    // Connect to Solana RPC
    const connection = new Connection(RPC_PROVIDER, "confirmed");

    async function checkBalance() {
        try {
            const balance = await connection.getBalance(wallet.publicKey);
            console.log(`💰 Balance: ${balance / 1e9} SOL`);
        } catch (error) {
            console.error("❌ Error fetching balance:", error);
        }
    }

    // Call the function
    checkBalance();
} catch (error) {
    console.error("❌ Error decoding PRIVATE_KEY:", error.message);
    process.exit(1);
}
