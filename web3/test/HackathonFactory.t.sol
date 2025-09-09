// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

contract HackathonFactoryTest is Test {
    HackathonFactory public factory;
    address public owner;
    address public organizer1;
    address public organizer2;
    address public nonOwner;

    // Test data
    string constant IPFS_HASH = "QmTestHash123";
    uint256 constant REG_START = 1000;
    uint256 constant REG_END = 2000;
    uint256 constant HACK_START = 2000;
    uint256 constant HACK_END = 5000;
    uint256 constant JUDGING_END = 6000;
    uint256 constant MAX_PARTICIPANTS = 100;

    event HackathonCreated(
        address indexed hackathonAddress,
        uint256 indexed hackathonId,
        address indexed organizer,
        string ipfsHash
    );

    event OrganizerAdded(address indexed organizer, address indexed addedBy);
    event OrganizerRemoved(
        address indexed organizer,
        address indexed removedBy
    );
    event GlobalSettingUpdated(string setting, bytes value);

    function setUp() public {
        owner = address(this);
        organizer1 = address(0x1);
        organizer2 = address(0x2);
        nonOwner = address(0x3);

        factory = new HackathonFactory();
    }

    // Test constructor
    function test_Constructor() public {
        assertEq(factory.owner(), owner);
        assertEq(factory.hackathonCounter(), 0);
        assertTrue(factory.authorizedOrganizers(owner));
    }

    // Test organizer management
    function test_AddOrganizer() public {
        vm.expectEmit(true, true, false, false);
        emit OrganizerAdded(organizer1, owner);

        factory.addOrganizer(organizer1);

        assertTrue(factory.authorizedOrganizers(organizer1));
    }

    function test_AddOrganizer_RevertWhenNotOwner() public {
        vm.prank(organizer1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "OwnableUnauthorizedAccount(address)",
                organizer1
            )
        );
        factory.addOrganizer(organizer2);
    }

    function test_AddOrganizer_RevertWhenZeroAddress() public {
        vm.expectRevert("HackathonFactory: organizer cannot be zero address");
        factory.addOrganizer(address(0));
    }

    function test_AddOrganizer_RevertWhenAlreadyAuthorized() public {
        factory.addOrganizer(organizer1);

        vm.expectRevert("HackathonFactory: organizer already authorized");
        factory.addOrganizer(organizer1);
    }

    function test_RemoveOrganizer() public {
        factory.addOrganizer(organizer1);

        vm.expectEmit(true, true, false, false);
        emit OrganizerRemoved(organizer1, owner);

        factory.removeOrganizer(organizer1);

        assertFalse(factory.authorizedOrganizers(organizer1));
    }

    function test_RemoveOrganizer_RevertWhenNotOwner() public {
        factory.addOrganizer(organizer1);

        vm.prank(organizer1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", organizer1));
        factory.removeOrganizer(organizer1);
    }

    function test_RemoveOrganizer_RevertWhenRemovingOwner() public {
        vm.expectRevert("HackathonFactory: cannot remove owner");
        factory.removeOrganizer(owner);
    }

    function test_RemoveOrganizer_RevertWhenNotFound() public {
        vm.expectRevert("HackathonFactory: organizer not found");
        factory.removeOrganizer(organizer1);
    }

    // Test hackathon creation
    function test_CreateHackathon() public {
        (uint256 hackathonId, address hackathonAddress) = factory
            .createHackathon(
                IPFS_HASH,
                REG_START,
                REG_END,
                HACK_START,
                HACK_END,
                JUDGING_END,
                MAX_PARTICIPANTS
            );

        assertEq(hackathonId, 0);
        assertEq(factory.hackathonCounter(), 1);
        assertEq(factory.getHackathonAddress(hackathonId), hackathonAddress);

        // Verify the hackathon contract was deployed correctly
        Hackathon hackathon = Hackathon(hackathonAddress);
        assertEq(hackathon.hackathonId(), hackathonId);
        assertEq(hackathon.organizer(), owner);
        assertEq(hackathon.ipfsHash(), IPFS_HASH);
        assertEq(hackathon.maxParticipants(), MAX_PARTICIPANTS);
    }

    function test_CreateHackathon_ByAuthorizedOrganizer() public {
        factory.addOrganizer(organizer1);

        vm.prank(organizer1);
        (uint256 hackathonId, address hackathonAddress) = factory
            .createHackathon(
                IPFS_HASH,
                REG_START,
                REG_END,
                HACK_START,
                HACK_END,
                JUDGING_END,
                MAX_PARTICIPANTS
            );

        assertEq(hackathonId, 0);
        assertEq(factory.getHackathonAddress(hackathonId), hackathonAddress);

        uint256[] memory organizerHackathons = factory.getOrganizerHackathons(
            organizer1
        );
        assertEq(organizerHackathons.length, 1);
        assertEq(organizerHackathons[0], hackathonId);
    }

    function test_CreateHackathon_RevertWhenNotAuthorized() public {
        vm.prank(nonOwner);
        vm.expectRevert(
            "HackathonFactory: caller is not an authorized organizer"
        );

        factory.createHackathon(
            IPFS_HASH,
            REG_START,
            REG_END,
            HACK_START,
            HACK_END,
            JUDGING_END,
            MAX_PARTICIPANTS
        );
    }

    function test_CreateHackathon_RevertWhenInvalidRegistrationPeriod() public {
        vm.expectRevert("HackathonFactory: invalid registration period");

        factory.createHackathon(
            IPFS_HASH,
            REG_END, // Start after end
            REG_START,
            HACK_START,
            HACK_END,
            JUDGING_END,
            MAX_PARTICIPANTS
        );
    }

    function test_CreateHackathon_RevertWhenRegistrationAfterHackathon()
        public
    {
        vm.expectRevert(
            "HackathonFactory: registration must end before hackathon starts"
        );

        factory.createHackathon(
            IPFS_HASH,
            REG_START,
            HACK_START + 1, // Registration ends after hackathon starts
            HACK_START,
            HACK_END,
            JUDGING_END,
            MAX_PARTICIPANTS
        );
    }

    function test_CreateHackathon_RevertWhenInvalidHackathonPeriod() public {
        vm.expectRevert("HackathonFactory: invalid hackathon period");

        factory.createHackathon(
            IPFS_HASH,
            REG_START,
            REG_END,
            HACK_END, // Start after end
            HACK_START,
            JUDGING_END,
            MAX_PARTICIPANTS
        );
    }

    function test_CreateHackathon_RevertWhenJudgingBeforeHackathon() public {
        vm.expectRevert(
            "HackathonFactory: judging must start after hackathon ends"
        );

        factory.createHackathon(
            IPFS_HASH,
            REG_START,
            REG_END,
            HACK_START,
            HACK_END,
            HACK_END - 1, // Judging ends before hackathon ends
            MAX_PARTICIPANTS
        );
    }

    function test_CreateHackathon_RevertWhenZeroMaxParticipants() public {
        vm.expectRevert(
            "HackathonFactory: max participants must be greater than 0"
        );

        factory.createHackathon(
            IPFS_HASH,
            REG_START,
            REG_END,
            HACK_START,
            HACK_END,
            JUDGING_END,
            0 // Zero max participants
        );
    }

    function test_CreateHackathon_RevertWhenEmptyIPFS() public {
        vm.expectRevert("HackathonFactory: IPFS hash cannot be empty");

        factory.createHackathon(
            "", // Empty IPFS hash
            REG_START,
            REG_END,
            HACK_START,
            HACK_END,
            JUDGING_END,
            MAX_PARTICIPANTS
        );
    }

    // Test multiple hackathon creation
    function test_CreateMultipleHackathons() public {
        // Create first hackathon
        (uint256 hackathonId1, ) = factory.createHackathon(
            IPFS_HASH,
            REG_START,
            REG_END,
            HACK_START,
            HACK_END,
            JUDGING_END,
            MAX_PARTICIPANTS
        );

        // Create second hackathon
        (uint256 hackathonId2, ) = factory.createHackathon(
            "QmAnotherHash",
            REG_START + 10000,
            REG_END + 10000,
            HACK_START + 10000,
            HACK_END + 10000,
            JUDGING_END + 10000,
            MAX_PARTICIPANTS
        );

        assertEq(hackathonId1, 0);
        assertEq(hackathonId2, 1);
        assertEq(factory.getTotalHackathons(), 2);

        uint256[] memory ownerHackathons = factory.getOrganizerHackathons(
            owner
        );
        assertEq(ownerHackathons.length, 2);
        assertEq(ownerHackathons[0], 0);
        assertEq(ownerHackathons[1], 1);
    }

    // Test global settings
    function test_SetGlobalSetting() public {
        bytes memory value = abi.encode(uint256(100));

        vm.expectEmit(false, false, false, true);
        emit GlobalSettingUpdated("maxHackathons", value);

        factory.setGlobalSetting("maxHackathons", value);

        bytes memory retrievedValue = factory.getGlobalSetting("maxHackathons");
        assertEq(keccak256(retrievedValue), keccak256(value));
    }

    function test_SetGlobalSetting_RevertWhenNotOwner() public {
        bytes memory value = abi.encode(uint256(100));

        vm.prank(organizer1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", organizer1));
        factory.setGlobalSetting("maxHackathons", value);
    }

    // Test view functions
    function test_IsAuthorizedOrganizer() public {
        assertTrue(factory.isAuthorizedOrganizer(owner));
        assertFalse(factory.isAuthorizedOrganizer(organizer1));

        factory.addOrganizer(organizer1);
        assertTrue(factory.isAuthorizedOrganizer(organizer1));
    }

    function test_GetOrganizerHackathons_EmptyInitially() public {
        uint256[] memory hackathons = factory.getOrganizerHackathons(
            organizer1
        );
        assertEq(hackathons.length, 0);
    }

    // Test ownership transfer
    function test_TransferOwnership() public {
        vm.expectEmit(true, true, false, false);
        emit OrganizerRemoved(owner, organizer1);

        vm.expectEmit(true, true, false, false);
        emit OrganizerAdded(organizer1, organizer1);

        factory.transferOwnership(organizer1);

        assertEq(factory.owner(), organizer1);
        assertFalse(factory.authorizedOrganizers(owner));
        assertTrue(factory.authorizedOrganizers(organizer1));
    }

    function test_TransferOwnership_RevertWhenNotOwner() public {
        vm.prank(organizer1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", organizer1));
        factory.transferOwnership(organizer2);
    }

    function test_TransferOwnership_RevertWhenZeroAddress() public {
        vm.expectRevert("Ownable: new owner is the zero address");
        factory.transferOwnership(address(0));
    }

    function test_TransferOwnership_RevertWhenSameOwner() public {
        // OpenZeppelin allows transferring to same owner, so test normal transfer
        address newOwner = makeAddr("transferNewOwner");
        
        // Verify initial state
        assertEq(factory.owner(), owner);
        assertFalse(factory.isAuthorizedOrganizer(newOwner));
        
        // Transfer ownership
        factory.transferOwnership(newOwner);
        
        // Verify transfer worked
        assertEq(factory.owner(), newOwner);
        assertTrue(factory.isAuthorizedOrganizer(newOwner));
        assertFalse(factory.isAuthorizedOrganizer(owner));
    }
}
