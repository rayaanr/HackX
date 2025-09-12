// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HackathonPlatform
 * @dev Minimal on-chain platform with IPFS metadata storage
 */
contract HackathonPlatform is Ownable, ReentrancyGuard {
    enum Phase { REGISTRATION, SUBMISSION, JUDGING, COMPLETED }
    
    struct Hackathon {
        uint256 id;
        string ipfsHash; // All hackathon metadata (name, description, categories, rules, etc.)
        address organizer;
        Phase currentPhase;
        uint256 registrationDeadline;
        uint256 submissionDeadline;
        uint256 judgingDeadline;
        bool isActive;
    }
    
    struct Project {
        uint256 id;
        uint256 hackathonId;
        string ipfsHash; // All project data (name, description, demo, files, team info, etc.)
        address creator;
        bool isSubmitted;
        uint256 totalScore;
        uint256 judgeCount;
    }
    
    // Events - emit IPFS hashes for off-chain indexing
    event HackathonCreated(uint256 indexed hackathonId, address indexed organizer, string ipfsHash);
    event ParticipantRegistered(uint256 indexed hackathonId, address indexed participant, string ipfsHash);
    event ProjectSubmitted(uint256 indexed hackathonId, uint256 indexed projectId, address indexed creator, string ipfsHash);
    event PhaseChanged(uint256 indexed hackathonId, Phase newPhase);
    event ScoreSubmitted(uint256 indexed hackathonId, uint256 indexed projectId, address indexed judge, uint256 score, string ipfsHash);
    event JudgeAdded(uint256 indexed hackathonId, address indexed judge);
    
    // Minimal state - only what's needed for validation
    uint256 public nextHackathonId = 1;
    uint256 public nextProjectId = 1;
    
    mapping(uint256 => Hackathon) public hackathons;
    mapping(uint256 => Project) public projects;
    
    // Validation mappings - keep these for smart contract logic
    mapping(uint256 => mapping(address => bool)) public isRegistered;
    mapping(uint256 => mapping(address => bool)) public isJudge;
    mapping(uint256 => mapping(address => uint256)) public projectScores; // projectId => judge => score
    
    // Arrays for enumeration
    mapping(uint256 => address[]) public hackathonParticipants;
    mapping(uint256 => uint256[]) public hackathonProjects;
    mapping(address => uint256[]) public userProjects; // user => projectIds[]
    
    constructor() Ownable(msg.sender) {}
    
    modifier hackathonExists(uint256 hackathonId) {
        require(hackathons[hackathonId].id != 0, "Hackathon doesn't exist");
        _;
    }
    
    modifier onlyHackathonOrganizer(uint256 hackathonId) {
        require(hackathons[hackathonId].organizer == msg.sender, "Not hackathon organizer");
        _;
    }
    
    /**
     * @dev Create hackathon - only store validation data on-chain
     * @param ipfsHash IPFS hash containing: name, description, categories, rules, prizes, etc.
     * @param registrationDeadline When registration closes
     * @param submissionDeadline When submissions close  
     * @param judgingDeadline When judging ends
     */
    function createHackathon(
        string memory ipfsHash,
        uint256 registrationDeadline,
        uint256 submissionDeadline,
        uint256 judgingDeadline
    ) external returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(registrationDeadline > block.timestamp, "Invalid registration deadline");
        require(submissionDeadline > registrationDeadline, "Invalid submission deadline");
        require(judgingDeadline > submissionDeadline, "Invalid judging deadline");
        
        uint256 hackathonId = nextHackathonId++;
        
        hackathons[hackathonId] = Hackathon({
            id: hackathonId,
            ipfsHash: ipfsHash,
            organizer: msg.sender,
            currentPhase: Phase.REGISTRATION,
            registrationDeadline: registrationDeadline,
            submissionDeadline: submissionDeadline,
            judgingDeadline: judgingDeadline,
            isActive: true
        });
        
        emit HackathonCreated(hackathonId, msg.sender, ipfsHash);
        return hackathonId;
    }
    
    /**
     * @dev Update hackathon metadata
     * @param hackathonId Hackathon ID
     * @param newIpfsHash Updated metadata
     */
    function updateHackathonMetadata(uint256 hackathonId, string memory newIpfsHash) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
    {
        hackathons[hackathonId].ipfsHash = newIpfsHash;
    }
    
    /**
     * @dev Change hackathon phase
     */
    function updateHackathonPhase(uint256 hackathonId, Phase newPhase) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
    {
        hackathons[hackathonId].currentPhase = newPhase;
        emit PhaseChanged(hackathonId, newPhase);
    }
    
    /**
     * @dev Add judge - only address needed on-chain
     */
    function addJudge(uint256 hackathonId, address judge) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
    {
        require(!isJudge[hackathonId][judge], "Already a judge");
        isJudge[hackathonId][judge] = true;
        emit JudgeAdded(hackathonId, judge);
    }
    
    /**
     * @dev Register for hackathon
     * @param hackathonId Hackathon ID
     * @param participantIpfsHash IPFS hash with participant profile/info
     */
    function registerForHackathon(uint256 hackathonId, string memory participantIpfsHash) 
        external 
        nonReentrant 
        hackathonExists(hackathonId) 
    {
        require(hackathons[hackathonId].currentPhase == Phase.REGISTRATION, "Registration closed");
        require(block.timestamp <= hackathons[hackathonId].registrationDeadline, "Registration deadline passed");
        require(!isRegistered[hackathonId][msg.sender], "Already registered");
        
        isRegistered[hackathonId][msg.sender] = true;
        hackathonParticipants[hackathonId].push(msg.sender);
        
        emit ParticipantRegistered(hackathonId, msg.sender, participantIpfsHash);
    }
    
    /**
     * @dev Submit project - all project data in IPFS
     * @param hackathonId Hackathon ID
     * @param projectIpfsHash IPFS hash containing: name, description, demo links, repo, team members, category, etc.
     */
    function submitProject(
        uint256 hackathonId,
        string memory projectIpfsHash
    ) external nonReentrant hackathonExists(hackathonId) returns (uint256) {
        require(hackathons[hackathonId].currentPhase == Phase.SUBMISSION, "Submission phase not active");
        require(block.timestamp <= hackathons[hackathonId].submissionDeadline, "Submission deadline passed");
        require(isRegistered[hackathonId][msg.sender], "Not registered for hackathon");
        require(bytes(projectIpfsHash).length > 0, "IPFS hash required");
        
        uint256 projectId = nextProjectId++;
        
        projects[projectId] = Project({
            id: projectId,
            hackathonId: hackathonId,
            ipfsHash: projectIpfsHash,
            creator: msg.sender,
            isSubmitted: true,
            totalScore: 0,
            judgeCount: 0
        });
        
        hackathonProjects[hackathonId].push(projectId);
        userProjects[msg.sender].push(projectId);
        
        emit ProjectSubmitted(hackathonId, projectId, msg.sender, projectIpfsHash);
        return projectId;
    }
    
    /**
     * @dev Update project before submission deadline
     * @param projectId Project ID
     * @param newProjectIpfsHash Updated project data
     */
    function updateProject(uint256 projectId, string memory newProjectIpfsHash) external {
        require(projects[projectId].creator == msg.sender, "Not project creator");
        require(projects[projectId].id != 0, "Project doesn't exist");
        
        uint256 hackathonId = projects[projectId].hackathonId;
        require(block.timestamp <= hackathons[hackathonId].submissionDeadline, "Submission deadline passed");
        
        projects[projectId].ipfsHash = newProjectIpfsHash;
    }
    
    /**
     * @dev Submit score with feedback
     * @param projectId Project ID
     * @param score Score (1-100)
     * @param feedbackIpfsHash IPFS hash with detailed feedback/comments
     */
    function submitScore(uint256 projectId, uint256 score, string memory feedbackIpfsHash) external {
        require(projects[projectId].id != 0, "Project doesn't exist");
        
        uint256 hackathonId = projects[projectId].hackathonId;
        require(hackathons[hackathonId].currentPhase == Phase.JUDGING, "Judging phase not active");
        require(isJudge[hackathonId][msg.sender], "Not authorized judge");
        require(score >= 1 && score <= 100, "Score must be 1-100");
        require(projectScores[projectId][msg.sender] == 0, "Already scored this project");
        
        projectScores[projectId][msg.sender] = score;
        projects[projectId].totalScore += score;
        projects[projectId].judgeCount++;
        
        emit ScoreSubmitted(hackathonId, projectId, msg.sender, score, feedbackIpfsHash);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getHackathon(uint256 hackathonId) external view returns (Hackathon memory) {
        return hackathons[hackathonId];
    }
    
    function getProject(uint256 projectId) external view returns (Project memory) {
        return projects[projectId];
    }
    
    function getHackathonProjects(uint256 hackathonId) external view returns (uint256[] memory) {
        return hackathonProjects[hackathonId];
    }
    
    function getHackathonParticipants(uint256 hackathonId) external view returns (address[] memory) {
        return hackathonParticipants[hackathonId];
    }
    
    function getUserProjects(address user) external view returns (uint256[] memory) {
        return userProjects[user];
    }
    
    function getProjectScore(uint256 projectId) external view returns (uint256 avgScore, uint256 totalScore, uint256 judgeCount) {
        Project memory project = projects[projectId];
        totalScore = project.totalScore;
        judgeCount = project.judgeCount;
        avgScore = judgeCount > 0 ? totalScore / judgeCount : 0;
    }
    
    function getActiveHackathons() external view returns (uint256[] memory activeIds) {
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextHackathonId; i++) {
            if (hackathons[i].isActive) {
                count++;
            }
        }
        
        activeIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextHackathonId; i++) {
            if (hackathons[i].isActive) {
                activeIds[index] = i;
                index++;
            }
        }
    }
    
    function getTotalHackathons() external view returns (uint256) {
        return nextHackathonId - 1;
    }
    
    function getTotalProjects() external view returns (uint256) {
        return nextProjectId - 1;
    }
}