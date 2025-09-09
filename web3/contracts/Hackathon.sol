// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Hackathon
 * @dev Individual hackathon contract with event management
 * @author HackX Team
 */
contract Hackathon is ReentrancyGuard, Pausable {
    // Enums
    enum Phase {
        Registration,
        Hackathon,
        Judging,
        Completed
    }

    // Events
    event PhaseChanged(Phase indexed oldPhase, Phase indexed newPhase);
    event ParticipantRegistered(address indexed participant, uint256 timestamp);
    event PrizeCategoryAdded(
        uint256 indexed categoryId,
        string name,
        uint256 amount
    );
    event PrizeFundsDeposited(uint256 amount, address indexed depositor);
    event WinnerSet(
        uint256 indexed categoryId,
        address indexed winner,
        uint256 amount
    );
    event PrizeDistributed(
        uint256 indexed categoryId,
        address indexed winner,
        uint256 amount
    );
    event EmergencyWithdrawal(uint256 amount, address indexed organizer);

    // State variables
    uint256 public hackathonId;
    address public organizer;
    string public ipfsHash;
    Phase public currentPhase;

    // Timestamps
    uint256 public registrationStart;
    uint256 public registrationEnd;
    uint256 public hackathonStart;
    uint256 public hackathonEnd;
    uint256 public judgingEnd;

    // Participation
    uint256 public maxParticipants;
    uint256 public participantCount;
    mapping(address => bool) public participants;

    // Prize Pool Management
    struct PrizeCategory {
        string name;
        uint256 amount;
        address winner;
        bool distributed;
    }

    uint256 public totalPrizeFunds;
    uint256 public distributedFunds;
    uint256 public prizeCategories;
    mapping(uint256 => PrizeCategory) public prizePool;
    mapping(address => uint256) public participantWinnings;

    // Modifiers
    modifier onlyOrganizer() {
        require(
            msg.sender == organizer,
            "Hackathon: caller is not the organizer"
        );
        _;
    }

    modifier inPhase(Phase _phase) {
        require(
            currentPhase == _phase,
            "Hackathon: function called in wrong phase"
        );
        _;
    }

    modifier onlyAfterPhase(Phase _phase) {
        require(currentPhase > _phase, "Hackathon: function called too early");
        _;
    }

    modifier onlyParticipant() {
        require(
            participants[msg.sender],
            "Hackathon: caller is not a participant"
        );
        _;
    }

    /**
     * @dev Constructor initializes the hackathon
     */
    constructor(
        uint256 _hackathonId,
        address _organizer,
        string memory _ipfsHash,
        uint256 _registrationStart,
        uint256 _registrationEnd,
        uint256 _hackathonStart,
        uint256 _hackathonEnd,
        uint256 _judgingEnd,
        uint256 _maxParticipants
    ) {
        hackathonId = _hackathonId;
        organizer = _organizer;
        ipfsHash = _ipfsHash;
        registrationStart = _registrationStart;
        registrationEnd = _registrationEnd;
        hackathonStart = _hackathonStart;
        hackathonEnd = _hackathonEnd;
        judgingEnd = _judgingEnd;
        maxParticipants = _maxParticipants;

        // Set initial phase based on current time
        if (block.timestamp < _registrationStart) {
            currentPhase = Phase.Registration; // Will be updated when registration starts
        } else {
            _updatePhase();
        }
    }

    /**
     * @dev Register as a participant
     */
    function register()
        external
        inPhase(Phase.Registration)
        nonReentrant
        whenNotPaused
    {
        require(
            block.timestamp >= registrationStart,
            "Hackathon: registration not started"
        );
        require(
            block.timestamp <= registrationEnd,
            "Hackathon: registration ended"
        );
        require(!participants[msg.sender], "Hackathon: already registered");
        require(
            participantCount < maxParticipants,
            "Hackathon: max participants reached"
        );

        participants[msg.sender] = true;
        participantCount++;

        emit ParticipantRegistered(msg.sender, block.timestamp);

        // Auto-update phase if needed
        _updatePhase();
    }

    /**
     * @dev Update the current phase based on timestamps
     */
    function updatePhase() external {
        _updatePhase();
    }

    /**
     * @dev Internal function to update phase
     */
    function _updatePhase() internal {
        Phase oldPhase = currentPhase;

        if (block.timestamp < registrationStart) {
            currentPhase = Phase.Registration;
        } else if (block.timestamp <= registrationEnd) {
            currentPhase = Phase.Registration;
        } else if (block.timestamp <= hackathonEnd) {
            currentPhase = Phase.Hackathon;
        } else if (block.timestamp <= judgingEnd) {
            currentPhase = Phase.Judging;
        } else {
            currentPhase = Phase.Completed;
        }

        if (oldPhase != currentPhase) {
            emit PhaseChanged(oldPhase, currentPhase);
        }
    }

    /**
     * @dev Get hackathon details
     */
    function getHackathonDetails()
        external
        view
        returns (
            uint256 id,
            address org,
            string memory metadata,
            Phase phase,
            uint256 regStart,
            uint256 regEnd,
            uint256 hackStart,
            uint256 hackEnd,
            uint256 judgeEnd,
            uint256 maxPart,
            uint256 partCount
        )
    {
        return (
            hackathonId,
            organizer,
            ipfsHash,
            currentPhase,
            registrationStart,
            registrationEnd,
            hackathonStart,
            hackathonEnd,
            judgingEnd,
            maxParticipants,
            participantCount
        );
    }

    /**
     * @dev Check if an address is a participant
     */
    function isParticipant(address _user) external view returns (bool) {
        return participants[_user];
    }

    // ============ PRIZE POOL MANAGEMENT ============

    /**
     * @dev Add a new prize category (only organizer, before judging phase)
     * @param _name Name of the prize category
     * @param _amount Prize amount in wei
     */
    function addPrizeCategory(
        string memory _name,
        uint256 _amount
    ) external onlyOrganizer nonReentrant {
        require(
            currentPhase < Phase.Judging,
            "Hackathon: cannot add prizes after judging started"
        );
        require(_amount > 0, "Hackathon: prize amount must be greater than 0");
        require(
            bytes(_name).length > 0,
            "Hackathon: prize name cannot be empty"
        );

        uint256 categoryId = prizeCategories++;
        prizePool[categoryId] = PrizeCategory({
            name: _name,
            amount: _amount,
            winner: address(0),
            distributed: false
        });

        emit PrizeCategoryAdded(categoryId, _name, _amount);
    }

    /**
     * @dev Deposit prize funds to the contract
     */
    function depositPrizeFunds()
        external
        payable
        onlyOrganizer
        nonReentrant
        whenNotPaused
    {
        require(msg.value > 0, "Hackathon: must deposit some funds");
        require(
            currentPhase < Phase.Completed,
            "Hackathon: cannot deposit after hackathon completed"
        );

        totalPrizeFunds += msg.value;
        emit PrizeFundsDeposited(msg.value, msg.sender);
    }

    /**
     * @dev Set winner for a prize category (only organizer, during judging phase)
     * @param _categoryId Prize category ID
     * @param _winner Winner address
     */
    function setWinner(
        uint256 _categoryId,
        address _winner
    ) external onlyOrganizer inPhase(Phase.Judging) nonReentrant {
        require(
            _categoryId < prizeCategories,
            "Hackathon: invalid category ID"
        );
        require(
            _winner != address(0),
            "Hackathon: winner cannot be zero address"
        );
        require(
            participants[_winner],
            "Hackathon: winner must be a participant"
        );
        require(
            prizePool[_categoryId].winner == address(0),
            "Hackathon: winner already set for this category"
        );

        prizePool[_categoryId].winner = _winner;
        participantWinnings[_winner] += prizePool[_categoryId].amount;

        emit WinnerSet(_categoryId, _winner, prizePool[_categoryId].amount);
    }

    /**
     * @dev Distribute prize to winner (after judging phase)
     * @param _categoryId Prize category ID
     */
    function distributePrize(
        uint256 _categoryId
    ) external onlyAfterPhase(Phase.Judging) nonReentrant whenNotPaused {
        require(
            _categoryId < prizeCategories,
            "Hackathon: invalid category ID"
        );

        PrizeCategory storage prize = prizePool[_categoryId];
        require(prize.winner != address(0), "Hackathon: no winner set");
        require(!prize.distributed, "Hackathon: prize already distributed");
        require(
            prize.amount <= address(this).balance,
            "Hackathon: insufficient funds"
        );

        prize.distributed = true;
        distributedFunds += prize.amount;

        // Transfer prize to winner
        (bool success, ) = prize.winner.call{value: prize.amount}("");
        require(success, "Hackathon: prize transfer failed");

        emit PrizeDistributed(_categoryId, prize.winner, prize.amount);
    }

    /**
     * @dev Emergency withdrawal of remaining funds (only organizer, after hackathon)
     */
    function emergencyWithdraw()
        external
        onlyOrganizer
        onlyAfterPhase(Phase.Hackathon)
        nonReentrant
    {
        uint256 balance = address(this).balance;
        require(balance > 0, "Hackathon: no funds to withdraw");

        (bool success, ) = organizer.call{value: balance}("");
        require(success, "Hackathon: withdrawal failed");

        emit EmergencyWithdrawal(balance, organizer);
    }

    /**
     * @dev Get prize category details
     * @param _categoryId Prize category ID
     */
    function getPrizeCategory(
        uint256 _categoryId
    )
        external
        view
        returns (
            string memory name,
            uint256 amount,
            address winner,
            bool distributed
        )
    {
        require(
            _categoryId < prizeCategories,
            "Hackathon: invalid category ID"
        );
        PrizeCategory memory prize = prizePool[_categoryId];
        return (prize.name, prize.amount, prize.winner, prize.distributed);
    }

    /**
     * @dev Get total prize funds information
     */
    function getPrizeFundsInfo()
        external
        view
        returns (
            uint256 total,
            uint256 distributed,
            uint256 remaining,
            uint256 balance
        )
    {
        return (
            totalPrizeFunds,
            distributedFunds,
            totalPrizeFunds - distributedFunds,
            address(this).balance
        );
    }

    /**
     * @dev Pause hackathon - only organizer
     */
    function pause() external onlyOrganizer {
        _pause();
    }

    /**
     * @dev Unpause hackathon - only organizer
     */
    function unpause() external onlyOrganizer {
        _unpause();
    }
}
