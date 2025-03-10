import {
  ENDPOINT as _ENDPOINT,
  Currency,
  LOOKUP_TABLE_CACHE,
  MAINNET_PROGRAM_ID,
  RAYDIUM_MAINNET,
  Token,
  TOKEN_PROGRAM_ID,
  TxVersion,
} from '@raydium-io/raydium-sdk';
import {
  PublicKey,
} from '@solana/web3.js';

import dotenv from "dotenv";
dotenv.config();

export const PROGRAMIDS = MAINNET_PROGRAM_ID;

export const ENDPOINT = _ENDPOINT;

export const RAYDIUM_MAINNET_API = RAYDIUM_MAINNET;

export const makeTxVersion = TxVersion.V0; // LEGACY

export const addLookupTableInfo = LOOKUP_TABLE_CACHE // only mainnet. other = undefined

export const rpcProvider = process.env.RPC_PROVIDER || "";;

export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

export const POOL_ADDRESS = process.env.POOL_ADDRESS || "";

export const BUYING_AMOUNT_PESO = Number(process.env.BUYING_AMOUNT_PESO);

export const LOW_PERCENTAGE_BUY = Number(process.env.LOW_PERCENTAGE_BUY) / 100;

export const HIGH_PERCENTAGE_SELL = Number(process.env.HIGH_PERCENTAGE_SELL) / 100;

export const AMOUNT_OF_SOL = Number(process.env.AMOUNT_OF_SOL) || 0;

export const BUY_SOLANA = parseFloat(process.env.BUY_SOLANA || "1");

export const SELL_SOLANA = parseFloat(process.env.SELL_SOLANA || "1");

export const DEFAULT_TOKEN = {
  'SOL': new Currency(9, 'SOL', 'SOL'),
  'WSOL': new Token(TOKEN_PROGRAM_ID, new PublicKey('So11111111111111111111111111111111111111112'), 9, 'WSOL', 'WSOL'),
  'USDC': new Token(TOKEN_PROGRAM_ID, new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), 6, 'USDC', 'USDC'),
  'RAY': new Token(TOKEN_PROGRAM_ID, new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'), 6, 'RAY', 'RAY'),
  'RAY_USDC-LP': new Token(TOKEN_PROGRAM_ID, new PublicKey('FGYXP4vBkMEtKhxrmEBcWN8VNmXX8qNgEJpENKDETZ4Y'), 6, 'RAY-USDC', 'RAY-USDC'),
}