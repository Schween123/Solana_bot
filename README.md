# Katas ng miming bot

## About the project
This project is from [RAYDIUM SDK](https://github.com/raydium-io/raydium-sdk) Trading Bot template

## Getting Started
### Installation

`npm install`

This will install the dependencies for running the bot

### Prerequisites
Modify .env to your configuration

-RPC_PROVIDER=https://mainnet.helius-rpc.com/?api-key=a0c13b4e-99bc-44dd-858d-d0272b46f31c   
: your rpc provider

-PRIVATE_KEY="private key here"                                                              
: Your private key
-POOL_ADDRESS=                                   
: The default is USDC to SOL pool address

-BUY_SOLANA = 0.01 #dollar value of increase in price for buying                             
: in dollars 

-SELL_SOLANA = 0.05 #dollar value of decrease in price for selling                            
: in dollars

-AMOUNT_TO_BUY = 100

### Usage

- `npm run build` build the scripts
- `npm run swapBot` run the trading bot example


