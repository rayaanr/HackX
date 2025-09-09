// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/Hackathon.sol";

contract HackathonTest is Test {
    Hackathon public hackathon;
    address public organizer;
    address public participant1;
    address public participant2;

    // Test data
    uint256 constant HACKATHON_ID = 1;
    string constant IPFS_HASH = "QmTestHash123";
    uint256 constant REG_START = 1000;
    uint256 constant REG_END = 2000;
    uint256 constant HACK_START = 2000;
    uint256 constant HACK_END = 5000;
    uint256 constant JUDGING_END = 6000;
    uint256 constant MAX_PARTICIPANTS = 2;

    event PhaseChanged(
        Hackathon.Phase indexed oldPhase,
        Hackathon.Phase indexed newPhase
    );
    event ParticipantRegistered(address indexed participant, uint256 timestamp);

    function setUp() public {
        organizer = address(this);
        participant1 = address(0x1);
        participant2 = address(0x2);

        hackathon = new Hackathon(
            HACKATHON_ID,
            organizer,
            IPFS_HASH,
            REG_START,
            REG_END,
            HACK_START,
            HACK_END,
            JUDGING_END,
            MAX_PARTICIPANTS
        );
    }

    // Test constructor
    function test_Constructor() public {
        assertEq(hackathon.hackathonId(), HACKATHON_ID);
        assertEq(hackathon.organizer(), organizer);
        assertEq(hackathon.ipfsHash(), IPFS_HASH);
        assertEq(hackathon.registrationStart(), REG_START);
        assertEq(hackathon.registrationEnd(), REG_END);
        assertEq(hackathon.hackathonStart(), HACK_START);
        assertEq(hackathon.hackathonEnd(), HACK_END);
        assertEq(hackathon.judgingEnd(), JUDGING_END);
        assertEq(hackathon.maxParticipants(), MAX_PARTICIPANTS);
        assertEq(hackathon.participantCount(), 0);
    }

    // Test phase management
    function test_PhaseUpdate_Registration() public {
        // Before registration starts
        vm.warp(REG_START - 100);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Registration)
        );

        // During registration
        vm.warp(REG_START + 100);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Registration)
        );

        // At registration end
        vm.warp(REG_END);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Registration)
        );
    }

    function test_PhaseUpdate_Hackathon() public {
        // During hackathon
        vm.warp(HACK_START + 100);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Hackathon)
        );

        // At hackathon end
        vm.warp(HACK_END);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Hackathon)
        );
    }

    function test_PhaseUpdate_Judging() public {
        // During judging
        vm.warp(HACK_END + 100);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Judging)
        );

        // At judging end
        vm.warp(JUDGING_END);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Judging)
        );
    }

    function test_PhaseUpdate_Completed() public {
        // After judging ends
        vm.warp(JUDGING_END + 100);
        hackathon.updatePhase();
        assertEq(
            uint8(hackathon.currentPhase()),
            uint8(Hackathon.Phase.Completed)
        );
    }

    function test_PhaseChange_Event() public {
        vm.warp(REG_START - 100);
        hackathon.updatePhase();

        vm.expectEmit(true, true, false, false);
        emit PhaseChanged(
            Hackathon.Phase.Registration,
            Hackathon.Phase.Hackathon
        );

        vm.warp(HACK_START + 100);
        hackathon.updatePhase();
    }

    // Test participant registration
    function test_Register_Success() public {
        vm.warp(REG_START + 100); // During registration

        vm.expectEmit(true, false, false, true);
        emit ParticipantRegistered(participant1, REG_START + 100);

        vm.prank(participant1);
        hackathon.register();

        assertTrue(hackathon.participants(participant1));
        assertEq(hackathon.participantCount(), 1);
        assertTrue(hackathon.isParticipant(participant1));
    }

    function test_Register_MultipleParticipants() public {
        vm.warp(REG_START + 100);

        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant2);
        hackathon.register();

        assertTrue(hackathon.participants(participant1));
        assertTrue(hackathon.participants(participant2));
        assertEq(hackathon.participantCount(), 2);
    }

    function test_Register_RevertWhenNotRegistrationPhase() public {
        vm.warp(HACK_START + 100); // During hackathon phase
        hackathon.updatePhase();

        vm.prank(participant1);
        vm.expectRevert("Hackathon: not in correct phase");
        hackathon.register();
    }

    function test_Register_RevertWhenBeforeRegistrationStart() public {
        vm.warp(REG_START - 100); // Before registration starts

        vm.prank(participant1);
        vm.expectRevert("Hackathon: registration not started");
        hackathon.register();
    }

    function test_Register_RevertWhenAfterRegistrationEnd() public {
        vm.warp(REG_END + 100); // After registration ends

        vm.prank(participant1);
        vm.expectRevert("Hackathon: registration ended");
        hackathon.register();
    }

    function test_Register_RevertWhenAlreadyRegistered() public {
        vm.warp(REG_START + 100);

        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant1);
        vm.expectRevert("Hackathon: already registered");
        hackathon.register();
    }

    function test_Register_RevertWhenMaxParticipantsReached() public {
        vm.warp(REG_START + 100);

        // Register maximum participants
        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant2);
        hackathon.register();

        // Try to register one more
        address participant3 = address(0x3);
        vm.prank(participant3);
        vm.expectRevert("Hackathon: max participants reached");
        hackathon.register();
    }

    // Test view functions
    function test_GetHackathonDetails() public {
        vm.warp(REG_START + 100);
        hackathon.updatePhase();

        (
            uint256 id,
            address org,
            string memory metadata,
            Hackathon.Phase phase,
            uint256 regStart,
            uint256 regEnd,
            uint256 hackStart,
            uint256 hackEnd,
            uint256 judgeEnd,
            uint256 maxPart,
            uint256 partCount
        ) = hackathon.getHackathonDetails();

        assertEq(id, HACKATHON_ID);
        assertEq(org, organizer);
        assertEq(metadata, IPFS_HASH);
        assertEq(uint8(phase), uint8(Hackathon.Phase.Registration));
        assertEq(regStart, REG_START);
        assertEq(regEnd, REG_END);
        assertEq(hackStart, HACK_START);
        assertEq(hackEnd, HACK_END);
        assertEq(judgeEnd, JUDGING_END);
        assertEq(maxPart, MAX_PARTICIPANTS);
        assertEq(partCount, 0);
    }

    function test_IsParticipant() public {
        assertFalse(hackathon.isParticipant(participant1));

        vm.warp(REG_START + 100);
        vm.prank(participant1);
        hackathon.register();

        assertTrue(hackathon.isParticipant(participant1));
        assertFalse(hackathon.isParticipant(participant2));
    }
}
