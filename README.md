# PayAnyWhere

This repository contains the full source code for the **PayAnyWhere** project.

**PayAnyWhere** is a hybrid payment platform designed to connect merchants, clients, and blockchain smart contracts.
It enables seamless fiat and crypto payments for global events through a unified API, merchant dashboard, and client payment interface.

## Contributors

* [@dappsar](https://github.com/dappsar)
* [@mpefaur](https://github.com/mpefaur)
* [@TomasDmArg](https://github.com/TomasDmArg)
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
