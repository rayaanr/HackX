// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Hackathon.sol";

/**
 * @title ProjectRegistry
 * @dev Project submission and metadata management system
 * @author HackX Team
 */
contract ProjectRegistry is ReentrancyGuard, Pausable, Ownable {
    // Enums
    enum SubmissionStatus {
        Draft, // Project created but not submitted
        Submitted, // Project submitted before deadline
        Evaluated // Project has been evaluated by judges
    }

    // Structs
    struct Project {
        uint256 projectId;
        uint256 hackathonId;
        address teamLead;
        string name;
        string description;
        string ipfsHash; // IPFS hash for detailed project data
        string repositoryUrl;
        string demoUrl;
        string[] techStack;
        SubmissionStatus status;
        uint256 submissionTimestamp;
        bool exists;
    }

    struct TeamMember {
        address member;
        string role;
        bool isActive;
        uint256 joinedAt;
    }

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        uint256 indexed hackathonId,
        address indexed teamLead,
        string name
    );

    event ProjectSubmitted(
        uint256 indexed projectId,
        uint256 indexed hackathonId,
        address indexed teamLead,
        uint256 timestamp
    );

    event TeamMemberAdded(
        uint256 indexed projectId,
        address indexed member,
        string role
    );

    event TeamMemberRemoved(uint256 indexed projectId, address indexed member);

    event ProjectUpdated(
        uint256 indexed projectId,
        string field,
        string newValue
    );

    // State variables
    uint256 private nextProjectId;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => address[]) public projectTeamMembers;
    mapping(uint256 => mapping(address => TeamMember)) public teamMemberDetails;
    mapping(uint256 => uint256[]) public hackathonProjects; // hackathonId => projectIds
    mapping(address => uint256[]) public userProjects; // user => projectIds
    mapping(string => bool) public registeredRepositories; // prevent duplicate repos

    // Hackathon contract reference for validation
    mapping(uint256 => address) public hackathonContracts;

    // Modifiers
    modifier onlyTeamLead(uint256 _projectId) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        require(
            projects[_projectId].teamLead == msg.sender,
            "ProjectRegistry: caller is not team lead"
        );
        _;
    }

    modifier onlyTeamMember(uint256 _projectId) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        require(
            projects[_projectId].teamLead == msg.sender ||
                teamMemberDetails[_projectId][msg.sender].isActive,
            "ProjectRegistry: caller is not a team member"
        );
        _;
    }

    modifier onlyBeforeDeadline(uint256 _projectId) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        uint256 hackathonId = projects[_projectId].hackathonId;
        address hackathonContract = hackathonContracts[hackathonId];
        require(
            hackathonContract != address(0),
            "ProjectRegistry: hackathon contract not registered"
        );

        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            block.timestamp <= hackathon.hackathonEnd(),
            "ProjectRegistry: submission deadline passed"
        );
        _;
    }

    modifier onlyDraftStatus(uint256 _projectId) {
        require(
            projects[_projectId].status == SubmissionStatus.Draft,
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
    }

    /**
     * @dev Create a new project (draft state)
     * @param _hackathonId Hackathon ID
     * @param _name Project name
     * @param _description Project description
     * @param _repositoryUrl Repository URL
     * @return projectId The created project ID
     */
    function createProject(
        uint256 _hackathonId,
        string calldata _name,
        string calldata _description,
        string calldata _repositoryUrl
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(
            bytes(_name).length > 0,
            "ProjectRegistry: name cannot be empty"
        );
        require(
            bytes(_repositoryUrl).length > 0,
            "ProjectRegistry: repository URL cannot be empty"
        );
        require(
            !registeredRepositories[_repositoryUrl],
            "ProjectRegistry: repository already registered"
        );

        // Validate hackathon exists and caller is registered participant
        address hackathonContract = hackathonContracts[_hackathonId];
        require(
            hackathonContract != address(0),
            "ProjectRegistry: hackathon not registered"
        );

        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            hackathon.isParticipant(msg.sender),
            "ProjectRegistry: caller is not a participant"
        );
        require(
            hackathon.currentPhase() == Hackathon.Phase.Hackathon,
            "ProjectRegistry: not in hackathon phase"
        );

        uint256 projectId = nextProjectId++;

        projects[projectId] = Project({
            projectId: projectId,
            hackathonId: _hackathonId,
            teamLead: msg.sender,
            name: _name,
            description: _description,
            ipfsHash: "",
            repositoryUrl: _repositoryUrl,
            demoUrl: "",
            techStack: new string[](0),
            status: SubmissionStatus.Draft,
            submissionTimestamp: 0,
            exists: true
        });

        // Add team lead as first team member
        projectTeamMembers[projectId].push(msg.sender);
        teamMemberDetails[projectId][msg.sender] = TeamMember({
            member: msg.sender,
            role: "Team Lead",
            isActive: true,
            joinedAt: block.timestamp
        });

        // Update mappings
        hackathonProjects[_hackathonId].push(projectId);
        userProjects[msg.sender].push(projectId);
        registeredRepositories[_repositoryUrl] = true;

        emit ProjectCreated(projectId, _hackathonId, msg.sender, _name);
        return projectId;
    }

    /**
     * @dev Add a team member to project
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
        onlyTeamLead(_projectId)
        onlyDraftStatus(_projectId)
        whenNotPaused
    {
        require(
            _member != address(0),
            "ProjectRegistry: invalid member address"
        );
        require(
            bytes(_role).length > 0,
            "ProjectRegistry: role cannot be empty"
        );
        require(
            !teamMemberDetails[_projectId][_member].isActive,
            "ProjectRegistry: member already added"
        );

        // Validate member is registered participant
        uint256 hackathonId = projects[_projectId].hackathonId;
        address hackathonContract = hackathonContracts[hackathonId];
        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            hackathon.isParticipant(_member),
            "ProjectRegistry: member is not a participant"
        );

        projectTeamMembers[_projectId].push(_member);
        teamMemberDetails[_projectId][_member] = TeamMember({
            member: _member,
            role: _role,
            isActive: true,
            joinedAt: block.timestamp
        });

        userProjects[_member].push(_projectId);

        emit TeamMemberAdded(_projectId, _member, _role);
    }

    /**
     * @dev Remove a team member from project
     * @param _projectId Project ID
     * @param _member Member address
     */
    function removeTeamMember(
        uint256 _projectId,
        address _member
    )
        external
        onlyTeamLead(_projectId)
        onlyDraftStatus(_projectId)
        whenNotPaused
    {
        require(
            _member != projects[_projectId].teamLead,
            "ProjectRegistry: cannot remove team lead"
        );
        require(
            teamMemberDetails[_projectId][_member].isActive,
            "ProjectRegistry: member not found"
        );

        teamMemberDetails[_projectId][_member].isActive = false;

        // Remove from projectTeamMembers array
        address[] storage members = projectTeamMembers[_projectId];
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == _member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }

        // Remove from userProjects array
        uint256[] storage userProjectsArray = userProjects[_member];
        for (uint256 i = 0; i < userProjectsArray.length; i++) {
            if (userProjectsArray[i] == _projectId) {
                userProjectsArray[i] = userProjectsArray[
                    userProjectsArray.length - 1
                ];
                userProjectsArray.pop();
                break;
            }
        }

        emit TeamMemberRemoved(_projectId, _member);
    }

    /**
     * @dev Update project basic details
     * @param _projectId Project ID
     * @param _name New name
     * @param _description New description
     */
    function updateProjectBasics(
        uint256 _projectId,
        string calldata _name,
        string calldata _description
    )
        external
        onlyTeamMember(_projectId)
        onlyDraftStatus(_projectId)
        onlyBeforeDeadline(_projectId)
        whenNotPaused
    {
        require(
            bytes(_name).length > 0,
            "ProjectRegistry: name cannot be empty"
        );

        Project storage project = projects[_projectId];
        project.name = _name;
        project.description = _description;

        emit ProjectUpdated(_projectId, "basics", "updated");
    }

    /**
     * @dev Update project demo and IPFS hash
     * @param _projectId Project ID
     * @param _demoUrl Demo URL
     * @param _ipfsHash IPFS hash for detailed project data
     */
    function updateProjectMedia(
        uint256 _projectId,
        string calldata _demoUrl,
        string calldata _ipfsHash
    )
        external
        onlyTeamMember(_projectId)
        onlyDraftStatus(_projectId)
        onlyBeforeDeadline(_projectId)
        whenNotPaused
    {
        Project storage project = projects[_projectId];
        project.demoUrl = _demoUrl;
        project.ipfsHash = _ipfsHash;

        emit ProjectUpdated(_projectId, "media", "updated");
    }

    /**
     * @dev Update project tech stack
     * @param _projectId Project ID
     * @param _techStack Tech stack array
     */
    function updateProjectTechStack(
        uint256 _projectId,
        string[] calldata _techStack
    )
        external
        onlyTeamMember(_projectId)
        onlyDraftStatus(_projectId)
        onlyBeforeDeadline(_projectId)
        whenNotPaused
    {
        Project storage project = projects[_projectId];
        project.techStack = _techStack;

        emit ProjectUpdated(_projectId, "techstack", "updated");
    }

    /**
     * @dev Submit project for evaluation
     * @param _projectId Project ID
     */
    function submitProject(
        uint256 _projectId
    )
        external
        onlyTeamMember(_projectId)
        onlyDraftStatus(_projectId)
        onlyBeforeDeadline(_projectId)
        whenNotPaused
    {
        Project storage project = projects[_projectId];
        require(
            bytes(project.ipfsHash).length > 0,
            "ProjectRegistry: IPFS hash required for submission"
        );
        require(
            bytes(project.demoUrl).length > 0,
            "ProjectRegistry: demo URL required for submission"
        );
        require(
            project.techStack.length > 0,
            "ProjectRegistry: tech stack required for submission"
        );

        project.status = SubmissionStatus.Submitted;
        project.submissionTimestamp = block.timestamp;

        emit ProjectSubmitted(
            _projectId,
            project.hackathonId,
            project.teamLead,
            block.timestamp
        );
    }

    /**
     * @dev Mark project as evaluated (only called by judge contracts)
     * @param _projectId Project ID
     */
    function markAsEvaluated(uint256 _projectId) external whenNotPaused {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        require(
            projects[_projectId].status == SubmissionStatus.Submitted,
            "ProjectRegistry: project not submitted"
        );

        // This would typically be called by a judge contract
        // For now, allow owner to mark as evaluated for testing
        require(
            msg.sender == owner(),
            "ProjectRegistry: caller is not authorized"
        );

        projects[_projectId].status = SubmissionStatus.Evaluated;
    }

    /**
     * @dev Get project details
     * @param _projectId Project ID
     */
    function getProject(
        uint256 _projectId
    )
        external
        view
        returns (
            uint256 hackathonId,
            address teamLead,
            string memory name,
            string memory description,
            string memory ipfsHash,
            string memory repositoryUrl,
            string memory demoUrl,
            SubmissionStatus status,
            uint256 submissionTimestamp
        )
    {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );

        Project storage project = projects[_projectId];
        return (
            project.hackathonId,
            project.teamLead,
            project.name,
            project.description,
            project.ipfsHash,
            project.repositoryUrl,
            project.demoUrl,
            project.status,
            project.submissionTimestamp
        );
    }

    /**
     * @dev Get project tech stack
     * @param _projectId Project ID
     */
    function getProjectTechStack(
        uint256 _projectId
    ) external view returns (string[] memory) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        return projects[_projectId].techStack;
    }

    /**
     * @dev Get team members for a project
     * @param _projectId Project ID
     */
    function getProjectTeamMembers(
        uint256 _projectId
    ) external view returns (address[] memory) {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        return projectTeamMembers[_projectId];
    }

    /**
     * @dev Get team member details
     * @param _projectId Project ID
     * @param _member Member address
     */
    function getTeamMemberDetails(
        uint256 _projectId,
        address _member
    )
        external
        view
        returns (string memory role, bool isActive, uint256 joinedAt)
    {
        require(
            projects[_projectId].exists,
            "ProjectRegistry: project does not exist"
        );
        TeamMember storage member = teamMemberDetails[_projectId][_member];
        return (member.role, member.isActive, member.joinedAt);
    }

    /**
     * @dev Get projects for a hackathon
     * @param _hackathonId Hackathon ID
     */
    function getHackathonProjects(
        uint256 _hackathonId
    ) external view returns (uint256[] memory) {
        return hackathonProjects[_hackathonId];
    }

    /**
     * @dev Get projects for a user
     * @param _user User address
     */
    function getUserProjects(
        address _user
    ) external view returns (uint256[] memory) {
        return userProjects[_user];
    }

    /**
     * @dev Get submitted projects for a hackathon
     * @param _hackathonId Hackathon ID
     */
    function getSubmittedProjects(
        uint256 _hackathonId
    ) external view returns (uint256[] memory) {
        uint256[] memory allProjects = hackathonProjects[_hackathonId];
        uint256[] memory submittedProjects = new uint256[](allProjects.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allProjects.length; i++) {
            if (projects[allProjects[i]].status == SubmissionStatus.Submitted) {
                submittedProjects[count] = allProjects[i];
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = submittedProjects[i];
        }

        return result;
    }

    /**
     * @dev Get total project count
     */
    function getTotalProjects() external view returns (uint256) {
        return nextProjectId - 1;
    }

    /**
     * @dev Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
