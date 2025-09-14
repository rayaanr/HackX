// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HackathonPlatform
 * @dev Hackathon platform with comprehensive validation and events
 */
contract HackathonPlatform is Ownable, ReentrancyGuard {
    enum Phase { REGISTRATION, SUBMISSION, JUDGING, COMPLETED }
    
    struct Hackathon {
        uint256 id;
        string ipfsHash;
        address organizer;
        Phase currentPhase;
        uint256 registrationDeadline;
        uint256 submissionStartDate;
        uint256 submissionDeadline;
        uint256 judgingDeadline;
        bool isActive;
    }
    
    struct Project {
        uint256 id;
        string ipfsHash;
        address creator;
        address[] teamMembers;
        bool isCreated;
        uint256 totalScore;
        uint256 judgeCount;
    }
    
    // Enhanced Events - comprehensive coverage for off-chain indexing
    event HackathonCreated(uint256 indexed hackathonId, address indexed organizer, string ipfsHash);
    event HackathonMetadataUpdated(uint256 indexed hackathonId, address indexed organizer, string newIpfsHash);
    event HackathonDeactivated(uint256 indexed hackathonId, address indexed organizer);
    event HackathonDeleted(uint256 indexed hackathonId, address indexed owner, address indexed organizer);
    event ParticipantRegistered(uint256 indexed hackathonId, address indexed participant);
    event ProjectCreated(uint256 indexed projectId, address indexed creator, string ipfsHash);
    event ProjectMetadataUpdated(uint256 indexed projectId, address indexed creator, string newIpfsHash);
    event ProjectSubmittedToHackathon(uint256 indexed hackathonId, uint256 indexed projectId, address indexed submitter);
    event TeamMemberAdded(uint256 indexed projectId, address indexed creator, address indexed member);
    event TeamMemberRemoved(uint256 indexed projectId, address indexed creator, address indexed member);
    event PhaseChanged(uint256 indexed hackathonId, address indexed organizer, Phase oldPhase, Phase newPhase);
    event ScoreSubmitted(uint256 indexed hackathonId, uint256 indexed projectId, address indexed judge, uint256 score, string ipfsHash);
    event JudgeAdded(uint256 indexed hackathonId, address indexed organizer, address indexed judge);
    event JudgeRemoved(uint256 indexed hackathonId, address indexed organizer, address indexed judge);
    
    // State variables
    uint256 public nextHackathonId = 1;
    uint256 public nextProjectId = 1;
    
    mapping(uint256 => Hackathon) public hackathons;
    mapping(uint256 => Project) public projects;
    
    // Access control and validation mappings
    mapping(uint256 => mapping(address => bool)) public isRegistered;
    mapping(uint256 => mapping(address => bool)) public isJudge;
    mapping(uint256 => mapping(uint256 => bool)) public isProjectSubmitted;
    mapping(uint256 => mapping(address => uint256)) public projectScores;
    
    // Enhanced enumeration mappings
    mapping(uint256 => address[]) public hackathonParticipants;
    mapping(uint256 => uint256[]) public hackathonProjects;
    mapping(uint256 => address[]) public hackathonJudges;
    mapping(address => uint256[]) public userProjects;
    mapping(address => uint256[]) public judgeAssignments;
    mapping(address => uint256[]) public userHackathons; // User's hackathon participations
    mapping(address => uint256[]) public organizerHackathons; // Organizer's created hackathons
    
    // Constants for validation
    uint256 private constant MIN_DEADLINE_BUFFER = 1 hours;
    uint256 private constant MAX_SCORE = 100;
    uint256 private constant MIN_SCORE = 1;
    
    constructor() Ownable(msg.sender) {}
    
    // Enhanced modifiers with specific error messages
    modifier hackathonExists(uint256 hackathonId) {
        require(hackathons[hackathonId].id != 0, "HackathonPlatform: Hackathon does not exist");
        _;
    }
    
    modifier projectExists(uint256 projectId) {
        require(projects[projectId].isCreated, "HackathonPlatform: Project does not exist");
        _;
    }
    
    modifier onlyHackathonOrganizer(uint256 hackathonId) {
        require(hackathons[hackathonId].organizer == msg.sender, "HackathonPlatform: Only hackathon organizer can perform this action");
        _;
    }
    
    modifier onlyProjectCreator(uint256 projectId) {
        require(projects[projectId].creator == msg.sender, "HackathonPlatform: Only project creator can perform this action");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "HackathonPlatform: Invalid zero address provided");
        _;
    }
    
    modifier validIpfsHash(string memory ipfsHash) {
        require(bytes(ipfsHash).length > 0, "HackathonPlatform: IPFS hash cannot be empty");
        require(bytes(ipfsHash).length <= 256, "HackathonPlatform: IPFS hash too long");
        _;
    }
    
    modifier validDeadlines(uint256 registration, uint256 submissionStart, uint256 submission, uint256 judging) {
        require(registration > block.timestamp + MIN_DEADLINE_BUFFER, "HackathonPlatform: Registration deadline must be at least 1 hour in the future");
        require(submissionStart > registration + MIN_DEADLINE_BUFFER, "HackathonPlatform: Submission start must be at least 1 hour after registration");
        require(submission > submissionStart + MIN_DEADLINE_BUFFER, "HackathonPlatform: Submission deadline must be at least 1 hour after submission start");
        require(judging > submission + MIN_DEADLINE_BUFFER, "HackathonPlatform: Judging deadline must be at least 1 hour after submission");
        _;
    }
    
    /**
     * @dev Create hackathon with comprehensive validation
     */
    function createHackathon(
        string memory ipfsHash,
        uint256 registrationDeadline,
        uint256 submissionStartDate,
        uint256 submissionDeadline,
        uint256 judgingDeadline,
        address[] memory initialJudges
    ) external 
        validIpfsHash(ipfsHash)
        validDeadlines(registrationDeadline, submissionStartDate, submissionDeadline, judgingDeadline)
        returns (uint256) 
    {
        uint256 hackathonId = nextHackathonId++;
        
        // Create hackathon first
        hackathons[hackathonId] = Hackathon({
            id: hackathonId,
            ipfsHash: ipfsHash,
            organizer: msg.sender,
            currentPhase: Phase.REGISTRATION,
            registrationDeadline: registrationDeadline,
            submissionStartDate: submissionStartDate,
            submissionDeadline: submissionDeadline,
            judgingDeadline: judgingDeadline,
            isActive: true
        });

        // Validate and add initial judges with duplicate prevention
        for (uint256 i = 0; i < initialJudges.length; i++) {
            address judge = initialJudges[i];
            
            // Basic validations
            require(judge != address(0), "HackathonPlatform: Invalid judge address");
            require(judge != msg.sender, "HackathonPlatform: Organizer cannot be judge");
            
            // Skip duplicates (gas efficient approach) - don't revert
            if (isJudge[hackathonId][judge]) {
                continue; // Skip duplicate, don't waste gas on revert
            }
            
            // Add judge
            isJudge[hackathonId][judge] = true;
            hackathonJudges[hackathonId].push(judge);
            judgeAssignments[judge].push(hackathonId);
            
            // Emit event for each judge
            emit JudgeAdded(hackathonId, msg.sender, judge);
        }
        
        organizerHackathons[msg.sender].push(hackathonId);
        
        emit HackathonCreated(hackathonId, msg.sender, ipfsHash);
        return hackathonId;
    }
    
    /**
     * @dev Update hackathon metadata with enhanced validation
     */
    function updateHackathonMetadata(uint256 hackathonId, string memory newIpfsHash) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
        validIpfsHash(newIpfsHash)
    {
        require(hackathons[hackathonId].isActive, "HackathonPlatform: Cannot update inactive hackathon");
        hackathons[hackathonId].ipfsHash = newIpfsHash;
        
        emit HackathonMetadataUpdated(hackathonId, msg.sender, newIpfsHash);
    }
    
    /**
     * @dev Change hackathon phase with validation
     */
    function updateHackathonPhase(uint256 hackathonId, Phase newPhase) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
    {
        require(hackathons[hackathonId].isActive, "HackathonPlatform: Cannot update phase of inactive hackathon");
        
        Phase oldPhase = hackathons[hackathonId].currentPhase;
        require(newPhase != oldPhase, "HackathonPlatform: Phase is already set to the specified value");
        
        // Validate phase transition logic
        if (newPhase == Phase.SUBMISSION) {
            require(oldPhase == Phase.REGISTRATION, "HackathonPlatform: Can only move to submission from registration phase");
        } else if (newPhase == Phase.JUDGING) {
            require(oldPhase == Phase.SUBMISSION, "HackathonPlatform: Can only move to judging from submission phase");
        } else if (newPhase == Phase.COMPLETED) {
            require(oldPhase == Phase.JUDGING, "HackathonPlatform: Can only complete from judging phase");
        }
        
        hackathons[hackathonId].currentPhase = newPhase;
        emit PhaseChanged(hackathonId, msg.sender, oldPhase, newPhase);
    }
    
    /**
     * @dev Deactivate hackathon (organizer can deactivate their own hackathon)
     */
    function deactivateHackathon(uint256 hackathonId) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
    {
        require(hackathons[hackathonId].isActive, "HackathonPlatform: Hackathon is already inactive");
        
        hackathons[hackathonId].isActive = false;
        emit HackathonDeactivated(hackathonId, msg.sender);
    }
    
    /**
     * @dev Delete hackathon completely (only contract owner can delete any hackathon)
     * This is an administrative function for moderation purposes
     */
    function deleteHackathon(uint256 hackathonId) 
        external 
        onlyOwner
        hackathonExists(hackathonId) 
    {
        Hackathon storage hackathon = hackathons[hackathonId];
        address organizer = hackathon.organizer;
        
        // Clear all hackathon data
        delete hackathons[hackathonId];
        
        // Remove from organizer's hackathons list
        uint256[] storage orgHackathons = organizerHackathons[organizer];
        for (uint256 i = 0; i < orgHackathons.length; i++) {
            if (orgHackathons[i] == hackathonId) {
                orgHackathons[i] = orgHackathons[orgHackathons.length - 1];
                orgHackathons.pop();
                break;
            }
        }
        
        // Clear participants data
        address[] storage participants = hackathonParticipants[hackathonId];
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            isRegistered[hackathonId][participant] = false;
            
            // Remove hackathon from user's participation list
            uint256[] storage userHackathonList = userHackathons[participant];
            for (uint256 j = 0; j < userHackathonList.length; j++) {
                if (userHackathonList[j] == hackathonId) {
                    userHackathonList[j] = userHackathonList[userHackathonList.length - 1];
                    userHackathonList.pop();
                    break;
                }
            }
        }
        delete hackathonParticipants[hackathonId];
        
        // Clear judges data
        address[] storage judges = hackathonJudges[hackathonId];
        for (uint256 i = 0; i < judges.length; i++) {
            address judge = judges[i];
            isJudge[hackathonId][judge] = false;
            
            // Remove hackathon from judge's assignments
            uint256[] storage assignments = judgeAssignments[judge];
            for (uint256 j = 0; j < assignments.length; j++) {
                if (assignments[j] == hackathonId) {
                    assignments[j] = assignments[assignments.length - 1];
                    assignments.pop();
                    break;
                }
            }
        }
        delete hackathonJudges[hackathonId];
        
        // Clear project submissions (but don't delete the projects themselves)
        uint256[] storage submittedProjects = hackathonProjects[hackathonId];
        for (uint256 i = 0; i < submittedProjects.length; i++) {
            isProjectSubmitted[hackathonId][submittedProjects[i]] = false;
        }
        delete hackathonProjects[hackathonId];
        
        emit HackathonDeleted(hackathonId, msg.sender, organizer);
    }
    
    /**
     * @dev Add judge with comprehensive validation
     */
    function addJudge(uint256 hackathonId, address judge) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId)
        validAddress(judge)
    {
        require(hackathons[hackathonId].isActive, "HackathonPlatform: Cannot add judge to inactive hackathon");
        require(!isJudge[hackathonId][judge], "HackathonPlatform: Address is already a judge for this hackathon");
        require(judge != hackathons[hackathonId].organizer, "HackathonPlatform: Organizer cannot be a judge");
        
        isJudge[hackathonId][judge] = true;
        judgeAssignments[judge].push(hackathonId);
        hackathonJudges[hackathonId].push(judge);
        
        emit JudgeAdded(hackathonId, msg.sender, judge);
    }
    
    /**
     * @dev Remove judge
     */
    function removeJudge(uint256 hackathonId, address judge) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId)
        validAddress(judge)
    {
        require(isJudge[hackathonId][judge], "HackathonPlatform: Address is not a judge for this hackathon");
        require(hackathons[hackathonId].currentPhase != Phase.JUDGING, "HackathonPlatform: Cannot remove judge during judging phase");
        
        isJudge[hackathonId][judge] = false;
        
        // Remove from judgeAssignments
        uint256[] storage assignments = judgeAssignments[judge];
        for (uint256 i = 0; i < assignments.length; i++) {
            if (assignments[i] == hackathonId) {
                assignments[i] = assignments[assignments.length - 1];
                assignments.pop();
                break;
            }
        }
        
        // Remove from hackathonJudges
        address[] storage judges = hackathonJudges[hackathonId];
        for (uint256 i = 0; i < judges.length; i++) {
            if (judges[i] == judge) {
                judges[i] = judges[judges.length - 1];
                judges.pop();
                break;
            }
        }
        
        emit JudgeRemoved(hackathonId, msg.sender, judge);
    }
    
    /**
     * @dev Register for hackathon with enhanced validation
     */
    function registerForHackathon(uint256 hackathonId) 
        external 
        nonReentrant 
        hackathonExists(hackathonId)
    {
        require(hackathons[hackathonId].isActive, "HackathonPlatform: Cannot register for inactive hackathon");
        require(hackathons[hackathonId].currentPhase == Phase.REGISTRATION, "HackathonPlatform: Registration phase is not active");
        require(block.timestamp <= hackathons[hackathonId].registrationDeadline, "HackathonPlatform: Registration deadline has passed");
        require(!isRegistered[hackathonId][msg.sender], "HackathonPlatform: Already registered for this hackathon");
        require(!isJudge[hackathonId][msg.sender], "HackathonPlatform: Judges cannot register as participants");
        
        isRegistered[hackathonId][msg.sender] = true;
        hackathonParticipants[hackathonId].push(msg.sender);
        userHackathons[msg.sender].push(hackathonId);
        
        emit ParticipantRegistered(hackathonId, msg.sender);
    }
    
    /**
     * @dev Create project with validation
     */
    function createProject(string memory projectIpfsHash) 
        external 
        validIpfsHash(projectIpfsHash)
        returns (uint256) 
    {
        uint256 projectId = nextProjectId++;
        
        projects[projectId] = Project({
            id: projectId,
            ipfsHash: projectIpfsHash,
            creator: msg.sender,
            teamMembers: new address[](0),
            isCreated: true,
            totalScore: 0,
            judgeCount: 0
        });
        
        userProjects[msg.sender].push(projectId);
        
        emit ProjectCreated(projectId, msg.sender, projectIpfsHash);
        return projectId;
    }
    
    /**
     * @dev Update project metadata with validation
     */
    function updateProject(uint256 projectId, string memory newProjectIpfsHash) 
        external 
        onlyProjectCreator(projectId) 
        projectExists(projectId)
        validIpfsHash(newProjectIpfsHash)
    {
        projects[projectId].ipfsHash = newProjectIpfsHash;
        emit ProjectMetadataUpdated(projectId, msg.sender, newProjectIpfsHash);
    }
    
    /**
     * @dev Add team member with comprehensive validation
     */
    function addTeamMember(uint256 projectId, address member) 
        external 
        onlyProjectCreator(projectId) 
        projectExists(projectId)
        validAddress(member)
    {
        require(member != projects[projectId].creator, "HackathonPlatform: Project creator is already part of the team");
        
        // Check if member already exists
        address[] memory currentMembers = projects[projectId].teamMembers;
        for (uint256 i = 0; i < currentMembers.length; i++) {
            require(currentMembers[i] != member, "HackathonPlatform: Address is already a team member");
        }
        
        projects[projectId].teamMembers.push(member);
        userProjects[member].push(projectId);
        
        emit TeamMemberAdded(projectId, msg.sender, member);
    }
    
    /**
     * @dev Remove team member with validation
     */
    function removeTeamMember(uint256 projectId, address member) 
        external 
        onlyProjectCreator(projectId) 
        projectExists(projectId)
        validAddress(member)
    {
        address[] storage teamMembers = projects[projectId].teamMembers;
        bool found = false;
        
        for (uint256 i = 0; i < teamMembers.length; i++) {
            if (teamMembers[i] == member) {
                teamMembers[i] = teamMembers[teamMembers.length - 1];
                teamMembers.pop();
                found = true;
                break;
            }
        }
        
        require(found, "HackathonPlatform: Address is not a team member");
        
        // Remove project from user's projects
        uint256[] storage memberProjects = userProjects[member];
        for (uint256 i = 0; i < memberProjects.length; i++) {
            if (memberProjects[i] == projectId) {
                memberProjects[i] = memberProjects[memberProjects.length - 1];
                memberProjects.pop();
                break;
            }
        }
        
        emit TeamMemberRemoved(projectId, msg.sender, member);
    }
    
    /**
     * @dev Submit project to hackathon with comprehensive validation
     */
    function submitProjectToHackathon(uint256 hackathonId, uint256 projectId) 
        external 
        nonReentrant 
        hackathonExists(hackathonId) 
        projectExists(projectId) 
    {
        require(hackathons[hackathonId].isActive, "HackathonPlatform: Cannot submit to inactive hackathon");
        require(hackathons[hackathonId].currentPhase == Phase.SUBMISSION, "HackathonPlatform: Submission phase is not active");
        require(block.timestamp >= hackathons[hackathonId].submissionStartDate, "HackathonPlatform: Submission period has not started yet");
        require(block.timestamp <= hackathons[hackathonId].submissionDeadline, "HackathonPlatform: Submission deadline has passed");
        require(isRegistered[hackathonId][msg.sender], "HackathonPlatform: Must be registered for hackathon to submit projects");
        require(!isProjectSubmitted[hackathonId][projectId], "HackathonPlatform: Project already submitted to this hackathon");
        
        // Check authorization (creator or team member)
        bool isAuthorized = (projects[projectId].creator == msg.sender);
        if (!isAuthorized) {
            address[] memory teamMembers = projects[projectId].teamMembers;
            for (uint256 i = 0; i < teamMembers.length; i++) {
                if (teamMembers[i] == msg.sender) {
                    isAuthorized = true;
                    break;
                }
            }
        }
        require(isAuthorized, "HackathonPlatform: Only project creator or team members can submit the project");
        
        isProjectSubmitted[hackathonId][projectId] = true;
        hackathonProjects[hackathonId].push(projectId);
        
        emit ProjectSubmittedToHackathon(hackathonId, projectId, msg.sender);
    }
    
    /**
     * @dev Submit score with comprehensive validation
     */
    function submitScore(uint256 projectId, uint256 score, string memory feedbackIpfsHash) 
        external 
        projectExists(projectId)
        validIpfsHash(feedbackIpfsHash)
    {
        require(score >= MIN_SCORE && score <= MAX_SCORE, "HackathonPlatform: Score must be between 1 and 100");
        require(projectScores[projectId][msg.sender] == 0, "HackathonPlatform: Already scored this project");
        
        // Find hackathon and validate judge authorization
        bool isAuthorizedJudge = false;
        uint256 hackathonId = 0;
        
        for (uint256 i = 1; i < nextHackathonId; i++) {
            if (isProjectSubmitted[i][projectId] && isJudge[i][msg.sender]) {
                require(hackathons[i].currentPhase == Phase.JUDGING, "HackathonPlatform: Judging phase is not active for this hackathon");
                require(hackathons[i].isActive, "HackathonPlatform: Cannot judge projects in inactive hackathon");
                isAuthorizedJudge = true;
                hackathonId = i;
                break;
            }
        }
        
        require(isAuthorizedJudge, "HackathonPlatform: Not an authorized judge for this project");
        
        projectScores[projectId][msg.sender] = score;
        projects[projectId].totalScore += score;
        projects[projectId].judgeCount++;
        
        emit ScoreSubmitted(hackathonId, projectId, msg.sender, score, feedbackIpfsHash);
    }
    
    // ========== ENHANCED VIEW FUNCTIONS ==========
    
    function getHackathon(uint256 hackathonId) external view returns (Hackathon memory) {
        require(hackathons[hackathonId].id != 0, "HackathonPlatform: Hackathon does not exist");
        return hackathons[hackathonId];
    }
    
    function getProject(uint256 projectId) external view returns (Project memory) {
        require(projects[projectId].isCreated, "HackathonPlatform: Project does not exist");
        return projects[projectId];
    }
    
    function getProjectTeamMembers(uint256 projectId) external view returns (address[] memory) {
        require(projects[projectId].isCreated, "HackathonPlatform: Project does not exist");
        return projects[projectId].teamMembers;
    }
    
    function getHackathonProjects(uint256 hackathonId) external view returns (uint256[] memory) {
        require(hackathons[hackathonId].id != 0, "HackathonPlatform: Hackathon does not exist");
        return hackathonProjects[hackathonId];
    }
    
    function getHackathonParticipants(uint256 hackathonId) external view returns (address[] memory) {
        require(hackathons[hackathonId].id != 0, "HackathonPlatform: Hackathon does not exist");
        return hackathonParticipants[hackathonId];
    }
    
    function getHackathonJudges(uint256 hackathonId) external view returns (address[] memory) {
        require(hackathons[hackathonId].id != 0, "HackathonPlatform: Hackathon does not exist");
        return hackathonJudges[hackathonId];
    }
    
    function getUserProjects(address user) external view validAddress(user) returns (uint256[] memory) {
        return userProjects[user];
    }
    
    function getUserHackathons(address user) external view validAddress(user) returns (uint256[] memory) {
        return userHackathons[user];
    }
    
    function getOrganizerHackathons(address organizer) external view validAddress(organizer) returns (uint256[] memory) {
        return organizerHackathons[organizer];
    }
    
    function getJudgeAssignments(address judge) external view validAddress(judge) returns (uint256[] memory) {
        return judgeAssignments[judge];
    }
    
    function getProjectScore(uint256 projectId) external view returns (uint256 avgScore, uint256 totalScore, uint256 judgeCount) {
        require(projects[projectId].isCreated, "HackathonPlatform: Project does not exist");
        Project memory project = projects[projectId];
        totalScore = project.totalScore;
        judgeCount = project.judgeCount;
        avgScore = judgeCount > 0 ? totalScore / judgeCount : 0;
    }
    
    function isProjectSubmittedToHackathon(uint256 hackathonId, uint256 projectId) external view returns (bool) {
        return isProjectSubmitted[hackathonId][projectId];
    }
    
    /**
     * @dev Get active hackathons with filtering
     */
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
    
    /**
     * @dev Get hackathons by phase
     */
    function getHackathonsByPhase(Phase phase) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextHackathonId; i++) {
            if (hackathons[i].isActive && hackathons[i].currentPhase == phase) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i < nextHackathonId; i++) {
            if (hackathons[i].isActive && hackathons[i].currentPhase == phase) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get user's submitted projects for a specific hackathon
     */
    function getUserSubmissionsForHackathon(address user, uint256 hackathonId) 
        external 
        view 
        validAddress(user)
        returns (uint256[] memory) 
    {
        uint256[] memory userProjectsList = userProjects[user];
        uint256 count = 0;
        
        // Count submitted projects
        for (uint256 i = 0; i < userProjectsList.length; i++) {
            if (isProjectSubmitted[hackathonId][userProjectsList[i]]) {
                count++;
            }
        }
        
        // Build result array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userProjectsList.length; i++) {
            if (isProjectSubmitted[hackathonId][userProjectsList[i]]) {
                result[index] = userProjectsList[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Check if user can submit project to hackathon
     */
    function canSubmitProject(address user, uint256 hackathonId, uint256 projectId) 
        external 
        view 
        returns (bool canSubmit, string memory reason) 
    {
        if (hackathons[hackathonId].id == 0) {
            return (false, "Hackathon does not exist");
        }
        
        if (!projects[projectId].isCreated) {
            return (false, "Project does not exist");
        }
        
        if (!hackathons[hackathonId].isActive) {
            return (false, "Hackathon is inactive");
        }
        
        if (hackathons[hackathonId].currentPhase != Phase.SUBMISSION) {
            return (false, "Submission phase is not active");
        }
        
        if (block.timestamp < hackathons[hackathonId].submissionStartDate) {
            return (false, "Submission period has not started yet");
        }
        
        if (block.timestamp > hackathons[hackathonId].submissionDeadline) {
            return (false, "Submission deadline has passed");
        }
        
        if (!isRegistered[hackathonId][user]) {
            return (false, "User is not registered for hackathon");
        }
        
        if (isProjectSubmitted[hackathonId][projectId]) {
            return (false, "Project already submitted to this hackathon");
        }
        
        // Check authorization
        bool isAuthorized = (projects[projectId].creator == user);
        if (!isAuthorized) {
            address[] memory teamMembers = projects[projectId].teamMembers;
            for (uint256 i = 0; i < teamMembers.length; i++) {
                if (teamMembers[i] == user) {
                    isAuthorized = true;
                    break;
                }
            }
        }
        
        if (!isAuthorized) {
            return (false, "User is not authorized to submit this project");
        }
        
        return (true, "Can submit project");
    }
    
    function getTotalHackathons() external view returns (uint256) {
        return nextHackathonId - 1;
    }
    
    function getTotalProjects() external view returns (uint256) {
        return nextProjectId - 1;
    }
}