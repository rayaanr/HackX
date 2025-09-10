// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/PrizePool.sol";
import "../contracts/JudgeRegistry.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

/**
 * @title PrizePoolTest
 * @dev Comprehensive tests for the PrizePool contract
 */
contract PrizePoolTest is Test {
    PrizePool public prizePool;
    JudgeRegistry public judgeRegistry;
    HackathonFactory public factory;
    Hackathon public hackathon;

    address public owner;
    address public organizer;
    address public judge1;
    address public judge2;
    address public participant1;
    address public participant2;
    address public winner1;
    address public winner2;

    uint256 public hackathonId;
    address public hackathonAddress;
    uint256[] public projectIds;

    function setUp() public {
        owner = address(this);
        organizer = address(0x1);
        judge1 = address(0x11);
        judge2 = address(0x12);
        participant1 = address(0x21);
        participant2 = address(0x22);
        winner1 = address(0x31);
        winner2 = address(0x32);

        // Deploy JudgeRegistry
        judgeRegistry = new JudgeRegistry();

        // Deploy PrizePool with JudgeRegistry
        prizePool = new PrizePool(address(judgeRegistry));

        // Deploy HackathonFactory
        factory = new HackathonFactory(address(judgeRegistry));

        // Add organizer
        factory.addOrganizer(organizer);

        // Create hackathon as organizer
        vm.prank(organizer);
        (hackathonId, hackathonAddress) = factory.createHackathon(
            "QmTestHackathonHash",
            block.timestamp,
            block.timestamp + 1 days,
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            block.timestamp + 3 days,
            100
        );

        hackathon = Hackathon(hackathonAddress);

        // Register hackathon with both registries
        judgeRegistry.registerHackathon(hackathonId, hackathonAddress);
        prizePool.registerHackathon(hackathonId, hackathonAddress);

        // Setup test projects
        projectIds = [1, 2];

        // Fund test addresses
        vm.deal(organizer, 10 ether);
        vm.deal(participant1, 1 ether);
        vm.deal(participant2, 1 ether);
    }

    // ============ CONSTRUCTOR TESTS ============

    function test_Constructor() public view {
        assertEq(prizePool.owner(), owner);
        assertEq(address(prizePool.judgeRegistry()), address(judgeRegistry));
        assertFalse(prizePool.paused());
        assertEq(prizePool.emergencyWithdrawDelay(), 30 days);
    }

    function test_Constructor_RevertIfInvalidJudgeRegistry() public {
        vm.expectRevert("PrizePool: invalid judge registry");
        new PrizePool(address(0));
    }

    // ============ HACKATHON REGISTRATION TESTS ============

    function test_RegisterHackathon() public {
        uint256 newHackathonId = 999;

        // Create a new hackathon contract
        Hackathon newHackathon = new Hackathon(
            newHackathonId,
            organizer,
            "QmNewHackathonHash",
            block.timestamp,
            block.timestamp + 1 days,
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            block.timestamp + 3 days,
            100,
            address(judgeRegistry)
        );

        prizePool.registerHackathon(newHackathonId, address(newHackathon));
        
        assertTrue(prizePool.hackathonRegistered(newHackathonId));
        
        (
            uint256 totalPrizeFunds,
            uint256 distributedAmount,
            uint256 remainingFunds,
            bool finalized,
            bool emergencyWithdrawEnabled,
            uint256 finalizedAt
        ) = prizePool.getHackathonPrizeInfo(newHackathonId);
        
        assertEq(totalPrizeFunds, 0);
        assertEq(distributedAmount, 0);
        assertEq(remainingFunds, 0);
        assertFalse(finalized);
        assertFalse(emergencyWithdrawEnabled);
        assertEq(finalizedAt, 0);
    }

    function test_RegisterHackathon_RevertIfNotOwner() public {
        vm.prank(organizer);
        vm.expectRevert();
        prizePool.registerHackathon(999, address(0x999));
    }

    function test_RegisterHackathon_RevertIfZeroAddress() public {
        vm.expectRevert("PrizePool: invalid hackathon contract");
        prizePool.registerHackathon(999, address(0));
    }

    function test_RegisterHackathon_RevertIfAlreadyRegistered() public {
        vm.expectRevert("PrizePool: hackathon already registered");
        prizePool.registerHackathon(hackathonId, hackathonAddress);
    }

    // ============ PRIZE FUND MANAGEMENT TESTS ============

    function test_DepositPrizeFunds() public {
        uint256 depositAmount = 5 ether;
        
        vm.prank(organizer);
        prizePool.depositPrizeFunds{value: depositAmount}(hackathonId);

        (
            uint256 totalPrizeFunds,
            ,
            uint256 remainingFunds,
            ,
            ,
        ) = prizePool.getHackathonPrizeInfo(hackathonId);

        assertEq(totalPrizeFunds, depositAmount);
        assertEq(remainingFunds, depositAmount);
        assertEq(address(prizePool).balance, depositAmount);
    }

    function test_DepositPrizeFunds_RevertIfZeroValue() public {
        vm.prank(organizer);
        vm.expectRevert("PrizePool: must deposit funds");
        prizePool.depositPrizeFunds{value: 0}(hackathonId);
    }

    function test_DepositPrizeFunds_RevertIfUnregisteredHackathon() public {
        vm.prank(organizer);
        vm.expectRevert("PrizePool: hackathon not registered");
        prizePool.depositPrizeFunds{value: 1 ether}(999);
    }

    function test_SetCategoryPrize() public {
        // Add prize categories to hackathon
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 1 ether);

        vm.prank(organizer);
        hackathon.addPrizeCategory("Most Innovative", 0.5 ether);

        // Set prize amounts
        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 0, 2 ether);

        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 1, 1 ether);

        // Verify category prizes
        assertEq(prizePool.getCategoryPrizeAmount(hackathonId, 0), 2 ether);
        assertEq(prizePool.getCategoryPrizeAmount(hackathonId, 1), 1 ether);

        // Check categories are registered
        uint256[] memory categories = prizePool.getHackathonCategories(hackathonId);
        assertEq(categories.length, 2);
        assertEq(categories[0], 0);
        assertEq(categories[1], 1);

        // Check total allocated
        assertEq(prizePool.getTotalAllocatedPrizes(hackathonId), 3 ether);
    }

    function test_SetCategoryPrize_RevertIfNotOrganizer() public {
        vm.prank(judge1);
        vm.expectRevert("PrizePool: caller is not the hackathon organizer");
        prizePool.setCategoryPrize(hackathonId, 0, 1 ether);
    }

    function test_SetCategoryPrize_RevertIfZeroAmount() public {
        vm.prank(organizer);
        vm.expectRevert("PrizePool: prize amount must be positive");
        prizePool.setCategoryPrize(hackathonId, 0, 0);
    }

    // ============ WINNER CALCULATION & DISTRIBUTION TESTS ============

    function test_CalculateAndDistributePrizes() public {
        // Setup complete judging environment
        _setupCompleteJudgingEnvironment();

        // Deposit prize funds
        vm.prank(organizer);
        prizePool.depositPrizeFunds{value: 5 ether}(hackathonId);

        // Set category prizes
        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 0, 2 ether); // Best Overall

        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 1, 1 ether); // Most Innovative

        // Move to judging phase and submit evaluations
        _moveToJudgingAndEvaluate();

        // Move to completed phase
        vm.warp(block.timestamp + 3 days + 1);
        hackathon.updatePhase();

        // Calculate and distribute prizes
        vm.prank(organizer);
        prizePool.calculateAndDistributePrizes(hackathonId, projectIds);

        // Verify hackathon is finalized
        (
            uint256 totalPrizeFunds,
            uint256 distributedAmount,
            uint256 remainingFunds,
            bool finalized,
            ,
        ) = prizePool.getHackathonPrizeInfo(hackathonId);

        assertEq(totalPrizeFunds, 5 ether);
        assertEq(distributedAmount, 3 ether); // 2 + 1 ether distributed
        assertEq(remainingFunds, 2 ether); // 5 - 3 ether remaining
        assertTrue(finalized);

        // Check distributions
        (
            uint256 projectId1,
            ,
            uint256 amount1,
            bool distributed1,
            ,
            uint256 score1
        ) = prizePool.getDistribution(hackathonId, 0);

        assertEq(projectId1, 1); // Project 1 should win category 0
        assertEq(amount1, 2 ether);
        assertTrue(distributed1);
        assertGt(score1, 0);

        // Verify category distribution status
        assertTrue(prizePool.isCategoryDistributed(hackathonId, 0));
        assertTrue(prizePool.isCategoryDistributed(hackathonId, 1));
    }

    function test_CalculateAndDistributePrizes_RevertIfNotOrganizer() public {
        vm.prank(judge1);
        vm.expectRevert("PrizePool: caller is not the hackathon organizer");
        prizePool.calculateAndDistributePrizes(hackathonId, projectIds);
    }

    function test_CalculateAndDistributePrizes_RevertIfJudgingNotComplete() public {
        vm.prank(organizer);
        vm.expectRevert("PrizePool: judging not complete");
        prizePool.calculateAndDistributePrizes(hackathonId, projectIds);
    }

    function test_CalculateAndDistributePrizes_RevertIfAlreadyFinalized() public {
        _setupCompleteJudgingEnvironment();
        
        vm.prank(organizer);
        prizePool.depositPrizeFunds{value: 5 ether}(hackathonId);

        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 0, 2 ether);

        _moveToJudgingAndEvaluate();

        vm.warp(block.timestamp + 3 days + 1);
        hackathon.updatePhase();

        // First distribution
        vm.prank(organizer);
        prizePool.calculateAndDistributePrizes(hackathonId, projectIds);

        // Try to distribute again
        vm.prank(organizer);
        vm.expectRevert("PrizePool: already finalized");
        prizePool.calculateAndDistributePrizes(hackathonId, projectIds);
    }

    // ============ EMERGENCY & REFUND TESTS ============

    function test_EnableEmergencyWithdraw() public {
        vm.prank(organizer);
        prizePool.enableEmergencyWithdraw(hackathonId);

        (
            ,
            ,
            ,
            ,
            bool emergencyWithdrawEnabled,
        ) = prizePool.getHackathonPrizeInfo(hackathonId);

        assertTrue(emergencyWithdrawEnabled);
    }

    function test_EnableEmergencyWithdraw_RevertIfNotOrganizer() public {
        vm.prank(judge1);
        vm.expectRevert("PrizePool: caller is not the hackathon organizer");
        prizePool.enableEmergencyWithdraw(hackathonId);
    }

    function test_IssueRefund() public {
        // Deposit funds
        vm.prank(organizer);
        prizePool.depositPrizeFunds{value: 3 ether}(hackathonId);

        uint256 organizerBalanceBefore = organizer.balance;

        // Issue refund
        vm.prank(organizer);
        prizePool.issueRefund(hackathonId, "Hackathon cancelled");

        // Verify refund
        uint256 organizerBalanceAfter = organizer.balance;
        assertEq(organizerBalanceAfter - organizerBalanceBefore, 3 ether);

        // Verify hackathon state
        (
            uint256 totalPrizeFunds,
            ,
            uint256 remainingFunds,
            bool finalized,
            ,
        ) = prizePool.getHackathonPrizeInfo(hackathonId);

        assertEq(totalPrizeFunds, 0);
        assertEq(remainingFunds, 0);
        assertTrue(finalized);
    }

    function test_IssueRefund_RevertIfNotOrganizer() public {
        vm.prank(judge1);
        vm.expectRevert("PrizePool: caller is not the hackathon organizer");
        prizePool.issueRefund(hackathonId, "Test");
    }

    function test_IssueRefund_RevertIfNoFunds() public {
        vm.prank(organizer);
        vm.expectRevert("PrizePool: no funds to refund");
        prizePool.issueRefund(hackathonId, "Test");
    }

    // ============ ADMIN FUNCTION TESTS ============

    function test_SetEmergencyWithdrawDelay() public {
        uint256 newDelay = 7 days;
        prizePool.setEmergencyWithdrawDelay(newDelay);
        assertEq(prizePool.emergencyWithdrawDelay(), newDelay);
    }

    function test_SetEmergencyWithdrawDelay_RevertIfNotOwner() public {
        vm.prank(organizer);
        vm.expectRevert();
        prizePool.setEmergencyWithdrawDelay(7 days);
    }

    function test_SetEmergencyWithdrawDelay_RevertIfTooShort() public {
        vm.expectRevert("PrizePool: delay too short");
        prizePool.setEmergencyWithdrawDelay(12 hours);
    }

    function test_PauseUnpause() public {
        prizePool.pause();
        assertTrue(prizePool.paused());

        prizePool.unpause();
        assertFalse(prizePool.paused());
    }

    function test_ReceiveEther() public {
        // Test that contract can receive ETH
        (bool success, ) = address(prizePool).call{value: 1 ether}("");
        assertTrue(success);
        assertEq(address(prizePool).balance, 1 ether);
    }

    // ============ INTEGRATION TESTS ============

    function test_CompleteWorkflow() public {
        // 1. Setup judging environment
        _setupCompleteJudgingEnvironment();

        // 2. Deposit prize funds
        vm.prank(organizer);
        prizePool.depositPrizeFunds{value: 10 ether}(hackathonId);

        // 3. Set category prizes
        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 0, 5 ether);

        vm.prank(organizer);
        prizePool.setCategoryPrize(hackathonId, 1, 3 ether);

        // 4. Complete judging
        _moveToJudgingAndEvaluate();

        // 5. Move to completed phase
        vm.warp(block.timestamp + 3 days + 1);
        hackathon.updatePhase();

        // 6. Calculate and distribute prizes
        vm.prank(organizer);
        prizePool.calculateAndDistributePrizes(hackathonId, projectIds);

        // 7. Verify final state
        (
            uint256 totalPrizeFunds,
            uint256 distributedAmount,
            uint256 remainingFunds,
            bool finalized,
            ,
        ) = prizePool.getHackathonPrizeInfo(hackathonId);

        assertEq(totalPrizeFunds, 10 ether);
        assertEq(distributedAmount, 8 ether); // 5 + 3 ether
        assertEq(remainingFunds, 2 ether); // 10 - 8 ether
        assertTrue(finalized);
    }

    // ============ HELPER FUNCTIONS ============

    function _setupCompleteJudgingEnvironment() internal {
        // Invite and accept judges
        vm.prank(organizer);
        judgeRegistry.inviteJudge(judge1, hackathonId, "QmJudge1Profile");

        vm.prank(organizer);
        judgeRegistry.inviteJudge(judge2, hackathonId, "QmJudge2Profile");

        vm.prank(judge1);
        judgeRegistry.acceptJudgeInvitation(hackathonId);

        vm.prank(judge2);
        judgeRegistry.acceptJudgeInvitation(hackathonId);

        // Add prize categories
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 2 ether);

        vm.prank(organizer);
        hackathon.addPrizeCategory("Most Innovative", 1 ether);

        // Set scoring criteria
        vm.prank(organizer);
        judgeRegistry.setScoringCriteria(hackathonId, "QmScoringCriteria", 1000);

        vm.prank(organizer);
        judgeRegistry.finalizeScoringCriteria(hackathonId);

        // Assign judges to categories
        uint256[] memory categoryIds = new uint256[](2);
        categoryIds[0] = 0;
        categoryIds[1] = 1;

        vm.prank(organizer);
        judgeRegistry.assignJudgeToCategories(hackathonId, judge1, categoryIds);

        vm.prank(organizer);
        judgeRegistry.assignJudgeToCategories(hackathonId, judge2, categoryIds);

        // Lock assignments
        vm.prank(organizer);
        judgeRegistry.lockJudgeAssignments(hackathonId);
    }

    function _moveToJudgingAndEvaluate() internal {
        // Move to judging phase
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        // Submit evaluations
        // Project 1: Higher scores in category 0, lower in category 1
        vm.prank(judge1);
        judgeRegistry.submitEvaluation(hackathonId, 1, 0, 900, "QmEval1");

        vm.prank(judge2);
        judgeRegistry.submitEvaluation(hackathonId, 1, 0, 850, "QmEval2");

        vm.prank(judge1);
        judgeRegistry.submitEvaluation(hackathonId, 1, 1, 600, "QmEval3");

        vm.prank(judge2);
        judgeRegistry.submitEvaluation(hackathonId, 1, 1, 650, "QmEval4");

        // Project 2: Lower scores in category 0, higher in category 1
        vm.prank(judge1);
        judgeRegistry.submitEvaluation(hackathonId, 2, 0, 700, "QmEval5");

        vm.prank(judge2);
        judgeRegistry.submitEvaluation(hackathonId, 2, 0, 750, "QmEval6");

        vm.prank(judge1);
        judgeRegistry.submitEvaluation(hackathonId, 2, 1, 800, "QmEval7");

        vm.prank(judge2);
        judgeRegistry.submitEvaluation(hackathonId, 2, 1, 750, "QmEval8");
    }
}
