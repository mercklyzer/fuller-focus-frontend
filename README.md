# Next.js 16 Application

This repository contains a **Next.js 16** application.

## Demo
https://drive.google.com/file/d/1aWwSwAVXjrsvUEW68D7aydEr1UenoC2d/view?usp=drive_link

The instructions below will guide you through setting up your local development environment, installing dependencies, and running the project in development mode.

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **NVM (Node Version Manager)**
- **Node.js** (managed via NVM)
- **npm** or **Yarn**

---

## 1. Install NVM (Node Version Manager)

NVM allows you to manage multiple Node.js versions easily.

### macOS / Linux

Run the following command in your terminal:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Restart your terminal and verify that nvm is installed via `nvm --version`

Install node by typing

```bash
nvm install --lts
nvm use --lts
```

Verify installtion using

```bash
node --version
npm --version
```

Install the dependencies via `npm install`. You may also use yarn if you wish.

Run `npm run dev -p 3001`. Or using yarn `yarn dev -p 3001`. We are exposing the frontend in port 3001 because port 3000 is used by the backend.
