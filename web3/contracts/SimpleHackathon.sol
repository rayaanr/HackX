// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleHackathon
 * @dev Simplified hackathon contract with basic phase management
 * @author HackX Team
 */
contract SimpleHackathon is Ownable, ReentrancyGuard {
    // Enums
    enum Phase {
        REGISTRATION,
        SUBMISSION,
        JUDGING,
        COMPLETED
    }

    // Events
    event ParticipantRegistered(address indexed participant);
    event PhaseChanged(Phase newPhase);
    event WinnerDesignated(
        uint256 indexed categoryId,
        address indexed winner,
        uint256 projectId
    );
    event JudgeAdded(address indexed judge);
    event HackathonPaused();
    event HackathonUnpaused();

    // State variables
    uint256 public hackathonId;
    string public ipfsHash;
    Phase public currentPhase;
    bool public isPaused;

    // Mappings
    mapping(address => bool) public participants;
    mapping(uint256 => address) public winners; // categoryId => winner address
    mapping(uint256 => uint256) public winningProjects; // categoryId => projectId
    mapping(address => bool) public judges;

    // Arrays
    address[] public participantsList;
    address[] public judgesList;

    // Modifiers
    modifier onlyParticipant() {
        require(participants[msg.sender], "Not a registered participant");
        _;
    }

    modifier onlyJudge() {
        require(judges[msg.sender], "Not an authorized judge");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "Hackathon is paused");
        _;
    }

    modifier inPhase(Phase expectedPhase) {
        require(currentPhase == expectedPhase, "Wrong phase for this action");
        _;
    }

    /**
     * @dev Constructor initializes hackathon
     * @param _hackathonId Unique hackathon identifier
     * @param _organizer Address of hackathon organizer
     * @param _ipfsHash IPFS hash containing hackathon metadata
     */
    constructor(
        uint256 _hackathonId,
        address _organizer,
        string memory _ipfsHash
    ) Ownable(_organizer) {
        hackathonId = _hackathonId;
        ipfsHash = _ipfsHash;
        currentPhase = Phase.REGISTRATION;
    }

    /**
     * @dev Register as a participant in the hackathon
     */
    function registerParticipant()
        external
        nonReentrant
        whenNotPaused
        inPhase(Phase.REGISTRATION)
    {
        require(!participants[msg.sender], "Already registered");

        participants[msg.sender] = true;
        participantsList.push(msg.sender);

        emit ParticipantRegistered(msg.sender);
    }

    /**
     * @dev Add a judge to the hackathon (organizer only)
     * @param judge Address of the judge to add
     */
    function addJudge(address judge) external onlyOwner nonReentrant {
        require(judge != address(0), "Invalid judge address");
        require(!judges[judge], "Judge already added");

        judges[judge] = true;
        judgesList.push(judge);

        emit JudgeAdded(judge);
    }

    /**
     * @dev Progress to next phase (organizer only)
     */
    function nextPhase() external onlyOwner {
        require(currentPhase != Phase.COMPLETED, "Hackathon already completed");

        if (currentPhase == Phase.REGISTRATION) {
            currentPhase = Phase.SUBMISSION;
        } else if (currentPhase == Phase.SUBMISSION) {
            currentPhase = Phase.JUDGING;
        } else if (currentPhase == Phase.JUDGING) {
            currentPhase = Phase.COMPLETED;
        }

        emit PhaseChanged(currentPhase);
    }

    /**
     * @dev Designate winner for a category (organizer only)
     * @param categoryId Category identifier
     * @param winner Winner's address
     * @param projectId Winning project ID
     */
    function designateWinner(
        uint256 categoryId,
        address winner,
        uint256 projectId
    ) external onlyOwner inPhase(Phase.JUDGING) {
        require(participants[winner], "Winner must be a participant");
        require(
            winners[categoryId] == address(0),
            "Winner already designated for this category"
        );

        winners[categoryId] = winner;
        winningProjects[categoryId] = projectId;

        emit WinnerDesignated(categoryId, winner, projectId);
    }

    /**
     * @dev Pause the hackathon (organizer only)
     */
    function pauseHackathon() external onlyOwner {
        isPaused = true;
        emit HackathonPaused();
    }

    /**
     * @dev Unpause the hackathon (organizer only)
     */
    function unpauseHackathon() external onlyOwner {
        isPaused = false;
        emit HackathonUnpaused();
    }

    /**
     * @dev Update hackathon metadata IPFS hash (organizer only)
     * @param newIpfsHash New IPFS hash
     */
    function updateMetadata(string memory newIpfsHash) external onlyOwner {
        require(bytes(newIpfsHash).length > 0, "IPFS hash cannot be empty");
        ipfsHash = newIpfsHash;
    }

    // View functions

    /**
     * @dev Check if address is a participant
     * @param participant Address to check
     * @return True if participant is registered
     */
    function isParticipant(address participant) external view returns (bool) {
        return participants[participant];
    }

    /**
     * @dev Check if address is a judge
     * @param judge Address to check
     * @return True if address is a judge
     */
    function isJudge(address judge) external view returns (bool) {
        return judges[judge];
    }

    /**
     * @dev Get winner for a category
     * @param categoryId Category identifier
     * @return winner Winner address
     * @return projectId Winning project ID
     */
    function getWinner(
        uint256 categoryId
    ) external view returns (address winner, uint256 projectId) {
        return (winners[categoryId], winningProjects[categoryId]);
    }

    /**
     * @dev Get all participants
     * @return Array of participant addresses
     */
    function getAllParticipants() external view returns (address[] memory) {
        return participantsList;
    }

    /**
     * @dev Get all judges
     * @return Array of judge addresses
     */
    function getAllJudges() external view returns (address[] memory) {
        return judgesList;
    }

    /**
     * @dev Get participant count
     * @return Number of registered participants
     */
    function getParticipantCount() external view returns (uint256) {
        return participantsList.length;
    }

    /**
     * @dev Get judge count
     * @return Number of judges
     */
    function getJudgeCount() external view returns (uint256) {
        return judgesList.length;
    }
}
