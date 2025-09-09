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

    // Allow test contract to receive ETH for emergency withdrawal testing
    receive() external payable {}

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
        vm.expectRevert("Hackathon: function called in wrong phase");
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

    // ============ PRIZE POOL TESTS ============

    function test_AddPrizeCategory() public {
        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        (
            string memory name,
            uint256 amount,
            address winner,
            bool distributed
        ) = hackathon.getPrizeCategory(0);
        assertEq(name, "First Place");
        assertEq(amount, 1 ether);
        assertEq(winner, address(0));
        assertFalse(distributed);
        assertEq(hackathon.prizeCategories(), 1);
    }

    function test_AddPrizeCategory_RevertWhenNotOrganizer() public {
        vm.prank(participant1);
        vm.expectRevert("Hackathon: caller is not the organizer");
        hackathon.addPrizeCategory("First Place", 1 ether);
    }

    function test_AddPrizeCategory_RevertWhenAfterJudging() public {
        // Move to judging phase
        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        vm.prank(organizer);
        vm.expectRevert("Hackathon: cannot add prizes after judging started");
        hackathon.addPrizeCategory("First Place", 1 ether);
    }

    function test_AddPrizeCategory_RevertWhenZeroAmount() public {
        vm.prank(organizer);
        vm.expectRevert("Hackathon: prize amount must be greater than 0");
        hackathon.addPrizeCategory("First Place", 0);
    }

    function test_AddPrizeCategory_RevertWhenEmptyName() public {
        vm.prank(organizer);
        vm.expectRevert("Hackathon: prize name cannot be empty");
        hackathon.addPrizeCategory("", 1 ether);
    }

    function test_DepositPrizeFunds() public {
        vm.deal(organizer, 5 ether);

        vm.prank(organizer);
        hackathon.depositPrizeFunds{value: 2 ether}();

        assertEq(hackathon.totalPrizeFunds(), 2 ether);
        assertEq(address(hackathon).balance, 2 ether);
    }

    function test_DepositPrizeFunds_RevertWhenZeroValue() public {
        vm.prank(organizer);
        vm.expectRevert("Hackathon: must deposit some funds");
        hackathon.depositPrizeFunds{value: 0}();
    }

    function test_DepositPrizeFunds_RevertWhenNotOrganizer() public {
        vm.deal(participant1, 1 ether);

        vm.prank(participant1);
        vm.expectRevert("Hackathon: caller is not the organizer");
        hackathon.depositPrizeFunds{value: 1 ether}();
    }

    function test_SetWinner() public {
        // Setup: Add participant and prize category
        vm.warp(REG_START + 100);
        vm.prank(participant1);
        hackathon.register();

        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        // Move to judging phase
        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        // Set winner
        vm.prank(organizer);
        hackathon.setWinner(0, participant1);

        (, , address winner, ) = hackathon.getPrizeCategory(0);
        assertEq(winner, participant1);
        assertEq(hackathon.participantWinnings(participant1), 1 ether);
    }

    function test_SetWinner_RevertWhenNotOrganizer() public {
        vm.warp(REG_START + 100);
        vm.prank(participant1);
        hackathon.register();

        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        vm.prank(participant1);
        vm.expectRevert("Hackathon: caller is not the organizer");
        hackathon.setWinner(0, participant1);
    }

    function test_SetWinner_RevertWhenNotJudgingPhase() public {
        vm.prank(organizer);
        vm.expectRevert("Hackathon: function called in wrong phase");
        hackathon.setWinner(0, participant1);
    }

    function test_SetWinner_RevertWhenNotParticipant() public {
        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        vm.prank(organizer);
        vm.expectRevert("Hackathon: winner must be a participant");
        hackathon.setWinner(0, participant1);
    }

    function test_DistributePrize() public {
        // Setup: participant, prize, and winner
        vm.warp(REG_START + 100);
        vm.prank(participant1);
        hackathon.register();

        vm.deal(organizer, 5 ether);
        vm.prank(organizer);
        hackathon.depositPrizeFunds{value: 2 ether}();

        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        vm.prank(organizer);
        hackathon.setWinner(0, participant1);

        // Move to completed phase
        vm.warp(JUDGING_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        uint256 balanceBefore = participant1.balance;

        // Distribute prize
        hackathon.distributePrize(0);

        assertEq(participant1.balance - balanceBefore, 1 ether);
        assertEq(hackathon.distributedFunds(), 1 ether);

        (, , , bool distributed) = hackathon.getPrizeCategory(0);
        assertTrue(distributed);
    }

    function test_DistributePrize_RevertWhenNoWinner() public {
        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        vm.warp(JUDGING_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        vm.expectRevert("Hackathon: no winner set");
        hackathon.distributePrize(0);
    }

    function test_DistributePrize_RevertWhenAlreadyDistributed() public {
        // Setup complete prize scenario
        vm.warp(REG_START + 100);
        vm.prank(participant1);
        hackathon.register();

        vm.deal(organizer, 5 ether);
        vm.prank(organizer);
        hackathon.depositPrizeFunds{value: 2 ether}();

        vm.prank(organizer);
        hackathon.addPrizeCategory("First Place", 1 ether);

        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        vm.prank(organizer);
        hackathon.setWinner(0, participant1);

        vm.warp(JUDGING_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        // Distribute once
        hackathon.distributePrize(0);

        // Try to distribute again
        vm.expectRevert("Hackathon: prize already distributed");
        hackathon.distributePrize(0);
    }

    function test_EmergencyWithdraw() public {
        vm.deal(organizer, 5 ether);
        vm.prank(organizer);
        hackathon.depositPrizeFunds{value: 2 ether}();

        // Move past hackathon phase
        vm.warp(HACK_END + 100);
        vm.prank(organizer);
        hackathon.updatePhase();

        uint256 balanceBefore = organizer.balance;
        uint256 contractBalance = address(hackathon).balance;

        vm.prank(organizer);
        hackathon.emergencyWithdraw();

        assertEq(organizer.balance - balanceBefore, contractBalance);
        assertEq(address(hackathon).balance, 0);
    }

    function test_EmergencyWithdraw_RevertWhenNotOrganizer() public {
        vm.prank(participant1);
        vm.expectRevert("Hackathon: caller is not the organizer");
        hackathon.emergencyWithdraw();
    }

    function test_EmergencyWithdraw_RevertWhenTooEarly() public {
        vm.prank(organizer);
        vm.expectRevert("Hackathon: function called too early");
        hackathon.emergencyWithdraw();
    }

    function test_GetPrizeFundsInfo() public {
        vm.deal(organizer, 5 ether);
        vm.prank(organizer);
        hackathon.depositPrizeFunds{value: 3 ether}();

        (
            uint256 total,
            uint256 distributed,
            uint256 remaining,
            uint256 balance
        ) = hackathon.getPrizeFundsInfo();

        assertEq(total, 3 ether);
        assertEq(distributed, 0);
        assertEq(remaining, 3 ether);
        assertEq(balance, 3 ether);
    }
}
