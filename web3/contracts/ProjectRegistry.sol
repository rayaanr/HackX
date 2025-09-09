// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Hackathon.sol";

/**
 * @title ProjectRegistry
 * @dev Registry for managing hackathon project submissions with IPFS metadata storage
 */
contract ProjectRegistry is ReentrancyGuard, Pausable, Ownable {
    // Enums
    enum SubmissionStatus {
        DRAFT,
        SUBMITTED,
        EVALUATED
    }

    // Structs
    struct Project {
        string ipfsHash;           // IPFS hash containing all project metadata
        address creator;
        uint256 hackathonId;
        SubmissionStatus status;
        uint256 createdAt;
        uint256 submittedAt;
        address[] teamMembers;
        mapping(address => bool) isTeamMember;
        mapping(address => string) memberRoles;
        bool exists;
    }

    // State variables
    mapping(uint256 => Project) public projects;
    mapping(uint256 => address) public hackathonContracts;
    mapping(address => uint256[]) public creatorProjects;
    mapping(uint256 => uint256[]) public hackathonProjects;
    mapping(string => bool) public registeredIpfsHashes; // Prevent duplicate IPFS hashes
    uint256 public nextProjectId;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string ipfsHash,
        address indexed creator,
        uint256 indexed hackathonId
    );
    
    event ProjectUpdated(
        uint256 indexed projectId,
        string newIpfsHash
    );
    
    event TeamMemberAdded(
        uint256 indexed projectId,
        address indexed member,
        string role
    );
    
    event TeamMemberRemoved(
        uint256 indexed projectId,
        address indexed member
    );
    
    event ProjectSubmitted(
        uint256 indexed projectId,
        address indexed submitter,
        uint256 submittedAt
    );
    
    event HackathonRegistered(
        uint256 indexed hackathonId,
        address indexed hackathonContract
    );

    // Modifiers
    modifier projectExists(uint256 _projectId) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        _;
    }

    modifier onlyTeamMember(uint256 _projectId) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        require(
            projects[_projectId].isTeamMember[msg.sender],
            "ProjectRegistry: caller is not a team member"
        );
        _;
    }

    modifier onlyCreator(uint256 _projectId) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        require(
            projects[_projectId].creator == msg.sender,
            "ProjectRegistry: caller is not the project creator"
        );
        _;
    }

    modifier onlyDraftProject(uint256 _projectId) {
        require(
            projects[_projectId].status == SubmissionStatus.DRAFT,
            "ProjectRegistry: project already submitted"
        );
        _;
    }

    constructor() Ownable(msg.sender) {
        nextProjectId = 1;
    }

    /**
     * @dev Register a hackathon contract for validation
     * @param _hackathonId Hackathon ID
     * @param _hackathonContract Address of hackathon contract
     */
    function registerHackathon(
        uint256 _hackathonId,
        address _hackathonContract
    ) external onlyOwner {
        require(
            _hackathonContract != address(0),
            "ProjectRegistry: invalid contract address"
        );
        hackathonContracts[_hackathonId] = _hackathonContract;
        emit HackathonRegistered(_hackathonId, _hackathonContract);
    }

    /**
     * @dev Create a new project with IPFS metadata
     * @param _hackathonId Hackathon ID
     * @param _ipfsHash IPFS hash containing project metadata (name, description, repo URL, etc.)
     * @return projectId The created project ID
     */
    function createProject(
        uint256 _hackathonId,
        string calldata _ipfsHash
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(
            bytes(_ipfsHash).length > 0,
            "ProjectRegistry: IPFS hash cannot be empty"
        );
        require(
            !registeredIpfsHashes[_ipfsHash],
            "ProjectRegistry: IPFS hash already registered"
        );
        
        address hackathonContract = hackathonContracts[_hackathonId];
        require(
            hackathonContract != address(0),
            "ProjectRegistry: hackathon not registered"
        );

        // Validate user is registered for the hackathon
        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            hackathon.isParticipant(msg.sender),
            "ProjectRegistry: user not registered for hackathon"
        );

        uint256 projectId = nextProjectId++;
        Project storage project = projects[projectId];
        
        project.ipfsHash = _ipfsHash;
        project.creator = msg.sender;
        project.hackathonId = _hackathonId;
        project.status = SubmissionStatus.DRAFT;
        project.createdAt = block.timestamp;
        project.exists = true;
        
        // Add creator as team member
        project.teamMembers.push(msg.sender);
        project.isTeamMember[msg.sender] = true;
        project.memberRoles[msg.sender] = "Creator";
        
        // Update mappings
        registeredIpfsHashes[_ipfsHash] = true;
        creatorProjects[msg.sender].push(projectId);
        hackathonProjects[_hackathonId].push(projectId);

        emit ProjectCreated(projectId, _ipfsHash, msg.sender, _hackathonId);
        return projectId;
    }

    /**
     * @dev Update project metadata with new IPFS hash
     * @param _projectId Project ID
     * @param _newIpfsHash New IPFS hash containing updated metadata
     */
    function updateProject(
        uint256 _projectId,
        string calldata _newIpfsHash
    ) 
        external 
        projectExists(_projectId)
        onlyTeamMember(_projectId)
        onlyDraftProject(_projectId)
        whenNotPaused 
        nonReentrant 
    {
        require(
            bytes(_newIpfsHash).length > 0,
            "ProjectRegistry: IPFS hash cannot be empty"
        );
        require(
            !registeredIpfsHashes[_newIpfsHash],
            "ProjectRegistry: IPFS hash already registered"
        );

        Project storage project = projects[_projectId];
        
        // Free up old IPFS hash
        registeredIpfsHashes[project.ipfsHash] = false;
        
        // Set new IPFS hash
        project.ipfsHash = _newIpfsHash;
        registeredIpfsHashes[_newIpfsHash] = true;

        emit ProjectUpdated(_projectId, _newIpfsHash);
    }

    /**
     * @dev Add team member to project
     * @param _projectId Project ID
     * @param _member Member address
     * @param _role Member role
     */
    function addTeamMember(
        uint256 _projectId,
        address _member,
        string calldata _role
    ) 
        external 
        projectExists(_projectId)
        onlyCreator(_projectId)
        onlyDraftProject(_projectId)
        whenNotPaused 
        nonReentrant 
    {
        require(
            _member != address(0),
            "ProjectRegistry: invalid member address"
        );
        require(
            !projects[_projectId].isTeamMember[_member],
            "ProjectRegistry: user is already a team member"
        );

        address hackathonContract = hackathonContracts[projects[_projectId].hackathonId];
        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            hackathon.isParticipant(_member),
            "ProjectRegistry: user not registered for hackathon"
        );

        Project storage project = projects[_projectId];
        project.teamMembers.push(_member);
        project.isTeamMember[_member] = true;
        project.memberRoles[_member] = _role;

        emit TeamMemberAdded(_projectId, _member, _role);
    }

    /**
     * @dev Remove team member from project
     * @param _projectId Project ID
     * @param _member Member address
     */
    function removeTeamMember(
        uint256 _projectId,
        address _member
    ) 
        external 
        projectExists(_projectId)
        onlyCreator(_projectId)
        onlyDraftProject(_projectId)
        whenNotPaused 
        nonReentrant 
    {
        require(
            _member != projects[_projectId].creator,
            "ProjectRegistry: cannot remove project creator"
        );
        require(
            projects[_projectId].isTeamMember[_member],
            "ProjectRegistry: user is not a team member"
        );

        Project storage project = projects[_projectId];
        
        // Remove from team members array
        address[] storage members = project.teamMembers;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == _member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }
        
        // Clean up mappings
        project.isTeamMember[_member] = false;
        delete project.memberRoles[_member];

        emit TeamMemberRemoved(_projectId, _member);
    }

    /**
     * @dev Submit project for evaluation
     * @param _projectId Project ID
     */
    function submitProject(uint256 _projectId) 
        external 
        projectExists(_projectId)
        onlyTeamMember(_projectId)
        onlyDraftProject(_projectId)
        whenNotPaused 
        nonReentrant 
    {
        address hackathonContract = hackathonContracts[projects[_projectId].hackathonId];
        Hackathon hackathon = Hackathon(hackathonContract);
        
        require(
            hackathon.currentPhase() == Hackathon.Phase.Hackathon,
            "ProjectRegistry: submission phase has ended"
        );

        Project storage project = projects[_projectId];
        project.status = SubmissionStatus.SUBMITTED;
        project.submittedAt = block.timestamp;

        emit ProjectSubmitted(_projectId, msg.sender, block.timestamp);
    }

    // View functions
    function getProject(uint256 _projectId) 
        external 
        view 
        projectExists(_projectId)
        returns (
            string memory ipfsHash,
            address creator,
            uint256 hackathonId,
            SubmissionStatus status,
            uint256 createdAt,
            uint256 submittedAt,
            uint256 teamMemberCount
        ) 
    {
        Project storage project = projects[_projectId];
        return (
            project.ipfsHash,
            project.creator,
            project.hackathonId,
            project.status,
            project.createdAt,
            project.submittedAt,
            project.teamMembers.length
        );
    }

    function getTeamMembers(uint256 _projectId) 
        external 
        view 
        projectExists(_projectId)
        returns (address[] memory) 
    {
        return projects[_projectId].teamMembers;
    }

    function getMemberRole(uint256 _projectId, address _member) 
        external 
        view 
        projectExists(_projectId)
        returns (string memory) 
    {
        return projects[_projectId].memberRoles[_member];
    }

    function isTeamMember(uint256 _projectId, address _member) 
        external 
        view 
        projectExists(_projectId)
        returns (bool) 
    {
        return projects[_projectId].isTeamMember[_member];
    }

    function getProjectsByCreator(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorProjects[_creator];
    }

    function getHackathonProjects(uint256 _hackathonId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return hackathonProjects[_hackathonId];
    }

    function getSubmittedProjects(uint256 _hackathonId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory allProjects = hackathonProjects[_hackathonId];
        uint256 count = 0;
        
        // Count submitted projects
        for (uint256 i = 0; i < allProjects.length; i++) {
            if (projects[allProjects[i]].status == SubmissionStatus.SUBMITTED) {
                count++;
            }
        }
        
        // Create result array
        uint256[] memory submittedProjects = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allProjects.length; i++) {
            if (projects[allProjects[i]].status == SubmissionStatus.SUBMITTED) {
                submittedProjects[index] = allProjects[i];
                index++;
            }
        }
        
        return submittedProjects;
    }

    function getTotalProjects() external view returns (uint256) {
        return nextProjectId - 1;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
