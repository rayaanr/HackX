# HackX

**Trustless. Transparent. Unstoppable hackathons on IPFS and Smart Contracts.**

[hackx.rayaanr.com](https://hackx.rayaanr.com)

HackX is a decentralized hackathon platform that leverages blockchain technology and IPFS for transparent, trustless hackathon management. Organizers can create hackathons, participants can submit projects, and judges can evaluate submissions, all powered by smart contracts.

## ✨ Features

- 🏗️ **Smart Contract Based**: Fully decentralized hackathon management
- 📁 **IPFS Storage**: Decentralized storage for hackathon and project data
- 🎯 **Multi-role Support**: Organizers, participants, and judges
- 🗳️ **Transparent Judging**: On-chain scoring and feedback system
- 👥 **Team Management**: Collaborative project development
- 🕒 **Time-gated Phases**: Registration → Submission → Judging
- 🔐 **Wallet Integration**: Browser Wallet and Web3 authentication


## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) (v1.0+) or Node.js (v20+)
- Browser extension (MetaMask / Rabby Wallet / etc.)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/rayaanr/HackX.git
cd HackX

# Install dependencies
bun install

# Start development server
bun dev
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CONTRACT_ADDRESS=your_smart_contract_address
NEXT_PUBLIC_BASE_URL=https://hackx.rayaanr.com/
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.basescan.org/
```

### Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Create `HackX.sol` and copy contents from `contract.sol`
3. Compile with Solidity 0.8.28+
4. Deploy to Base Sepolia testnet
5. Copy the contract address to your `.env.local`

> 📖 For detailed deployment instructions, see [SETUP.md](./SETUP.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Web3**: thirdweb SDK, MetaMask integration
- **Smart Contracts**: Solidity, OpenZeppelin
- **Blockchain**: Base Sepolia Network
- **Storage**: IPFS (via ThirdWeb SDK)
- **UI Components**: ShadCN UI, Lucide Icons
- **Package Manager**: Bun
- **Code Quality**: Biome (linting & formatting)

## 📖 How It Works

### For Organizers
1. Create hackathon with metadata stored on IPFS
2. Set registration, submission, and judging periods
3. Add judges to evaluate submissions
4. Monitor participation and results

### For Participants
1. Register for active hackathons
2. Create projects with team collaboration
3. Submit projects during submission period

### For Judges
1. Accept judge assignments from organizers
2. Evaluate submitted projects during judging period
3. Provide scores and feedback via IPFS

## 🏗️ Project Structure

```
HackX/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── constants/           # Configuration constants
│   ├── data/               # Mock data and utilities
│   └── hooks/              # Custom React hooks
├── public/                 # Static assets
├── contract.sol           # HackX smart contract
├── SETUP.md              # Detailed setup guide
└── package.json          # Dependencies
```


## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.


**Built with ❤️ for the Web3 community**