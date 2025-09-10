// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SimpleHackathon.sol";

/**
 * @title SimpleProjectRegistry
 * @dev Simplified registry for hackathon project submissions with IPFS metadata
 * @author HackX Team
 */
contract SimpleProjectRegistry is ReentrancyGuard, Ownable {
    // Structs
    struct Project {
        uint256 id;
        string ipfsHash;           // IPFS hash containing all project metadata
        address creator;
        uint256 hackathonId;
        address[] teamMembers;
        uint256 submittedAt;
        bool isSubmitted;
    }

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string ipfsHash,
        address indexed creator,
        uint256 indexed hackathonId
    );
    
    event ProjectSubmitted(uint256 indexed projectId);
    event TeamMemberAdded(uint256 indexed projectId, address indexed member);

    // State variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => address) public hackathonContracts;
    mapping(address => uint256[]) public creatorProjects;
    mapping(uint256 => uint256[]) public hackathonProjects;
    uint256 public nextProjectId;

    // Modifiers
    modifier onlyProjectCreator(uint256 projectId) {
        require(projects[projectId].creator == msg.sender, "Not project creator");
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(projects[projectId].creator != address(0), "Project does not exist");
        _;
    }

    /**
     * @dev Constructor sets the deployer as owner
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a hackathon contract (owner only)
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
     * @dev Create a new project
     * @param ipfsHash IPFS hash containing all project metadata
     * @param hackathonId Hackathon identifier
     * @param teamMembers Array of team member addresses
     * @return projectId The created project ID
     */
    function createProject(
        string memory ipfsHash,
        uint256 hackathonId,
        address[] memory teamMembers
    ) 
        external 
        nonReentrant 
        returns (uint256 projectId) 
    {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(hackathonContracts[hackathonId] != address(0), "Hackathon not registered");
        
        // Verify creator is a participant in the hackathon
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[hackathonId]);
        require(hackathon.isParticipant(msg.sender), "Not a participant in this hackathon");

        projectId = nextProjectId++;
        
        Project storage project = projects[projectId];
        project.id = projectId;
        project.ipfsHash = ipfsHash;
        project.creator = msg.sender;
        project.hackathonId = hackathonId;
        project.teamMembers = teamMembers;
        project.submittedAt = block.timestamp;
        project.isSubmitted = false;

        // Add to mappings
        creatorProjects[msg.sender].push(projectId);
        hackathonProjects[hackathonId].push(projectId);

        emit ProjectCreated(projectId, ipfsHash, msg.sender, hackathonId);
    }

    /**
     * @dev Submit project for judging
     * @param projectId Project identifier
     */
    function submitProject(uint256 projectId) 
        external 
        nonReentrant 
        onlyProjectCreator(projectId) 
        projectExists(projectId) 
    {
        Project storage project = projects[projectId];
        require(!project.isSubmitted, "Project already submitted");
        
        // Check hackathon is in submission phase
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[project.hackathonId]);
        require(
            hackathon.currentPhase() == SimpleHackathon.Phase.SUBMISSION,
            "Hackathon not in submission phase"
        );

        project.isSubmitted = true;
        emit ProjectSubmitted(projectId);
    }

    /**
     * @dev Add team member to project
     * @param projectId Project identifier
     * @param member Address of team member to add
     */
    function addTeamMember(uint256 projectId, address member) 
        external 
        nonReentrant 
        onlyProjectCreator(projectId) 
        projectExists(projectId) 
    {
        require(member != address(0), "Invalid member address");
        
        Project storage project = projects[projectId];
        require(!project.isSubmitted, "Cannot modify submitted project");
        
        // Check if member is already in team
        for (uint i = 0; i < project.teamMembers.length; i++) {
            require(project.teamMembers[i] != member, "Member already in team");
        }
        
        // Verify member is a participant in the hackathon
        SimpleHackathon hackathon = SimpleHackathon(hackathonContracts[project.hackathonId]);
        require(hackathon.isParticipant(member), "Member not a participant in this hackathon");

        project.teamMembers.push(member);
        emit TeamMemberAdded(projectId, member);
    }

    /**
     * @dev Update project metadata (creator only, before submission)
     * @param projectId Project identifier
     * @param newIpfsHash New IPFS hash
     */
    function updateProject(uint256 projectId, string memory newIpfsHash) 
        external 
        onlyProjectCreator(projectId) 
        projectExists(projectId) 
    {
        require(bytes(newIpfsHash).length > 0, "IPFS hash cannot be empty");
        
        Project storage project = projects[projectId];
        require(!project.isSubmitted, "Cannot modify submitted project");

        project.ipfsHash = newIpfsHash;
    }

    // View functions

    /**
     * @dev Get project details
     * @param projectId Project identifier
     * @return project Project struct data
     */
    function getProject(uint256 projectId) 
        external 
        view 
        projectExists(projectId) 
        returns (Project memory project) 
    {
        return projects[projectId];
    }

    /**
     * @dev Get team members for a project
     * @param projectId Project identifier
     * @return Array of team member addresses
     */
    function getTeamMembers(uint256 projectId) 
        external 
        view 
        projectExists(projectId) 
        returns (address[] memory) 
    {
        return projects[projectId].teamMembers;
    }

    /**
     * @dev Get all projects by a creator
     * @param creator Creator address
     * @return Array of project IDs
     */
    function getCreatorProjects(address creator) external view returns (uint256[] memory) {
        return creatorProjects[creator];
    }

    /**
     * @dev Get all projects for a hackathon
     * @param hackathonId Hackathon identifier
     * @return Array of project IDs
     */
    function getHackathonProjects(uint256 hackathonId) external view returns (uint256[] memory) {
        return hackathonProjects[hackathonId];
    }

    /**
     * @dev Get submitted projects for a hackathon
     * @param hackathonId Hackathon identifier
     * @return Array of submitted project IDs
     */
    function getSubmittedProjects(uint256 hackathonId) external view returns (uint256[] memory) {
        uint256[] memory allProjects = hackathonProjects[hackathonId];
        uint256 submittedCount = 0;
        
        // Count submitted projects
        for (uint i = 0; i < allProjects.length; i++) {
            if (projects[allProjects[i]].isSubmitted) {
                submittedCount++;
            }
        }
        
        // Create array of submitted projects
        uint256[] memory submittedProjects = new uint256[](submittedCount);
        uint256 index = 0;
        
        for (uint i = 0; i < allProjects.length; i++) {
            if (projects[allProjects[i]].isSubmitted) {
                submittedProjects[index] = allProjects[i];
                index++;
            }
        }
        
        return submittedProjects;
    }

    /**
     * @dev Get total number of projects
     * @return Total project count
     */
    function getTotalProjects() external view returns (uint256) {
        return nextProjectId;
    }

    /**
     * @dev Check if project is submitted
     * @param projectId Project identifier
     * @return True if project is submitted
     */
    function isProjectSubmitted(uint256 projectId) 
        external 
        view 
        projectExists(projectId) 
        returns (bool) 
    {
        return projects[projectId].isSubmitted;
    }
}
