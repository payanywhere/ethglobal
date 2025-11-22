![](https://img.shields.io/badge/Solidity-informational?style=flat\&logo=solidity\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/Foundry-informational?style=flat\&logo=ethereum\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/Forge-informational?style=flat\&logo=fire\&logoColor=white\&color=6aa6f8)

# PayAnyWhere Smart Contracts

The **contracts** directory contains all Solidity smart contracts that power the PayAnyWhere on-chain payment ecosystem.
These contracts handle merchant registration, consolidated payments, and optional NFT receipts for transactions.



## Overview

* **PaymentConsolidator.sol** — consolidates merchant payments and routes them to the selected token or network.

All contracts are written in **Solidity**, and are compiled, tested, and deployed using **Foundry**.


## Tech Stack

* **Framework:** [Foundry](https://book.getfoundry.sh/)
* **Language:** [Solidity](https://soliditylang.org/)
* **Testing:** Forge (`forge test`)
* **Deployment & scripting:** Forge / Cast (`forge script`, `cast send`)
* **Networks:** EVM-compatible chains (Scroll, Base, Arbitrum, etc.)

## Getting Started

### 1. Install Foundry

If you don’t have Foundry installed yet:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Then verify installation:

```bash
forge --version
cast --version
```


### 2. Initialize Project

If you’re cloning the repo, skip this.
Otherwise, create a new Foundry scaffold:

```bash
forge init payanywhere-contracts
cd payanywhere-contracts
```


### 3. Install Dependencies

Install standard libraries (e.g. forge-std, OpenZeppelin):

```bash
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
```


### 4. Build Contracts

```bash
forge build
```


### 5. Run Tests

```bash
forge test -vvv
```

You can run specific tests:

```bash
forge test --match-test testPaymentFlow
```

### 6. Deploy Contracts

Deploy to a testnet (example: Scroll Sepolia):

```bash
forge script script/Counter.s.sol:CounterScript \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```


### 7. Verify Contracts (optional)

```bash
forge verify-contract <DEPLOYED_CONTRACT_ADDRESS> \
  src/PaymentConsolidator.sol:PaymentConsolidator \
  --chain-id 534351 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## Project Structure

```
contracts/
├── lib/                    # External dependencies (forge install)
├── script/                 # Deployment & automation scripts
│   └── Deploy.s.sol
├── src/                    # Solidity sources
│   └── PaymentConsolidator.sol
├── test/                   # Unit and integration tests
│   └── PaymentConsolidator.t.sol
├── foundry.toml            # Foundry configuration
└── .env                    # Environment variables (optional)
```

## Environment Variables

You can configure network and account settings in `.env`:

```
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://scroll-sepolia.blockpi.network/v1/rpc/public
ETHERSCAN_API_KEY=your_etherscan_key
```


## Useful Commands

| Action       | Command                                        |
| ------------ | ---------------------------------------------- |
| Build        | `forge build`                                  |
| Test         | `forge test -vvv`                              |
| Format       | `forge fmt`                                    |
| Deploy       | `forge script script/Deploy.s.sol --broadcast` |
| Estimate Gas | `forge test --gas-report`                      |
