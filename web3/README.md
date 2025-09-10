# HackX Simplified Smart Contracts

## Overview

This is the simplified version of HackX smart contracts designed for hackathon-focused functionality with minimal on-chain data and IPFS integration.

## Contract Architecture

### 1. SimpleHackathonFactory.sol

- **Purpose**: Factory contract for creating individual hackathon instances
- **Key Features**:
  - Create hackathons with IPFS metadata
  - Owner-only access control
  - Track all created hackathons
  - Event emission for frontend indexing

### 2. SimpleHackathon.sol

- **Purpose**: Individual hackathon contract with basic phase management
- **Key Features**:
  - Phase management (REGISTRATION → SUBMISSION → JUDGING → COMPLETED)
  - Participant registration
  - Judge management
  - Winner designation (no automatic payouts)
  - Pause/unpause functionality

### 3. SimpleProjectRegistry.sol

- **Purpose**: Project submission tracking with IPFS metadata
- **Key Features**:
  - Project creation with IPFS hash
  - Team member management
  - Submission validation
  - Phase-based restrictions

### 4. SimpleJudgeRegistry.sol

- **Purpose**: Basic judge assignment and scoring system
- **Key Features**:
  - Judge invitation and acceptance
  - Score submission (1-100 per project)
  - Winner calculation (highest average score)
  - IPFS feedback storage

## Data Storage Strategy

### On-Chain (Minimal)

- Contract addresses and IDs
- Phase states and timestamps
- Participant/judge registrations
- Scores and winner designations
- Basic validation data

### IPFS (Comprehensive)

- Hackathon metadata (description, rules, dates, prizes)
- Project details (description, repo, demo, tech stack)
- Judge feedback and detailed evaluations
- Rich media (images, videos, documents)

## Key Simplifications

### ✅ Kept Essential Features

- Hackathon creation and management
- Project submission and display
- Judge assignment and scoring
- Winner determination
- Wallet authentication
- IPFS content management

### ❌ Removed Complex Features

- Automated fund distribution and escrow
- Multi-signature requirements
- Quadratic voting systems
- Judge reputation tracking
- Conflict of interest detection
- Complex evaluation criteria
- Performance monitoring

## Usage Flow

### 1. Organizer Creates Hackathon

```solidity
// Deploy via factory
factory.createHackathon("QmHackathonMetadataHash");
```

### 2. Participants Register

```solidity
// Register for hackathon
hackathon.registerParticipant();
```

### 3. Projects Submitted

```solidity
// Create and submit project
projectRegistry.createProject("QmProjectMetadataHash", hackathonId, teamMembers);
projectRegistry.submitProject(projectId);
```

### 4. Judges Score Projects

```solidity
// Submit scores
judgeRegistry.submitScore(hackathonId, projectId, score, "QmFeedbackHash");
```

### 5. Winners Calculated

```solidity
// Calculate and designate winner
judgeRegistry.calculateWinner(hackathonId, categoryId);
```

## IPFS Metadata Schemas

### Hackathon Metadata

```json
{
  "name": "Hackathon Name",
  "description": "Description",
  "startDate": "timestamp",
  "endDate": "timestamp",
  "submissionDeadline": "timestamp",
  "judgingDeadline": "timestamp",
  "website": "url",
  "prizes": ["Prize 1", "Prize 2"],
  "categories": ["Category 1", "Category 2"],
  "rules": "Rules text",
  "image": "ipfs://hash"
}
```

### Project Metadata

```json
{
  "name": "Project Name",
  "description": "Project description",
  "repositoryUrl": "github.com/...",
  "demoUrl": "demo.com",
  "techStack": ["React", "Node.js"],
  "category": "Web3",
  "images": ["ipfs://hash1", "ipfs://hash2"],
  "video": "ipfs://video_hash",
  "teamMembers": [{ "address": "0x...", "name": "John", "role": "Developer" }]
}
```

### Judge Feedback

```json
{
  "projectId": 123,
  "judgeAddress": "0x...",
  "score": 85,
  "feedback": "Great project with solid implementation",
  "category": "Best Overall",
  "timestamp": "..."
}
```

## Deployment

### Compile Contracts

```bash
cd web3
npm install
npx hardhat compile
```

### Deploy to Network

```bash
npx hardhat run scripts/deploy-simple.ts --network <network>
```

## Gas Optimization

- Minimal on-chain storage
- Batch operations where possible
- Efficient data structures
- OpenZeppelin optimized contracts

## Security Features

- ReentrancyGuard on state-changing functions
- Ownable access control
- Input validation
- Phase-based restrictions
- Participant verification

## Integration Points

### Frontend Integration

- Thirdweb SDK for contract interactions
- IPFS pinning service for metadata
- Wallet connection via Thirdweb Connect
- Event listening for real-time updates

### Required Frontend Hooks

- `useHackathonContract.ts`
- `useProjectContract.ts`
- `useJudgeContract.ts`
- `useIPFS.ts`

## Development Timeline

- **Week 1-2**: Smart contract development ✅
- **Week 3**: Judge system integration
- **Week 4**: IPFS integration
- **Week 5**: Frontend updates

## Contract Addresses (After Deployment)

```
SimpleHackathonFactory: 0x...
SimpleProjectRegistry: 0x...
SimpleJudgeRegistry: 0x...
```

This simplified architecture provides all essential hackathon functionality while being fast to develop and easy to integrate with existing frontend components.
