// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SimpleHackathon.sol";
import "./SimpleProjectRegistry.sol";

/**
 * @title SimpleJudgeRegistry
 * @dev Simplified judge management and scoring system
 * @author HackX Team
 */
contract SimpleJudgeRegistry is ReentrancyGuard, Ownable {
    // Structs
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
        uint256 averageScore;
    }

    // Events
    event JudgeInvited(uint256 indexed hackathonId, address indexed judge);
    event JudgeAccepted(uint256 indexed hackathonId, address indexed judge);
    event ScoreSubmitted(
        uint256 indexed hackathonId,
        uint256 indexed projectId,
        address indexed judge,
        uint256 score,
        string ipfsFeedbackHash
    );
    event WinnerCalculated(
        uint256 indexed hackathonId,
        uint256 indexed categoryId,
        uint256 indexed projectId,
        address winner,
        uint256 averageScore
    );

    // State variables
    mapping(address => Judge) public judges;
    mapping(uint256 => address[]) public hackathonJudges;
    mapping(uint256 => address) public hackathonContracts;
    mapping(uint256 => mapping(uint256 => uint256)) public projectScores; // hackathonId => projectId => totalScore
    mapping(uint256 => mapping(uint256 => uint256)) public projectJudgeCount; // hackathonId => projectId => judgeCount
    address public projectRegistry;

    // Modifiers
    modifier onlyInvitedJudge(uint256 hackathonId) {
        require(isJudgeInvited(hackathonId, msg.sender), "Not an invited judge");
        _;
    }

    modifier onlyAcceptedJudge(uint256 hackathonId) {
        require(judges[msg.sender].isAccepted && isJudgeInvited(hackathonId, msg.sender), "Not an accepted judge");
        _;
    }

    /**
     * @dev Constructor sets the deployer as owner
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set project registry address (owner only)
     * @param _projectRegistry Address of SimpleProjectRegistry contract
     */
    function setProjectRegistry(address _projectRegistry) external onlyOwner {
        require(_projectRegistry != address(0), "Invalid project registry address");
        projectRegistry = _projectRegistry;
    }

    /**
     * @dev Register hackathon contract (owner only)
     * @param hackathonId Hackathon identifier
     * @param hackathonContract Address of hackathon contract
     */
    function registerHackathon(uint256 hackathonId, address hackathonContract) 
        external 
        onlyOwner 
    {
        require(hackathonContract != address(0), "Invalid hackathon contract");
        hackathonContracts[hackathonId] = hackathonContract;
    }

    /**
     * @dev Invite judge to hackathon (hackathon organizer only)
     * @param hackathonId Hackathon identifier
     * @param judge Address of judge to invite
     */
    function inviteJudge(uint256 hackathonId, address judge) 
        external 
        nonReentrant 
    {
        require(judge != address(0), "Invalid judge address");
        require(hackathonContracts[hackathonId] != address(0), "Hackathon not registered");
        
        // Verify caller is hackathon organizer
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[hackathonId]);
        require(hackathon.owner() == msg.sender, "Only hackathon organizer can invite judges");
        
        require(!isJudgeInvited(hackathonId, judge), "Judge already invited");

        hackathonJudges[hackathonId].push(judge);
        emit JudgeInvited(hackathonId, judge);
    }

    /**
     * @dev Accept judge invitation
     * @param hackathonId Hackathon identifier
     */
    function acceptJudgeInvitation(uint256 hackathonId) 
        external 
        nonReentrant 
        onlyInvitedJudge(hackathonId) 
    {
        require(!judges[msg.sender].isAccepted, "Already accepted invitation");

        judges[msg.sender].wallet = msg.sender;
        judges[msg.sender].isAccepted = true;

        // Add judge to hackathon contract
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[hackathonId]);
        hackathon.addJudge(msg.sender);

        emit JudgeAccepted(hackathonId, msg.sender);
    }

    /**
     * @dev Submit score for a project
     * @param hackathonId Hackathon identifier
     * @param projectId Project identifier
     * @param score Score (1-100)
     * @param ipfsFeedbackHash IPFS hash containing detailed feedback
     */
    function submitScore(
        uint256 hackathonId,
        uint256 projectId,
        uint256 score,
        string memory ipfsFeedbackHash
    ) 
        external 
        nonReentrant 
        onlyAcceptedJudge(hackathonId) 
    {
        require(score >= 1 && score <= 100, "Score must be between 1 and 100");
        require(bytes(ipfsFeedbackHash).length > 0, "Feedback hash cannot be empty");
        
        // Verify hackathon is in judging phase
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[hackathonId]);
        require(
            hackathon.currentPhase() == SimpleHackathon.Phase.JUDGING,
            "Hackathon not in judging phase"
        );

        // Verify project exists and is submitted
        SimpleProjectRegistry registry = SimpleProjectRegistry(projectRegistry);
        require(registry.isProjectSubmitted(projectId), "Project not submitted");

        // Check if judge already scored this project
        require(judges[msg.sender].scores[hackathonId][projectId] == 0, "Already scored this project");

        // Record score
        judges[msg.sender].scores[hackathonId][projectId] = score;
        projectScores[hackathonId][projectId] += score;
        projectJudgeCount[hackathonId][projectId]++;

        emit ScoreSubmitted(hackathonId, projectId, msg.sender, score, ipfsFeedbackHash);
    }

    /**
     * @dev Calculate and designate winner for a category
     * @param hackathonId Hackathon identifier
     * @param categoryId Category identifier
     */
    function calculateWinner(uint256 hackathonId, uint256 categoryId) 
        external 
        nonReentrant 
    {
        // Verify caller is hackathon organizer
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[hackathonId]);
        require(hackathon.owner() == msg.sender, "Only hackathon organizer can calculate winners");
        require(
            hackathon.currentPhase() == SimpleHackathon.Phase.JUDGING,
            "Hackathon not in judging phase"
        );

        // Get all submitted projects for this hackathon
        SimpleProjectRegistry registry = SimpleProjectRegistry(projectRegistry);
        uint256[] memory submittedProjects = registry.getSubmittedProjects(hackathonId);
        
        require(submittedProjects.length > 0, "No submitted projects");

        uint256 winningProjectId = 0;
        uint256 highestAverageScore = 0;
        address winner = address(0);

        // Find project with highest average score
        for (uint i = 0; i < submittedProjects.length; i++) {
            uint256 projectId = submittedProjects[i];
            uint256 totalScore = projectScores[hackathonId][projectId];
            uint256 judgeCount = projectJudgeCount[hackathonId][projectId];
            
            if (judgeCount > 0) {
                uint256 averageScore = totalScore / judgeCount;
                
                if (averageScore > highestAverageScore) {
                    highestAverageScore = averageScore;
                    winningProjectId = projectId;
                    
                    // Get project creator as winner
                    (SimpleProjectRegistry.Project memory project) = registry.getProject(projectId);
                    winner = project.creator;
                }
            }
        }

        require(winner != address(0), "No valid winner found");

        // Designate winner in hackathon contract
        hackathon.designateWinner(categoryId, winner, winningProjectId);

        emit WinnerCalculated(hackathonId, categoryId, winningProjectId, winner, highestAverageScore);
    }

    // View functions

    /**
     * @dev Check if address is invited as judge for hackathon
     * @param hackathonId Hackathon identifier
     * @param judge Address to check
     * @return True if judge is invited
     */
    function isJudgeInvited(uint256 hackathonId, address judge) public view returns (bool) {
        address[] memory judgeList = hackathonJudges[hackathonId];
        for (uint i = 0; i < judgeList.length; i++) {
            if (judgeList[i] == judge) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Check if judge has accepted invitation
     * @param judge Address to check
     * @return True if judge has accepted
     */
    function isJudgeAccepted(address judge) external view returns (bool) {
        return judges[judge].isAccepted;
    }

    /**
     * @dev Get judge's score for a project
     * @param judge Judge address
     * @param hackathonId Hackathon identifier
     * @param projectId Project identifier
     * @return Score given by judge
     */
    function getJudgeScore(
        address judge,
        uint256 hackathonId,
        uint256 projectId
    ) external view returns (uint256) {
        return judges[judge].scores[hackathonId][projectId];
    }

    /**
     * @dev Get project's total score and judge count
     * @param hackathonId Hackathon identifier
     * @param projectId Project identifier
     * @return totalScore Total score from all judges
     * @return judgeCount Number of judges who scored
     * @return averageScore Average score
     */
    function getProjectScore(uint256 hackathonId, uint256 projectId) 
        external 
        view 
        returns (uint256 totalScore, uint256 judgeCount, uint256 averageScore) 
    {
        totalScore = projectScores[hackathonId][projectId];
        judgeCount = projectJudgeCount[hackathonId][projectId];
        averageScore = judgeCount > 0 ? totalScore / judgeCount : 0;
    }

    /**
     * @dev Get all judges for a hackathon
     * @param hackathonId Hackathon identifier
     * @return Array of judge addresses
     */
    function getHackathonJudges(uint256 hackathonId) external view returns (address[] memory) {
        return hackathonJudges[hackathonId];
    }

    /**
     * @dev Get judging results for all projects in a hackathon
     * @param hackathonId Hackathon identifier
     * @return results Array of judging results
     */
    function getJudgingResults(uint256 hackathonId) 
        external 
        view 
        returns (JudgingResult[] memory results) 
    {
        SimpleProjectRegistry registry = SimpleProjectRegistry(projectRegistry);
        uint256[] memory submittedProjects = registry.getSubmittedProjects(hackathonId);
        
        results = new JudgingResult[](submittedProjects.length);
        
        for (uint i = 0; i < submittedProjects.length; i++) {
            uint256 projectId = submittedProjects[i];
            uint256 totalScore = projectScores[hackathonId][projectId];
            uint256 judgeCount = projectJudgeCount[hackathonId][projectId];
            uint256 averageScore = judgeCount > 0 ? totalScore / judgeCount : 0;
            
            results[i] = JudgingResult({
                projectId: projectId,
                totalScore: totalScore,
                judgeCount: judgeCount,
                averageScore: averageScore
            });
        }
    }

    /**
     * @dev Check if judge has evaluated a hackathon
     * @param judge Judge address
     * @param hackathonId Hackathon identifier
     * @return True if judge has completed evaluation
     */
    function hasJudgeEvaluated(address judge, uint256 hackathonId) external view returns (bool) {
        return judges[judge].hasEvaluated[hackathonId];
    }
}
