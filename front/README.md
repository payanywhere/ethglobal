![](https://img.shields.io/badge/Next.js-informational?style=flat\&logo=next.js\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/TypeScript-informational?style=flat\&logo=typescript\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/TailwindCSS-informational?style=flat\&logo=tailwindcss\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/Biome-informational?style=flat\&logo=eslint\&logoColor=white\&color=6aa6f8)
![](https://img.shields.io/badge/React.js-informational?style=flat\&logo=react\&logoColor=white\&color=6aa6f8)

# PayAnyWhere Frontend

## Overview

This frontend is part of the PayAnyWhere monorepo and provides:

* A **merchant dashboard** for managing payments and balances.
* A **client payment interface** for scanning QR codes and completing transactions.
* A consistent, responsive design built with **Next.js**, **TypeScript**, and **TailwindCSS**.

![Diagram](.doc/resources/diagram.png)

## Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [TailwindCSS](https://tailwindcss.com/)
* **Formatter & Linter:** [Biome](https://biomejs.dev/)
* **Package Manager:** Yarn
* **Build Output:** Standalone (for container deployment)

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Run the App

```bash
yarn dev
```

Visit: [http://localhost:3000](http://localhost:3000)


## Code Quality

Code formatting and linting are managed with **Biome**.

### Commands

```bash
yarn biome
yarn biome:fix
```