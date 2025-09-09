// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/ProjectRegistry.sol";
import "../contracts/HackathonFactory.sol";

contract ProjectRegistryTest is Test {
    ProjectRegistry public registry;
    HackathonFactory public factory;
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    address public hackathonAddress;
    uint256 public hackathonId;

    function setUp() public {
        owner = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        user3 = address(0x3);
        
        // Deploy factory (deployer is automatically added as organizer)
        factory = new HackathonFactory();
        
        (uint256 returnedId, address returnedAddress) = factory.createHackathon(
            "QmTestHackathonHash",     // ipfsHash
            block.timestamp,          // registrationStart
            block.timestamp + 1 days, // registrationEnd
            block.timestamp + 1 days, // hackathonStart
            block.timestamp + 2 days, // hackathonEnd
            block.timestamp + 3 days, // judgingEnd
            100                       // maxParticipants
        );
        
        hackathonId = returnedId;
        hackathonAddress = returnedAddress;
        
        // Deploy registry and register hackathon
        registry = new ProjectRegistry();
        registry.registerHackathon(hackathonId, hackathonAddress);
    }

    // Constructor Tests
    function test_Constructor() public view {
        assertEq(registry.owner(), owner);
        assertFalse(registry.paused());
        assertEq(registry.getTotalProjects(), 0);
    }

    // Hackathon Registration Tests
    function test_RegisterHackathon() public {
        ProjectRegistry newRegistry = new ProjectRegistry();
        newRegistry.registerHackathon(hackathonId, hackathonAddress);
        
        assertEq(newRegistry.hackathonContracts(hackathonId), hackathonAddress);
    }

    function test_RegisterHackathonZeroAddress() public {
        ProjectRegistry newRegistry = new ProjectRegistry();
        vm.expectRevert("ProjectRegistry: invalid contract address");
        newRegistry.registerHackathon(hackathonId, address(0));
    }

    function test_RegisterHackathonOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        registry.registerHackathon(2, hackathonAddress);
    }

    // Project Creation Tests
    function test_CreateProject() public {
        // Register user1 for hackathon
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(
            hackathonId,
            "QmTestProjectHash123"
        );

        assertEq(projectId, 1);
        assertEq(registry.getTotalProjects(), 1);
        
        // Verify project details
        (
            string memory ipfsHash,
            address creator,
            uint256 hackId,
            ProjectRegistry.SubmissionStatus status,
            uint256 createdAt,
            uint256 submittedAt,
            uint256 teamMemberCount
        ) = registry.getProject(projectId);
        
        assertEq(ipfsHash, "QmTestProjectHash123");
        assertEq(creator, user1);
        assertEq(hackId, hackathonId);
        assertEq(uint256(status), uint256(ProjectRegistry.SubmissionStatus.DRAFT));
        assertGt(createdAt, 0);
        assertEq(submittedAt, 0);
        assertEq(teamMemberCount, 1);
        
        // Verify creator is team member
        assertTrue(registry.isTeamMember(projectId, user1));
        assertEq(registry.getMemberRole(projectId, user1), "Creator");
    }
    
    function test_CreateProjectNotRegistered() public {
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: user not registered for hackathon");
        registry.createProject(hackathonId, "QmTestHash");
    }

    function test_CreateProjectEmptyHash() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: IPFS hash cannot be empty");
        registry.createProject(hackathonId, "");
    }

    function test_CreateProjectDuplicateHash() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        registry.createProject(hackathonId, "QmDuplicateHash");
        
        vm.prank(user2);
        vm.expectRevert("ProjectRegistry: IPFS hash already registered");
        registry.createProject(hackathonId, "QmDuplicateHash");
    }

    function test_CreateProjectUnregisteredHackathon() public {
        vm.expectRevert("ProjectRegistry: hackathon not registered");
        vm.prank(user1);
        registry.createProject(999, "QmTestHash");
    }

    // Project Update Tests
    function test_UpdateProject() public {
        // Create project
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmOriginalHash");
        
        // Update project
        vm.prank(user1);
        registry.updateProject(projectId, "QmUpdatedHash");
        
        (string memory ipfsHash, , , , , , ) = registry.getProject(projectId);
        assertEq(ipfsHash, "QmUpdatedHash");
        
        // Verify old hash is freed up
        assertFalse(registry.registeredIpfsHashes("QmOriginalHash"));
        assertTrue(registry.registeredIpfsHashes("QmUpdatedHash"));
    }

    function test_UpdateProjectNotTeamMember() public {
        // Create project
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmOriginalHash");
        
        // Try to update as non-team member
        vm.prank(user2);
        vm.expectRevert("ProjectRegistry: caller is not a team member");
        registry.updateProject(projectId, "QmUpdatedHash");
    }

    function test_UpdateProjectEmptyHash() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmOriginalHash");
        
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: IPFS hash cannot be empty");
        registry.updateProject(projectId, "");
    }

    function test_UpdateProjectDuplicateHash() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        registry.createProject(hackathonId, "QmHash1");
        vm.prank(user2);
        uint256 projectId2 = registry.createProject(hackathonId, "QmHash2");
        
        vm.prank(user2);
        vm.expectRevert("ProjectRegistry: IPFS hash already registered");
        registry.updateProject(projectId2, "QmHash1");
    }

    // Team Management Tests
    function test_AddTeamMember() public {
        // Create project
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        // Add team member
        vm.prank(user1);
        registry.addTeamMember(projectId, user2, "Developer");
        
        assertTrue(registry.isTeamMember(projectId, user2));
        assertEq(registry.getMemberRole(projectId, user2), "Developer");
        
        address[] memory teamMembers = registry.getTeamMembers(projectId);
        assertEq(teamMembers.length, 2);
        assertEq(teamMembers[0], user1);
        assertEq(teamMembers[1], user2);
    }

    function test_AddTeamMemberNotCreator() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        vm.prank(user2);
        vm.expectRevert("ProjectRegistry: caller is not the project creator");
        registry.addTeamMember(projectId, user2, "Developer");
    }

    function test_AddTeamMemberNotRegistered() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: user not registered for hackathon");
        registry.addTeamMember(projectId, user2, "Developer");
    }

    function test_AddTeamMemberAlreadyMember() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: user is already a team member");
        registry.addTeamMember(projectId, user1, "Another Role");
    }

    function test_RemoveTeamMember() public {
        // Create project and add team member
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        vm.prank(user1);
        registry.addTeamMember(projectId, user2, "Developer");
        
        // Remove team member
        vm.prank(user1);
        registry.removeTeamMember(projectId, user2);
        
        assertFalse(registry.isTeamMember(projectId, user2));
        assertEq(registry.getMemberRole(projectId, user2), "");
        
        address[] memory teamMembers = registry.getTeamMembers(projectId);
        assertEq(teamMembers.length, 1);
        assertEq(teamMembers[0], user1);
    }

    function test_RemoveTeamMemberCreator() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: cannot remove project creator");
        registry.removeTeamMember(projectId, user1);
    }

    function test_RemoveTeamMemberNotCreator() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        vm.prank(user1);
        registry.addTeamMember(projectId, user2, "Developer");
        
        vm.prank(user2);
        vm.expectRevert("ProjectRegistry: caller is not the project creator");
        registry.removeTeamMember(projectId, user2);
    }

    // Project Submission Tests
    function test_SubmitProject() public {
        // Create project
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        // Move to hackathon phase
        vm.warp(block.timestamp + 1 days + 1);
        hackathon.updatePhase();
        
        // Submit project
        vm.prank(user1);
        registry.submitProject(projectId);
        
        (, , , ProjectRegistry.SubmissionStatus status, , uint256 submittedAt, ) = registry.getProject(projectId);
        assertEq(uint256(status), uint256(ProjectRegistry.SubmissionStatus.SUBMITTED));
        assertGt(submittedAt, 0);
    }

    function test_SubmitProjectNotTeamMember() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        // Move to hackathon phase
        vm.warp(block.timestamp + 1 days + 1);
        hackathon.updatePhase();
        
        vm.prank(user2);
        vm.expectRevert("ProjectRegistry: caller is not a team member");
        registry.submitProject(projectId);
    }

    function test_SubmitProjectAlreadySubmitted() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        uint256 projectId = registry.createProject(hackathonId, "QmTestHash");
        
        // Move to hackathon phase
        vm.warp(block.timestamp + 1 days + 1);
        hackathon.updatePhase();
        
        vm.prank(user1);
        registry.submitProject(projectId);
        
        vm.prank(user1);
        vm.expectRevert("ProjectRegistry: project already submitted");
        registry.submitProject(projectId);
    }

    // Access Control Tests
    function test_PauseUnpause() public {
        registry.pause();
        assertTrue(registry.paused());
        
        registry.unpause();
        assertFalse(registry.paused());
    }

    function test_PauseOnlyOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        registry.pause();
    }

    function test_PausedRestrictions() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        registry.pause();
        
        vm.prank(user1);
        vm.expectRevert();
        registry.createProject(hackathonId, "QmTestHash");
    }

    // View Function Tests
    function test_GetProjectsByCreator() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        
        vm.prank(user1);
        registry.createProject(hackathonId, "QmHash1");
        vm.prank(user1);
        registry.createProject(hackathonId, "QmHash2");
        
        uint256[] memory projects = registry.getProjectsByCreator(user1);
        assertEq(projects.length, 2);
        assertEq(projects[0], 1);
        assertEq(projects[1], 2);
    }

    function test_GetHackathonProjects() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        registry.createProject(hackathonId, "QmHash1");
        vm.prank(user2);
        registry.createProject(hackathonId, "QmHash2");
        
        uint256[] memory projects = registry.getHackathonProjects(hackathonId);
        assertEq(projects.length, 2);
        assertEq(projects[0], 1);
        assertEq(projects[1], 2);
    }

    function test_GetSubmittedProjects() public {
        Hackathon hackathon = Hackathon(hackathonAddress);
        vm.prank(user1);
        hackathon.register();
        vm.prank(user2);
        hackathon.register();
        
        vm.prank(user1);
        uint256 project1 = registry.createProject(hackathonId, "QmHash1");
        vm.prank(user2);
        registry.createProject(hackathonId, "QmHash2");
        
        // Move to hackathon phase
        vm.warp(block.timestamp + 1 days + 1);
        hackathon.updatePhase();
        
        // Submit only first project
        vm.prank(user1);
        registry.submitProject(project1);
        
        uint256[] memory submittedProjects = registry.getSubmittedProjects(hackathonId);
        assertEq(submittedProjects.length, 1);
        assertEq(submittedProjects[0], 1);
    }

    // Error Cases
    function test_NonexistentProject() public {
        vm.expectRevert("ProjectRegistry: project does not exist");
        registry.getProject(999);
        
        vm.expectRevert("ProjectRegistry: project does not exist");
        registry.addTeamMember(999, user1, "Developer");
        
        vm.expectRevert("ProjectRegistry: project does not exist");
        registry.removeTeamMember(999, user1);
        
        vm.expectRevert("ProjectRegistry: project does not exist");
        registry.submitProject(999);
        
        vm.expectRevert("ProjectRegistry: project does not exist");
        registry.updateProject(999, "QmNewHash");
    }
}
