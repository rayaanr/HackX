# HackX Setup Guide

## Prerequisites

- **Bun** (v1.0+) or **Node.js** (v20+)
- **MetaMask / Rabby Wallet / etc.** browser extension
- **Git**



## Quick Start

```bash
git clone https://github.com/rayaanr/HackX.git
cd HackX
bun install
```



## Smart Contract Deployment (Remix IDE)

### Step 1: Open Remix

Go to [remix.ethereum.org](https://remix.ethereum.org/)

### Step 2: Create Contract File

1. Click **"+"** icon → Create `HackX.sol`
2. Copy entire contents from `contract.sol` in your project
3. Remix will auto-import OpenZeppelin dependencies

### Step 3: Compile

1. Click **"Solidity Compiler"** icon (left sidebar)
2. Select compiler **0.8.28** or higher
3. Click **"Compile HackX.sol"**
4. Ensure green checkmark appears

### Step 4: Deploy

1. Click **"Deploy & Run Transactions"** icon
2. Set **Environment** to **"Injected Provider - MetaMask"**
3. Select **"HackX"** contract from dropdown
4. Click **"Deploy"**
5. Confirm transaction in MetaMask
6. **Save the contract address!**



## Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_smart_contract_address
NEXT_PUBLIC_BASE_URL=https://hackx.rayaanr.com/
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.basescan.org/
```

### Get API Keys

**Thirdweb:** [thirdweb.com/dashboard](https://thirdweb.com/dashboard) → Create project → Copy Client ID


## Run Application

```bash
bun dev          # Development at localhost:3000
bun run build    # Production build
bun start        # Production server
```



## Testnet ETH

Get test ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)
