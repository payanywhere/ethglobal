![](https://img.shields.io/badge/Bun-informational?style=flat\&logo=bun\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/TypeScript-informational?style=flat\&logo=typescript\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/Biome-informational?style=flat\&logo=eslint\&logoColor=white\&color=6aa6f8)

# PayAnyWhere Backend

## Overview

This backend is part of the PayAnyWhere monorepo and provides:

* RESTful **APIs** for merchant and client interactions.
* Integration with **smart contracts** for crypto transactions.
* Optional connections to external payment providers such as Mercado Pago.
* A **non-custodial** design: users pay directly from their wallets to the merchant’s wallet.
* A **Clean Architecture** structure ensuring maintainability, scalability, and separation of concerns.

## Tech Stack

* **Runtime:** [Bun](https://bun.sh/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Formatter & Linter:** [Biome](https://biomejs.dev/)
* **Package Manager:** Bun
* **Architecture:** REST API with modular controllers and services

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Run the Server

```bash
bun run dev
```

Server runs by default on [http://localhost:3001](http://localhost:3001)

### 3. Build for Production

```bash
bun run build
```

### 4. Run Production Server

```bash
bun run start
```

## Code Quality

Code formatting and linting are managed with **Biome**.

### Commands

```bash
yarn biome
yarn biome:fix
```