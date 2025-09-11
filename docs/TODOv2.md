# HackX Simplified: Core Hackathon Platform TODOv2

## 🎯 Core Philosophy

- **Hackathon-first approach**: Focus only on essential hackathon functions
- **IPFS-heavy**: Store all metadata on IPFS, minimal on-chain validation data
- **Simple contracts**: Basic validation and state management only
- **No complex fund distribution**: Simple winner designation without automated payouts

## 📊 Simplified Progress Overview

- **Total Points**: 65 (vs 170 in v1)
- **Core Functions**: Hackathon creation, project submission, judge scoring
- **Focus**: MVP for hackathon functionality without complex financial features

## Epic 1: Simplified Smart Contracts (25 points)

### Story 1.1: SimpleHackathonFactory.sol (8 points)

**Description**: Minimal factory for creating hackathons
**Tasks**:

- [ ] Basic `createHackathon(string ipfsHash)` function
- [ ] Simple organizer role (only owner can create hackathons)
- [ ] Event emission for frontend indexing
- [ ] Track hackathon addresses and IDs
- [ ] No complex access control or global settings

**On-chain Data**:

```solidity
struct Hackathon {
    uint256 id;
    address organizer;
    string ipfsHash;  // All hackathon details stored here
    address hackathonContract;
    uint256 createdAt;
}
```

**IPFS Metadata**:

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

### Story 1.2: SimpleHackathon.sol (10 points)

**Description**: Individual hackathon with basic phase management
**Tasks**:

- [ ] Basic phase enum: `REGISTRATION`, `SUBMISSION`, `JUDGING`, `COMPLETED`
- [ ] Phase progression based on timestamps from IPFS metadata
- [ ] Simple participant registration (add wallet to mapping)
- [ ] Winner designation (no automatic payouts)
- [ ] Emergency pause functionality

**On-chain Data**:

```solidity
enum Phase { REGISTRATION, SUBMISSION, JUDGING, COMPLETED }

struct HackathonData {
    string ipfsHash;
    Phase currentPhase;
    mapping(address => bool) participants;
    mapping(uint256 => address) winners; // categoryId => winner
    address[] judgesList;
    bool isPaused;
}
```

### Story 1.3: SimpleProjectRegistry.sol (7 points)

**Description**: Basic project submission tracking
**Tasks**:

- [ ] Submit project with IPFS hash only
- [ ] Team member tracking (simple address array)
- [ ] Submission validation (check hackathon phase and participant status)
- [ ] No duplicate IPFS hash prevention
- [ ] Basic project listing by hackathon

**On-chain Data**:

```solidity
struct Project {
    uint256 id;
    string ipfsHash;  // All project data stored here
    address creator;
    uint256 hackathonId;
    address[] teamMembers;
    uint256 submittedAt;
    bool isSubmitted;
}
```

**IPFS Project Metadata**:

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
  "teamMembers": [
    { "address": "0x...", "name": "John", "role": "Developer" },
    { "address": "0x...", "name": "Jane", "role": "Designer" }
  ]
}
```

## Epic 2: Simplified Judge System (15 points)

### Story 2.1: SimpleJudgeRegistry.sol (8 points)

**Description**: Basic judge assignment and scoring
**Tasks**:

- [ ] Judge invitation by hackathon organizer
- [ ] Judge acceptance (simple boolean)
- [ ] Score submission (1-100 score per project per category)
- [ ] Basic winner calculation (highest score wins)
- [ ] No complex criteria or weighted scoring

**On-chain Data**:

```solidity
struct Judge {
    address wallet;
    bool isAccepted;
    mapping(uint256 => mapping(uint256 => uint256)) scores; // hackathonId => projectId => score
    mapping(uint256 => bool) hasEvaluated; // hackathonId => evaluated
}

