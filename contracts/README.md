![](https://img.shields.io/badge/Solidity-informational?style=flat\&logo=solidity\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/Foundry-informational?style=flat\&logo=ethereum\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/Forge-informational?style=flat\&logo=fire\&logoColor=white\&color=6aa6f8)


# PayAnyWhere Smart Contracts

This repository contains the Solidity smart contracts for the PayAnyWhere payment ecosystem. The contracts enable cross-chain payments, fee collection, and optional yield strategies for merchants using LayerZero and OFT (Omnichain Fungible Token) primitives.

## Main Contracts

- **PayAnyWhereFeeComposer.sol** — Receives USDC cross-chain payments, to a composer contract in polygon that takes a configurable fee (in basis points), sends the fee to the PayAnyWhere treasury, and supplies both fee and net amount to Aave for yield. 

## Deployed Address on Polygon mainnet

[0x9589b37aB31d25D1cB8677064ac19b5b83CB334D](https://polygonscan.com/address/0x9589b37aB31d25D1cB8677064ac19b5b83CB334D)

## Technologies Used

- **Solidity** — Smart contract language (v0.8.20+)
- **Foundry** — Build, test, deploy, and script automation
- **LayerZero** — StargatePool for USDC and Omnichain Composer
- **OFT (Omnichain Fungible Token)** — LayerZero's cross-chain token standard
- **Aave V3** — Optional yield supply for received payments
- **OpenZeppelin** — ERC20 and SafeERC20 libraries

## Payment Flow

1. **Sender** calls OFT `send` with a compose payload (using PayAnyWhereSender script), specifying the recipient and amount.
2. **PayAnyWhereFeeComposer** receives the compose message, validates the endpoint, calculates the fee, and sends the fee to the PayAnyWhere treasury.
3. If configured, both fee and net amount are supplied to Aave for yield; otherwise, tokens are transferred directly.
4. Events are emitted for both direct payments and Aave supply actions.

## Example Usage

### Dry-run and Broadcast

You can use the sender script to quote the payment and fee before sending:

```bash
forge script script/PayAnyWhereSender.s.sol:PayAnyWhereSenderScript --rpc-url $ETHEREUM_RPC_URL --chain-id 1 --private-key $PRIVATE_KEY
```

To broadcast the transaction, set `DO_BROADCAST=true` in your `.env` file.

### Deploy Fee Composer

```bash
forge script script/DeployPayAnyWhereFeeComposer.s.sol:DeployPayAnyWhereFeeComposerScript --rpc-url $ETHEREUM_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

## Project Structure

```
contracts/
├── src/                    # Solidity sources
│   ├── PayAnyWhereFeeComposer.sol
├── script/                 # Deployment & automation scripts
│   ├── PayAnyWhereSender.s.sol
│   └── DeployPayAnyWhereFeeComposer.s.sol
├── test/                   # Unit and integration tests
│   └── PayAnyWhereFeeComposer.t.sol
├── lib/                    # External dependencies (LayerZero, OpenZeppelin, Aave)
├── foundry.toml            # Foundry configuration
└── .env                    # Environment variables
```

## Environment Variables

Configure your `.env` file with:

```
PRIVATE_KEY=your_wallet_private_key
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_key
STARGATE_POOL=0x...
COMPOSER=0x...
AMOUNT_LD=1000000000000000000
PAYANYWHERE=0x...
AAVE_POOL=0x...
FEE_BPS=100
DO_BROADCAST=true
```

## Tech Stack

* **Framework:** [Foundry](https://book.getfoundry.sh/)
* **Language:** [Solidity](https://soliditylang.org/)
* **Testing:** Forge (`forge test`)
* **Deployment & scripting:** Forge / Cast (`forge script`, `cast send`)
* **Networks:** EVM-compatible chains (Scroll, Base, Arbitrum, etc.)