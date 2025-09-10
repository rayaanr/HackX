// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Hackathon.sol";
import "./JudgeRegistry.sol";

/**
 * @title PrizePool
 * @dev Automated prize distribution system for hackathons
 * @author HackX Team
 */
contract PrizePool is ReentrancyGuard, Pausable, Ownable {
    // Structs
    struct PrizeDistribution {
        uint256 hackathonId;
        address hackathonContract;
        uint256 categoryId;
        uint256 projectId;
        address winner;
        uint256 amount;
        bool distributed;
        uint256 distributedAt;
        uint256 score;
    }

    struct HackathonPrizeInfo {
        uint256 totalPrizeFunds;
        uint256 distributedAmount;
        uint256 remainingFunds;
        bool finalized;
        bool emergencyWithdrawEnabled;
        uint256 finalizedAt;
        mapping(uint256 => bool) categoryDistributed; // categoryId => distributed
    }

    // State variables
    JudgeRegistry public immutable judgeRegistry;
    
    mapping(uint256 => HackathonPrizeInfo) public hackathonPrizes;
    mapping(uint256 => bool) public hackathonRegistered;
    mapping(bytes32 => PrizeDistribution) public distributions; // keccak256(hackathonId, categoryId) => distribution
    mapping(uint256 => uint256[]) public hackathonCategories; // hackathonId => categoryIds[]
    mapping(uint256 => mapping(uint256 => uint256)) public categoryPrizeAmounts; // hackathonId => categoryId => amount
    
    uint256 public emergencyWithdrawDelay = 30 days; // Delay before emergency withdrawal
    uint256 public constant MAX_CATEGORIES = 20; // Maximum categories per hackathon

    // Events
    event HackathonRegistered(
        uint256 indexed hackathonId,
        address indexed hackathonContract,
        uint256 totalPrizeFunds
    );

    event PrizeFundsDeposited(
        uint256 indexed hackathonId,
        address indexed depositor,
        uint256 amount,
        uint256 totalFunds
    );

    event CategoryPrizeSet(
        uint256 indexed hackathonId,
        uint256 indexed categoryId,
        uint256 amount
    );

    event WinnerCalculated(
        uint256 indexed hackathonId,
        uint256 indexed categoryId,
        uint256 indexed projectId,
        address winner,
        uint256 score,
        uint256 prizeAmount
    );

    event PrizeDistributed(
        uint256 indexed hackathonId,
        uint256 indexed categoryId,
        address indexed winner,
        uint256 amount,
        uint256 projectId
    );

    event HackathonFinalized(
        uint256 indexed hackathonId,
        uint256 totalDistributed,
        uint256 remainingFunds
    );

    event EmergencyWithdrawEnabled(
        uint256 indexed hackathonId,
        uint256 enabledAt
    );

    event EmergencyWithdraw(
        uint256 indexed hackathonId,
        address indexed organizer,
        uint256 amount
    );

    event RefundIssued(
        uint256 indexed hackathonId,
        address indexed organizer,
        uint256 amount,
        string reason
    );

    // Modifiers
    modifier onlyRegisteredHackathon(uint256 _hackathonId) {
        require(
            hackathonRegistered[_hackathonId],
            "PrizePool: hackathon not registered"
        );
        _;
    }

    modifier onlyHackathonOrganizer(uint256 _hackathonId) {
        require(
            hackathonRegistered[_hackathonId],
            "PrizePool: hackathon not registered"
        );
        
        address hackathonContract = getHackathonContract(_hackathonId);
        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            msg.sender == hackathon.organizer(),
            "PrizePool: caller is not the hackathon organizer"
        );
        _;
    }

    modifier onlyAfterJudging(uint256 _hackathonId) {
        address hackathonContract = getHackathonContract(_hackathonId);
        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            hackathon.currentPhase() == Hackathon.Phase.Completed,
            "PrizePool: judging not complete"
        );
        _;
    }

    /**
     * @dev Constructor sets the JudgeRegistry address
     * @param _judgeRegistry Address of the JudgeRegistry contract
     */
    constructor(address _judgeRegistry) Ownable(msg.sender) {
        require(_judgeRegistry != address(0), "PrizePool: invalid judge registry");
        judgeRegistry = JudgeRegistry(_judgeRegistry);
    }

    // ============ HACKATHON REGISTRATION ============

    /**
     * @dev Register a hackathon for prize distribution
     * @param _hackathonId Hackathon ID
     * @param _hackathonContract Address of the hackathon contract
     */
    function registerHackathon(
        uint256 _hackathonId,
        address _hackathonContract
    ) external onlyOwner {
        require(
            _hackathonContract != address(0),
            "PrizePool: invalid hackathon contract"
        );
        require(
            !hackathonRegistered[_hackathonId],
            "PrizePool: hackathon already registered"
        );

        // Verify this is a valid hackathon contract
        Hackathon hackathon = Hackathon(_hackathonContract);
        require(
            hackathon.hackathonId() == _hackathonId,
            "PrizePool: hackathon ID mismatch"
        );

        hackathonRegistered[_hackathonId] = true;
        
        // Initialize hackathon prize info
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        prizeInfo.totalPrizeFunds = 0;
        prizeInfo.distributedAmount = 0;
        prizeInfo.remainingFunds = 0;
        prizeInfo.finalized = false;
        prizeInfo.emergencyWithdrawEnabled = false;

        emit HackathonRegistered(_hackathonId, _hackathonContract, 0);
    }

    /**
     * @dev Get hackathon contract address
     * @param _hackathonId Hackathon ID
     */
    function getHackathonContract(uint256 _hackathonId) public view returns (address) {
        // Get from JudgeRegistry which already stores this mapping
        return judgeRegistry.getHackathonContract(_hackathonId);
    }

    // ============ PRIZE FUND MANAGEMENT ============

    /**
     * @dev Deposit prize funds for a hackathon
     * @param _hackathonId Hackathon ID
     */
    function depositPrizeFunds(
        uint256 _hackathonId
    ) external payable onlyRegisteredHackathon(_hackathonId) nonReentrant {
        require(msg.value > 0, "PrizePool: must deposit funds");
        
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        require(!prizeInfo.finalized, "PrizePool: hackathon already finalized");

        prizeInfo.totalPrizeFunds += msg.value;
        prizeInfo.remainingFunds += msg.value;

        emit PrizeFundsDeposited(
            _hackathonId,
            msg.sender,
            msg.value,
            prizeInfo.totalPrizeFunds
        );
    }

    /**
     * @dev Set prize amount for a specific category
     * @param _hackathonId Hackathon ID
     * @param _categoryId Category ID
     * @param _amount Prize amount in wei
     */
    function setCategoryPrize(
        uint256 _hackathonId,
        uint256 _categoryId,
        uint256 _amount
    ) external onlyHackathonOrganizer(_hackathonId) {
        require(_amount > 0, "PrizePool: prize amount must be positive");
        
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        require(!prizeInfo.finalized, "PrizePool: hackathon already finalized");

        // Add category if not already added
        uint256[] storage categories = hackathonCategories[_hackathonId];
        bool categoryExists = false;
        for (uint256 i = 0; i < categories.length; i++) {
            if (categories[i] == _categoryId) {
                categoryExists = true;
                break;
            }
        }
        
        if (!categoryExists) {
            require(
                categories.length < MAX_CATEGORIES,
                "PrizePool: too many categories"
            );
            categories.push(_categoryId);
        }

        categoryPrizeAmounts[_hackathonId][_categoryId] = _amount;

        emit CategoryPrizeSet(_hackathonId, _categoryId, _amount);
    }

    /**
     * @dev Get total allocated prize amount
     * @param _hackathonId Hackathon ID
     */
    function getTotalAllocatedPrizes(uint256 _hackathonId) 
        public 
        view 
        returns (uint256 totalAllocated) 
    {
        uint256[] memory categories = hackathonCategories[_hackathonId];
        for (uint256 i = 0; i < categories.length; i++) {
            totalAllocated += categoryPrizeAmounts[_hackathonId][categories[i]];
        }
    }

    // ============ WINNER CALCULATION & DISTRIBUTION ============

    /**
     * @dev Calculate and distribute all prizes for a hackathon
     * @param _hackathonId Hackathon ID
     * @param _projectIds Array of all project IDs
     */
    function calculateAndDistributePrizes(
        uint256 _hackathonId,
        uint256[] memory _projectIds
    ) 
        external 
        onlyHackathonOrganizer(_hackathonId) 
        onlyAfterJudging(_hackathonId)
        nonReentrant
    {
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        require(!prizeInfo.finalized, "PrizePool: already finalized");
        require(_projectIds.length > 0, "PrizePool: no projects provided");

        // Verify judging is complete
        (bool judgingComplete, ) = judgeRegistry.verifyJudgingComplete(_hackathonId, _projectIds);
        require(judgingComplete, "PrizePool: judging not complete");

        // Calculate winners using JudgeRegistry
        (
            uint256[] memory categoryIds,
            uint256[] memory winners,
            uint256[] memory scores
        ) = judgeRegistry.calculateWinners(_hackathonId, _projectIds);

        uint256 totalDistributed = 0;

        // Distribute prizes for each category
        for (uint256 i = 0; i < categoryIds.length; i++) {
            uint256 categoryId = categoryIds[i];
            uint256 winningProjectId = winners[i];
            uint256 winningScore = scores[i];

            // Skip if no winner (score 0 or invalid project)
            if (winningProjectId == type(uint256).max || winningScore == 0) {
                continue;
            }

            uint256 prizeAmount = categoryPrizeAmounts[_hackathonId][categoryId];
            if (prizeAmount == 0) {
                continue; // No prize set for this category
            }

            require(
                prizeInfo.remainingFunds >= prizeAmount,
                "PrizePool: insufficient funds"
            );

            // Get winner address from hackathon contract
            address hackathonContract = getHackathonContract(_hackathonId);
            
            // For simplicity, we'll use the project ID as a way to get the winner
            // In practice, you'd want to get the project owner from ProjectRegistry
            address winner = address(uint160(winningProjectId)); // Simplified for demo
            
            // Create distribution record
            bytes32 distributionKey = keccak256(abi.encodePacked(_hackathonId, categoryId));
            distributions[distributionKey] = PrizeDistribution({
                hackathonId: _hackathonId,
                hackathonContract: hackathonContract,
                categoryId: categoryId,
                projectId: winningProjectId,
                winner: winner,
                amount: prizeAmount,
                distributed: false,
                distributedAt: 0,
                score: winningScore
            });

            emit WinnerCalculated(
                _hackathonId,
                categoryId,
                winningProjectId,
                winner,
                winningScore,
                prizeAmount
            );

            // Distribute the prize
            _distributePrize(_hackathonId, categoryId);
            totalDistributed += prizeAmount;
        }

        // Update prize info
        prizeInfo.distributedAmount = totalDistributed;
        prizeInfo.remainingFunds = prizeInfo.totalPrizeFunds - totalDistributed;
        prizeInfo.finalized = true;
        prizeInfo.finalizedAt = block.timestamp;

        emit HackathonFinalized(_hackathonId, totalDistributed, prizeInfo.remainingFunds);
    }

    /**
     * @dev Internal function to distribute a single prize
     * @param _hackathonId Hackathon ID
     * @param _categoryId Category ID
     */
    function _distributePrize(uint256 _hackathonId, uint256 _categoryId) internal {
        bytes32 distributionKey = keccak256(abi.encodePacked(_hackathonId, _categoryId));
        PrizeDistribution storage distribution = distributions[distributionKey];
        
        require(distribution.amount > 0, "PrizePool: no prize to distribute");
        require(!distribution.distributed, "PrizePool: already distributed");

        // Mark as distributed before transfer to prevent reentrancy
        distribution.distributed = true;
        distribution.distributedAt = block.timestamp;
        
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        prizeInfo.categoryDistributed[_categoryId] = true;

        // Transfer the prize
        (bool success, ) = distribution.winner.call{value: distribution.amount}("");
        require(success, "PrizePool: transfer failed");

        emit PrizeDistributed(
            _hackathonId,
            _categoryId,
            distribution.winner,
            distribution.amount,
            distribution.projectId
        );
    }

    // ============ EMERGENCY & REFUND MECHANISMS ============

    /**
     * @dev Enable emergency withdrawal (can only be called by organizer)
     * @param _hackathonId Hackathon ID
     */
    function enableEmergencyWithdraw(
        uint256 _hackathonId
    ) external onlyHackathonOrganizer(_hackathonId) {
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        require(!prizeInfo.emergencyWithdrawEnabled, "PrizePool: already enabled");

        prizeInfo.emergencyWithdrawEnabled = true;

        emit EmergencyWithdrawEnabled(_hackathonId, block.timestamp);
    }

    /**
     * @dev Emergency withdraw funds (after delay period)
     * @param _hackathonId Hackathon ID
     */
    function emergencyWithdraw(
        uint256 _hackathonId
    ) external onlyHackathonOrganizer(_hackathonId) nonReentrant {
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        require(prizeInfo.emergencyWithdrawEnabled, "PrizePool: emergency withdraw not enabled");
        require(
            block.timestamp >= prizeInfo.finalizedAt + emergencyWithdrawDelay,
            "PrizePool: emergency delay not met"
        );

        uint256 withdrawAmount = prizeInfo.remainingFunds;
        require(withdrawAmount > 0, "PrizePool: no funds to withdraw");

        prizeInfo.remainingFunds = 0;

        address hackathonContract = getHackathonContract(_hackathonId);
        Hackathon hackathon = Hackathon(hackathonContract);
        address organizer = hackathon.organizer();

        (bool success, ) = organizer.call{value: withdrawAmount}("");
        require(success, "PrizePool: emergency withdraw failed");

        emit EmergencyWithdraw(_hackathonId, organizer, withdrawAmount);
    }

    /**
     * @dev Issue refund for cancelled hackathon
     * @param _hackathonId Hackathon ID
     * @param _reason Refund reason
     */
    function issueRefund(
        uint256 _hackathonId,
        string memory _reason
    ) external onlyHackathonOrganizer(_hackathonId) nonReentrant {
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        require(!prizeInfo.finalized, "PrizePool: cannot refund finalized hackathon");

        uint256 refundAmount = prizeInfo.totalPrizeFunds;
        require(refundAmount > 0, "PrizePool: no funds to refund");

        // Reset prize info
        prizeInfo.totalPrizeFunds = 0;
        prizeInfo.remainingFunds = 0;
        prizeInfo.finalized = true;
        prizeInfo.finalizedAt = block.timestamp;

        address hackathonContract = getHackathonContract(_hackathonId);
        Hackathon hackathon = Hackathon(hackathonContract);
        address organizer = hackathon.organizer();

        (bool success, ) = organizer.call{value: refundAmount}("");
        require(success, "PrizePool: refund failed");

        emit RefundIssued(_hackathonId, organizer, refundAmount, _reason);
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get hackathon prize information
     * @param _hackathonId Hackathon ID
     */
    function getHackathonPrizeInfo(uint256 _hackathonId)
        external
        view
        returns (
            uint256 totalPrizeFunds,
            uint256 distributedAmount,
            uint256 remainingFunds,
            bool finalized,
            bool emergencyWithdrawEnabled,
            uint256 finalizedAt
        )
    {
        HackathonPrizeInfo storage prizeInfo = hackathonPrizes[_hackathonId];
        return (
            prizeInfo.totalPrizeFunds,
            prizeInfo.distributedAmount,
            prizeInfo.remainingFunds,
            prizeInfo.finalized,
            prizeInfo.emergencyWithdrawEnabled,
            prizeInfo.finalizedAt
        );
    }

    /**
     * @dev Get prize distribution details
     * @param _hackathonId Hackathon ID
     * @param _categoryId Category ID
     */
    function getDistribution(uint256 _hackathonId, uint256 _categoryId)
        external
        view
        returns (
            uint256 projectId,
            address winner,
            uint256 amount,
            bool distributed,
            uint256 distributedAt,
            uint256 score
        )
    {
        bytes32 distributionKey = keccak256(abi.encodePacked(_hackathonId, _categoryId));
        PrizeDistribution storage distribution = distributions[distributionKey];
        return (
            distribution.projectId,
            distribution.winner,
            distribution.amount,
            distribution.distributed,
            distribution.distributedAt,
            distribution.score
        );
    }

    /**
     * @dev Get all categories for a hackathon
     * @param _hackathonId Hackathon ID
     */
    function getHackathonCategories(uint256 _hackathonId)
        external
        view
        returns (uint256[] memory)
    {
        return hackathonCategories[_hackathonId];
    }

    /**
     * @dev Get category prize amount
     * @param _hackathonId Hackathon ID
     * @param _categoryId Category ID
     */
    function getCategoryPrizeAmount(uint256 _hackathonId, uint256 _categoryId)
        external
        view
        returns (uint256)
    {
        return categoryPrizeAmounts[_hackathonId][_categoryId];
    }

    /**
     * @dev Check if category prize has been distributed
     * @param _hackathonId Hackathon ID
     * @param _categoryId Category ID
     */
    function isCategoryDistributed(uint256 _hackathonId, uint256 _categoryId)
        external
        view
        returns (bool)
    {
        return hackathonPrizes[_hackathonId].categoryDistributed[_categoryId];
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Set emergency withdraw delay
     * @param _delay New delay in seconds
     */
    function setEmergencyWithdrawDelay(uint256 _delay) external onlyOwner {
        require(_delay >= 1 days, "PrizePool: delay too short");
        emergencyWithdrawDelay = _delay;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ FALLBACK ============

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {
        // Allow contract to receive ETH
    }
}