struct JudgingResult {
    uint256 projectId;
    uint256 totalScore;
    uint256 judgeCount;
}
```

### Story 2.2: Basic Scoring System (7 points)

**Description**: Simple scoring without complex calculations
**Tasks**:

- [ ] Submit score (1-100) for each project
- [ ] Calculate average score across judges
- [ ] Determine winner per category (highest average)
- [ ] Store winner designation on-chain
- [ ] No reputation system or complex consensus

**IPFS Judge Feedback**:

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

## Epic 3: IPFS Integration (10 points)

### Story 3.1: IPFS Content Management (5 points)

**Description**: Basic IPFS upload and retrieval
**Tasks**:

- [ ] Upload hackathon metadata to IPFS
- [ ] Upload project submissions to IPFS
- [ ] Upload judge feedback to IPFS
- [ ] Simple IPFS hash validation (check format)
- [ ] Basic error handling for IPFS operations

### Story 3.2: Frontend IPFS Integration (5 points)

**Description**: Connect frontend to IPFS content
**Tasks**:

- [ ] IPFS content fetching with loading states
- [ ] Cache IPFS content in browser storage
- [ ] Handle IPFS gateway failures (try multiple gateways)
- [ ] Upload forms for hackathons and projects
- [ ] Display IPFS content in UI components

## Epic 4: Frontend Integration (15 points)

### Story 4.1: Wallet Connection (5 points)

**Description**: Basic wallet connection with Thirdweb
**Tasks**:

- [ ] Connect wallet with Thirdweb Connect
- [ ] Support MetaMask and WalletConnect
- [ ] Basic session management
- [ ] Display connected wallet address
- [ ] Disconnect functionality

### Story 4.2: Contract Interactions (5 points)

**Description**: Basic contract interaction hooks
**Tasks**:

- [ ] Create hackathon (organizer only)
- [ ] Register for hackathon
- [ ] Submit project
- [ ] Submit scores (judges only)
- [ ] View hackathons and projects

### Story 4.3: UI Updates (5 points)

**Description**: Update existing UI for blockchain
**Tasks**:

- [ ] Update forms to submit transactions
- [ ] Add transaction status indicators
- [ ] Show gas costs and confirmations
- [ ] Handle transaction errors gracefully
- [ ] Display IPFS content loading states

## Removed Features (Simplified Approach)

### ❌ Removed from v1:

- Complex fund management and escrow
- Automated prize distribution
- Multi-signature requirements
- Quadratic voting system
- Judge reputation system
- Conflict of interest detection
- Complex evaluation criteria
- Emergency withdrawal mechanisms
- Comprehensive access control
- Performance monitoring
- Load testing requirements

### ✅ Core Features Kept:

- Hackathon creation and management
- Project submission and display
- Judge assignment and scoring
- Basic winner determination
- IPFS metadata storage
- Wallet authentication
- Transaction management

## Implementation Priority

1. **Phase 1 (Week 1-2)**: Smart Contracts

   - SimpleHackathonFactory.sol
   - SimpleHackathon.sol
   - SimpleProjectRegistry.sol

2. **Phase 2 (Week 3)**: Judge System

   - SimpleJudgeRegistry.sol
   - Basic scoring implementation

3. **Phase 3 (Week 4)**: IPFS Integration

   - Upload/download functionality
   - Frontend integration

4. **Phase 4 (Week 5)**: Frontend Updates
   - Wallet connection
   - Contract interactions
   - UI updates

## Success Criteria

- [ ] Organizers can create hackathons with IPFS metadata
- [ ] Participants can register and submit projects
- [ ] Judges can score projects and determine winners
- [ ] All metadata stored on IPFS with minimal on-chain validation
- [ ] Simple, functional hackathon platform without complex features
- [ ] Fast development suitable for hackathon timeline

## File Structure

```
web3/contracts/
├── SimpleHackathonFactory.sol
├── SimpleHackathon.sol
├── SimpleProjectRegistry.sol
└── SimpleJudgeRegistry.sol

src/hooks/
├── useHackathonContract.ts
├── useProjectContract.ts
└── useJudgeContract.ts

src/lib/
├── ipfs.ts
└── contracts.ts
```

This simplified approach focuses on the essential hackathon functionality while leveraging IPFS for metadata storage and maintaining minimal on-chain state for validation purposes.
