# PayAnyWhere

Get paid in any token, on any chain. Settle in one network, one token. Fully non-custodial.

PayAnyWhere is a non-custodial, multi-chain payment layer that lets merchants accept crypto from any network or token while receiving everything in one unified settlement wallet.

## Problem

At international events — especially within the crypto ecosystem — attendees often hold funds in cryptocurrencies or stablecoins instead of the host country's fiat. This creates friction for ticketing, merchandise, and on-site purchases: cards may not work, conversions are cumbersome, and merchants face complexity.

## Our Solution

PayAnyWhere provides a trustless checkout experience:

- Merchants create a payment request in USD and the system generates a QR code.
- Customers pay with fiat or any compatible crypto asset on their preferred chain.
- On-chain: the protocol swaps the incoming token to USDC, bridges the funds to Polygon (LayerZero / Stargate), splits the payment (99% merchant / 1% protocol), and deposits both shares into Aave.
- All execution is performed by smart contracts with zero custody — merchants keep sovereign control of their settlement wallet while benefiting from unified balances and yield.

This stitches swap, bridge, settlement, wallet, and yield layers into a single, modular, non-custodial pipeline — simple for users, decentralized under the hood.

## Contributors

* [@mpefaur](https://github.com/mpefaur)
* [@TomasDmArg](https://github.com/TomasDmArg)
* [@raiseerco](https://github.com/raiseerco)
* [@magehernan](https://github.com/magehernan)

## Development Setup

This project follows a **monorepo** architecture with four main components: **Backend**, **Frontend**, **Infrastructure**, and **Smart Contracts**.
All components share a unified CI/CD workflow managed through **Google Cloud Build**.

### 1. Clone the Repository

```bash
git clone https://github.com/payanywhere/ethglobal payanywhere
cd payanywhere
```

## Smart Contracts

Located in the `/contracts` directory.
Contains the **Solidity** smart contracts that handle on-chain operations for the PayAnyWhere ecosystem.

These contracts include:

* **PaymentConsolidator.sol** — aggregates approved merchant payments and allows consolidation into a single network and token.

Contracts are deployed on **EVM-compatible networks** such as Scroll, Base, and Arbitrum, and interact directly with the backend through verified contract interfaces.

See [Contracts README](contracts/README.md) for build, test, and deployment instructions.


## Backend

Located in the `/back` directory.
Implements a **Clean Architecture** API built with **Bun** and **TypeScript**, exposing endpoints for merchants, clients, and smart contract integrations.

See [Backend README](back/README.md) for setup and details.

## Frontend

Located in the `/front` directory.
A **Next.js + TypeScript + TailwindCSS** application that includes:

* A merchant dashboard for managing payments and balances.
* A client interface for scanning QR codes and completing transactions.

See [Frontend README](front/README.md) for setup and details.

---

## Infrastructure

Located in the `/infra` directory.
Manages GCP environments and resources using **Terraform**, including:

* Cloud Run services for backend and frontend.
* Cloud Build pipelines for automated deployments.
* Environment separation for dev, test, and prod.

See [Infrastructure README](infra/README.md) for setup and environment structure.

## Architecture Overview

- **Backend**: TypeScript (Bun/Express) hosted on GCP. Orchestrates API operations, merchant profiles, orders, and QR sessions. Uses MongoDB for persistent data.
- **Frontend**: Next.js + TypeScript + Tailwind. Generates dynamic QR codes, provides the checkout UI and wallet integrations.
- **Wallets**: Optional embedded non-custodial wallets (Dynamic) to enable self-custody inside the UX.
- **Smart Contracts**: Built with Foundry (Solidity). Use LayerZero + Stargate for bridging and CDP Trade API for on-chain swaps to USDC.
- **Settlement**: On Polygon the Compose contract receives bridged USDC, applies a fee split, and deposits both shares into Aave for yield.

## Repo Layout

- `contracts/` — Solidity contracts and Foundry config.
- `back/` — Backend API (Bun + TypeScript).
- `front/` — Next.js frontend.
- `infra/` — Terraform and deployment configs for GCP.

## Quick Start (developer)

Clone and open the repository, then follow the relevant README for each subproject. Example:

```pwsh
# clone repo
git clone https://github.com/payanywhere/ethglobal.git
cd ethglobal

# backend (see back/README.md for full instructions)
cd back
# install dependencies with bun
bun install

# frontend (see front/README.md for full instructions)
cd ../front
bun install
```

See `back/README.md`, `front/README.md`, `contracts/README.md`, and `infra/README.md` for detailed setup, tests and deployment instructions.

## Key Concepts

- **Non-custodial**: the protocol never holds merchant funds — smart contracts and user wallets handle funds directly.
- **Unified Settlement**: merchants receive a single, yield-bearing USDC balance on Polygon.
- **Cross-chain**: users can pay from different chains/tokens — the system swaps and bridges automatically.

## Contributors

See the `CONTRIBUTORS` file or the repo git history for the full list of contributors.

## License

See repository/license files for licensing information.
