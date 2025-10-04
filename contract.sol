// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title HackX
 * @notice A decentralized platform for hackathon management
 */
contract HackX is Ownable, ReentrancyGuard {
    
    struct Hackathon {
        uint256 id;
        string ipfsHash;
        address organizer;
        uint256 registrationStartDate;
        uint256 registrationDeadline;
        uint256 submissionStartDate;
        uint256 submissionDeadline;
        uint256 judgingStartDate;
        uint256 judgingDeadline;
        bool isActive;
    }
    
    struct Project {
        uint256 id;
        string ipfsHash;
        address creator;
        address[] teamMembers;
        bool isCreated;
    }
    
    // Events
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

    // Per-hackathon scoring & feedback
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public projectScoresByHack;
    mapping(uint256 => mapping(uint256 => mapping(address => string))) public judgeFeedbackIpfsByHack;

    // Per-hackathon aggregates
    mapping(uint256 => mapping(uint256 => uint256)) public projectTotalScoreByHack;
    mapping(uint256 => mapping(uint256 => uint256)) public projectJudgeCountByHack;
    
    // Enumeration mappings
    mapping(uint256 => address[]) public hackathonParticipants;
    mapping(uint256 => uint256[]) public hackathonProjects;
    mapping(uint256 => uint256[]) public projectHackathons; // projectId => hackathonIds
    mapping(uint256 => address[]) public hackathonJudges;
    mapping(address => uint256[]) public userProjects;
    mapping(address => uint256[]) public judgeAssignments;
    mapping(address => uint256[]) public userHackathons;
    mapping(address => uint256[]) public organizerHackathons;
    
    // Constants
    uint256 private constant MIN_DEADLINE_BUFFER = 1 minutes;
    uint256 private constant MAX_SCORE = 100;
    uint256 private constant MIN_SCORE = 1;
    
    constructor() Ownable(msg.sender) {}
    
    // Modifiers
    modifier hackathonExists(uint256 hackathonId) {
        require(hackathons[hackathonId].id != 0, "HackX: Hackathon does not exist");
        _;
    }
    
    modifier projectExists(uint256 projectId) {
        require(projects[projectId].isCreated, "HackX: Project does not exist");
        _;
    }
    
    modifier onlyHackathonOrganizer(uint256 hackathonId) {
        require(hackathons[hackathonId].organizer == msg.sender, "HackX: Only hackathon organizer can perform this action");
        _;
    }
    
    modifier onlyProjectCreator(uint256 projectId) {
        require(projects[projectId].creator == msg.sender, "HackX: Only project creator can perform this action");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "HackX: Invalid zero address provided");
        _;
    }
    
    modifier validIpfsHash(string memory ipfsHash) {
        require(bytes(ipfsHash).length > 0, "HackX: IPFS hash cannot be empty");
        require(bytes(ipfsHash).length <= 256, "HackX: IPFS hash too long");
        _;
    }

    // Timeline validation (all phase starts/ends explicit)
    modifier validDeadlines(
        uint256 regStart,
        uint256 regEnd,
        uint256 subStart,
        uint256 subEnd,
        uint256 judgeStart,
        uint256 judgeEnd
    ) {
        // Registration phase validation
        require(regStart > block.timestamp + MIN_DEADLINE_BUFFER, "HackX: Registration start must be in the future");
        require(regEnd > regStart + MIN_DEADLINE_BUFFER, "HackX: Registration end must be after start + buffer");
        
        // Submission phase validation - can start during or after registration
        require(subStart >= regStart, "HackX: Submission cannot start before registration");
        require(subEnd > subStart + MIN_DEADLINE_BUFFER, "HackX: Submission end must be after start + buffer");
        
        // Judging phase validation - must start after submission ends
        require(judgeStart > subEnd + MIN_DEADLINE_BUFFER, "HackX: Judging start must be after submission end + buffer");
        require(judgeEnd > judgeStart + MIN_DEADLINE_BUFFER, "HackX: Judging end must be after start + buffer");
        _;
    }
    
    /**
     * @dev Create hackathon with comprehensive validation
     */
    function createHackathon(
        string memory ipfsHash,
        uint256 registrationStartDate,
        uint256 registrationDeadline,
        uint256 submissionStartDate,
        uint256 submissionDeadline,
        uint256 judgingStartDate,
        uint256 judgingDeadline,
        address[] memory initialJudges
    ) external 
        validIpfsHash(ipfsHash)
        validDeadlines(
            registrationStartDate,
            registrationDeadline,
            submissionStartDate,
            submissionDeadline,
            judgingStartDate,
            judgingDeadline
        )
        returns (uint256) 
    {
        uint256 hackathonId = nextHackathonId++;
        
        // Create hackathon
        hackathons[hackathonId] = Hackathon({
            id: hackathonId,
            ipfsHash: ipfsHash,
            organizer: msg.sender,
            registrationStartDate: registrationStartDate,
            registrationDeadline: registrationDeadline,
            submissionStartDate: submissionStartDate,
            submissionDeadline: submissionDeadline,
            judgingStartDate: judgingStartDate,
            judgingDeadline: judgingDeadline,
            isActive: true
        });

        // Validate and add initial judges with duplicate prevention
        for (uint256 i = 0; i < initialJudges.length; i++) {
            address judge = initialJudges[i];
            
            // Basic validations
            require(judge != address(0), "HackX: Invalid judge address");
            require(judge != msg.sender, "HackX: Organizer cannot be judge");
            
            // Skip duplicates (gas efficient approach)
            if (isJudge[hackathonId][judge]) {
                continue;
            }
            
            // Add judge
            isJudge[hackathonId][judge] = true;
            hackathonJudges[hackathonId].push(judge);
            judgeAssignments[judge].push(hackathonId);
            
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
        require(hackathons[hackathonId].isActive, "HackX: Cannot update inactive hackathon");
        hackathons[hackathonId].ipfsHash = newIpfsHash;
        
        emit HackathonMetadataUpdated(hackathonId, msg.sender, newIpfsHash);
    }
    
    /**
     * @dev Deactivate hackathon (only organizer)
     */
    function deactivateHackathon(uint256 hackathonId) 
        external 
        onlyHackathonOrganizer(hackathonId) 
        hackathonExists(hackathonId) 
    {
        require(hackathons[hackathonId].isActive, "HackX: Hackathon is already inactive");
        
        hackathons[hackathonId].isActive = false;
        emit HackathonDeactivated(hackathonId, msg.sender);
    }
    
    /**
     * @dev Delete hackathon completely (only contract owner)
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
        
        // Clear project submissions
        uint256[] storage submittedProjects = hackathonProjects[hackathonId];
        for (uint256 i = 0; i < submittedProjects.length; i++) {
            isProjectSubmitted[hackathonId][submittedProjects[i]] = false;
            delete projectTotalScoreByHack[hackathonId][submittedProjects[i]];
            delete projectJudgeCountByHack[hackathonId][submittedProjects[i]];
            // Remove hackathon from project's hackathon list
            uint256[] storage pHackathons = projectHackathons[submittedProjects[i]];
            for (uint256 k = 0; k < pHackathons.length; k++) {
                if (pHackathons[k] == hackathonId) {
                    pHackathons[k] = pHackathons[pHackathons.length - 1];
                    pHackathons.pop();
                    break;
                }
            }
            // If no more hackathons for this project, clear the array storage
            if (pHackathons.length == 0) {
                delete projectHackathons[submittedProjects[i]];
            }
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
        require(hackathons[hackathonId].isActive, "HackX: Cannot add judge to inactive hackathon");
        require(!isJudge[hackathonId][judge], "HackX: Address is already a judge for this hackathon");
        require(judge != hackathons[hackathonId].organizer, "HackX: Organizer cannot be a judge");
        
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
        require(isJudge[hackathonId][judge], "HackX: Address is not a judge for this hackathon");
        
        // Disallow removal during judging period (between judgingStartDate and judgingDeadline)
        require(
            block.timestamp < hackathons[hackathonId].judgingStartDate || 
            block.timestamp > hackathons[hackathonId].judgingDeadline, 
            "HackX: Cannot remove judge during judging period"
        );
        
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
     * @dev Register for hackathon
     */
    function registerForHackathon(uint256 hackathonId) 
        external 
        nonReentrant 
        hackathonExists(hackathonId)
    {
        Hackathon storage h = hackathons[hackathonId];

        require(h.isActive, "HackX: Cannot register for inactive hackathon");
        require(block.timestamp >= h.registrationStartDate, "HackX: Registration has not started");
        require(block.timestamp <= h.registrationDeadline, "HackX: Registration deadline has passed");
        require(!isRegistered[hackathonId][msg.sender], "HackX: Already registered for this hackathon");
        require(!isJudge[hackathonId][msg.sender], "HackX: Judges cannot register as participants");
        
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
            isCreated: true
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
        require(member != projects[projectId].creator, "HackX: Project creator is already part of the team");
        
        // Check if member already exists
        address[] memory currentMembers = projects[projectId].teamMembers;
        for (uint256 i = 0; i < currentMembers.length; i++) {
            require(currentMembers[i] != member, "HackX: Address is already a team member");
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
        
        require(found, "HackX: Address is not a team member");
        
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
     * @dev Submit project to hackathon
     */
    function submitProjectToHackathon(uint256 hackathonId, uint256 projectId) 
        external 
        nonReentrant 
        hackathonExists(hackathonId) 
        projectExists(projectId) 
    {
        Hackathon storage h = hackathons[hackathonId];

        require(h.isActive, "HackX: Cannot submit to inactive hackathon");
        require(block.timestamp >= h.submissionStartDate, "HackX: Submission period has not started yet");
        require(block.timestamp <= h.submissionDeadline, "HackX: Submission deadline has passed");
        require(isRegistered[hackathonId][msg.sender], "HackX: Must be registered for hackathon to submit projects");
        require(!isProjectSubmitted[hackathonId][projectId], "HackX: Project already submitted to this hackathon");
        
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
        require(isAuthorized, "HackX: Only project creator or team members can submit the project");
        
        isProjectSubmitted[hackathonId][projectId] = true;
        hackathonProjects[hackathonId].push(projectId);
        projectHackathons[projectId].push(hackathonId);
        
        emit ProjectSubmittedToHackathon(hackathonId, projectId, msg.sender);
    }
    
    /**
     * @dev Submit score for a project in a specific hackathon
     */
    function submitScore(
        uint256 hackathonId,
        uint256 projectId,
        uint256 score,
        string memory feedbackIpfsHash
    )
        external
        projectExists(projectId)
        hackathonExists(hackathonId)
        validIpfsHash(feedbackIpfsHash)
    {
        Hackathon storage h = hackathons[hackathonId];
        require(h.isActive, "HackX: Inactive hackathon");
        require(isProjectSubmitted[hackathonId][projectId], "HackX: Project not submitted to this hackathon");
        require(isJudge[hackathonId][msg.sender], "HackX: Not a judge for this hackathon");
        require(block.timestamp >= h.judgingStartDate, "HackX: Judging period has not started yet");
        require(block.timestamp <= h.judgingDeadline, "HackX: Judging deadline has passed");
        require(score >= MIN_SCORE && score <= MAX_SCORE, "HackX: Score must be between 1 and 100");
        require(projectScoresByHack[hackathonId][projectId][msg.sender] == 0, "HackX: Already scored this project");
        
        projectScoresByHack[hackathonId][projectId][msg.sender] = score;
        judgeFeedbackIpfsByHack[hackathonId][projectId][msg.sender] = feedbackIpfsHash;

        projectTotalScoreByHack[hackathonId][projectId] += score;
        projectJudgeCountByHack[hackathonId][projectId] += 1;
        
        emit ScoreSubmitted(hackathonId, projectId, msg.sender, score, feedbackIpfsHash);
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    function getHackathon(uint256 hackathonId) external view returns (Hackathon memory) {
        require(hackathons[hackathonId].id != 0, "HackX: Hackathon does not exist");
        return hackathons[hackathonId];
    }
    
    function getProject(uint256 projectId) external view returns (Project memory) {
        require(projects[projectId].isCreated, "HackX: Project does not exist");
        return projects[projectId];
    }
    
    function getProjectTeamMembers(uint256 projectId) external view returns (address[] memory) {
        require(projects[projectId].isCreated, "HackX: Project does not exist");
        return projects[projectId].teamMembers;
    }
    
    function getHackathonProjects(uint256 hackathonId) external view returns (uint256[] memory) {
        require(hackathons[hackathonId].id != 0, "HackX: Hackathon does not exist");
        return hackathonProjects[hackathonId];
    }
    
    function getHackathonParticipants(uint256 hackathonId) external view returns (address[] memory) {
        require(hackathons[hackathonId].id != 0, "HackX: Hackathon does not exist");
        return hackathonParticipants[hackathonId];
    }
    
    function getHackathonJudges(uint256 hackathonId) external view returns (address[] memory) {
        require(hackathons[hackathonId].id != 0, "HackX: Hackathon does not exist");
        return hackathonJudges[hackathonId];
    }

    /**
     * @dev Check if a judge has submitted and get their feedback IPFS
     */
    function getJudgeEvaluation(uint256 hackathonId, uint256 projectId, address judge)
        external
        view
        projectExists(projectId)
        hackathonExists(hackathonId)
        validAddress(judge)
        returns (bool submitted, string memory feedbackIpfsHash)
    {
        submitted = projectScoresByHack[hackathonId][projectId][judge] != 0;
        feedbackIpfsHash = judgeFeedbackIpfsByHack[hackathonId][projectId][judge];
    }

    /**
     * @dev Check if judge has scored a project
     */
    function hasJudgeScored(uint256 hackathonId, uint256 projectId, address judge)
        external
        view
        returns (bool)
    {
        return projectScoresByHack[hackathonId][projectId][judge] != 0;
    }

    /**
     * @dev Get per-hackathon score statistics for a project
     */
    function getProjectScore(uint256 hackathonId, uint256 projectId)
        external
        view
        hackathonExists(hackathonId)
        projectExists(projectId)
        returns (uint256 avgScore, uint256 totalScore, uint256 judgeCount)
    {
        totalScore = projectTotalScoreByHack[hackathonId][projectId];
        judgeCount = projectJudgeCountByHack[hackathonId][projectId];
        avgScore = judgeCount > 0 ? totalScore / judgeCount : 0;
    }
    
    function isProjectSubmittedToHackathon(uint256 hackathonId, uint256 projectId) external view returns (bool) {
        return isProjectSubmitted[hackathonId][projectId];
    }
    
    /**
     * @dev Get active hackathons
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

    function getTotalHackathons() external view returns (uint256) {
        return nextHackathonId - 1;
    }
    
    function getTotalProjects() external view returns (uint256) {
        return nextProjectId - 1;
    }
}