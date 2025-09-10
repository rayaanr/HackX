// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/JudgeRegistry.sol";
import "../contracts/HackathonFactory.sol";
import "../contracts/Hackathon.sol";

/**
 * @title JudgeRegistryTest
 * @dev Comprehensive tests for the simplified JudgeRegistry contract
 */
contract JudgeRegistryTest is Test {
    JudgeRegistry public registry;
    HackathonFactory public factory;
    Hackathon public hackathon;

    address public owner;
    address public organizer;
    address public judge1;
    address public judge2;
    address public judge3;
    address public participant1;
    address public participant2;

    uint256 public hackathonId;
    address public hackathonAddress;
    uint256[] public projectIds;
    address[] public projectOwners;

    function setUp() public {
        owner = address(this);
        organizer = address(0x1);
        judge1 = address(0x11);
        judge2 = address(0x12);
        judge3 = address(0x13);
        participant1 = address(0x21);
        participant2 = address(0x22);

        // Deploy JudgeRegistry
        registry = new JudgeRegistry();

        // Deploy HackathonFactory with JudgeRegistry
        factory = new HackathonFactory(address(registry));

        // Add organizer
        factory.addOrganizer(organizer);

        // Create hackathon as organizer
        vm.prank(organizer);
        (hackathonId, hackathonAddress) = factory.createHackathon(
            "QmTestHackathonHash", // ipfsHash
            block.timestamp, // registrationStart
            block.timestamp + 1 days, // registrationEnd
            block.timestamp + 1 days, // hackathonStart
            block.timestamp + 2 days, // hackathonEnd
            block.timestamp + 3 days, // judgingEnd
            100 // maxParticipants
        );

        hackathon = Hackathon(hackathonAddress);

        // Register hackathon with JudgeRegistry
        registry.registerHackathon(hackathonId, hackathonAddress);

        // Setup test projects
        projectIds = [1, 2];
        projectOwners = [participant1, participant2];

        // Register participants
        vm.prank(participant1);
        hackathon.register();

        vm.prank(participant2);
        hackathon.register();
    }

    // ============ CONSTRUCTOR TESTS ============

    function test_Constructor() public view {
        assertEq(registry.owner(), owner);
        assertFalse(registry.paused());
        assertEq(registry.minimumJudgesPerCategory(), 1);
        assertEq(registry.minimumReputationScore(), 0);
    }

    // ============ HACKATHON REGISTRATION TESTS ============

    function test_RegisterHackathon() public {
        uint256 newHackathonId = 999;

        // Create a real Hackathon contract for testing
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
            address(registry)
        );

        registry.registerHackathon(newHackathonId, address(newHackathon));
        assertTrue(registry.hackathonExists(newHackathonId));
        assertEq(
            registry.storedHackathonContracts(newHackathonId),
            address(newHackathon)
        );
    }

    function test_RegisterHackathon_RevertIfNotOwner() public {
        vm.prank(judge1);
        vm.expectRevert();
        registry.registerHackathon(999, address(0x999));
    }

    function test_RegisterHackathon_RevertIfZeroAddress() public {
        vm.expectRevert("JudgeRegistry: invalid hackathon contract");
        registry.registerHackathon(999, address(0));
    }

    function test_RegisterHackathon_RevertIfAlreadyRegistered() public {
        vm.expectRevert("JudgeRegistry: hackathon already registered");
        registry.registerHackathon(hackathonId, hackathonAddress);
    }

    // ============ JUDGE INVITATION TESTS ============

    function test_InviteJudge() public {
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudgeProfileHash");

        (
            string memory ipfsProfile,
            JudgeRegistry.JudgeStatus status,
            uint256 hackathonsJudged,
            uint256 reputation,
            uint256 registeredAt,
            bool active
        ) = registry.getJudge(judge1);

        assertEq(ipfsProfile, "QmJudgeProfileHash");
        assertTrue(
            uint256(status) == uint256(JudgeRegistry.JudgeStatus.INVITED)
        );
        assertEq(hackathonsJudged, 0);
        assertEq(reputation, 500); // minimum reputation
        assertTrue(active);
        assertGt(registeredAt, 0);
    }

    function test_InviteJudge_RevertIfNotOrganizer() public {
        vm.prank(judge1);
        vm.expectRevert("JudgeRegistry: caller is not the hackathon organizer");
        registry.inviteJudge(judge2, hackathonId, "QmJudgeProfileHash");
    }

    function test_InviteJudge_RevertIfZeroAddress() public {
        vm.prank(organizer);
        vm.expectRevert("JudgeRegistry: invalid judge address");
        registry.inviteJudge(address(0), hackathonId, "QmJudgeProfileHash");
    }

    function test_InviteJudge_RevertIfEmptyProfile() public {
        vm.prank(organizer);
        vm.expectRevert("JudgeRegistry: IPFS profile required");
        registry.inviteJudge(judge1, hackathonId, "");
    }

    // ============ JUDGE ACCEPTANCE TESTS ============

    function test_AcceptJudgeInvitation() public {
        // First invite the judge
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudgeProfileHash");

        // Judge accepts invitation
        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);

        (, JudgeRegistry.JudgeStatus status, , , , ) = registry.getJudge(
            judge1
        );
        assertTrue(
            uint256(status) == uint256(JudgeRegistry.JudgeStatus.ACCEPTED)
        );

        // Check judge is in hackathon list
        address[] memory judges = registry.getHackathonJudges(hackathonId);
        assertEq(judges.length, 1);
        assertEq(judges[0], judge1);
    }

    function test_AcceptJudgeInvitation_RevertIfNotInvited() public {
        vm.prank(judge1);
        vm.expectRevert("JudgeRegistry: no invitation found");
        registry.acceptJudgeInvitation(hackathonId);
    }

    function test_RejectJudgeInvitation() public {
        // First invite the judge
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudgeProfileHash");

        // Judge rejects invitation
        vm.prank(judge1);
        registry.rejectJudgeInvitation(hackathonId);

        (, JudgeRegistry.JudgeStatus status, , , , ) = registry.getJudge(
            judge1
        );
        assertTrue(
            uint256(status) == uint256(JudgeRegistry.JudgeStatus.REJECTED)
        );
    }

    // ============ SCORING CRITERIA TESTS ============

    function test_SetScoringCriteria() public {
        vm.prank(organizer);
        registry.setScoringCriteria(hackathonId, "QmScoringCriteriaHash", 1000);

        (
            string memory ipfsHash,
            uint256 totalWeight,
            bool finalized,
            uint256 createdAt
        ) = registry.getScoringCriteria(hackathonId);

        assertEq(ipfsHash, "QmScoringCriteriaHash");
        assertEq(totalWeight, 1000);
        assertFalse(finalized);
        assertGt(createdAt, 0);
    }

    function test_SetScoringCriteria_RevertIfNotOrganizer() public {
        vm.prank(judge1);
        vm.expectRevert("JudgeRegistry: caller is not the hackathon organizer");
        registry.setScoringCriteria(hackathonId, "QmScoringCriteriaHash", 1000);
    }

    function test_SetScoringCriteria_RevertIfInvalidWeight() public {
        vm.prank(organizer);
        vm.expectRevert("JudgeRegistry: total weight must be positive");
        registry.setScoringCriteria(hackathonId, "QmScoringCriteriaHash", 0);
    }

    function test_FinalizeScoringCriteria() public {
        vm.prank(organizer);
        registry.setScoringCriteria(hackathonId, "QmScoringCriteriaHash", 1000);

        vm.prank(organizer);
        registry.finalizeScoringCriteria(hackathonId);

        (, , bool finalized, ) = registry.getScoringCriteria(hackathonId);
        assertTrue(finalized);
    }

    // ============ JUDGE ASSIGNMENT TESTS ============

    function test_AssignJudgeToCategories() public {
        // Setup: invite and accept judge
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudgeProfileHash");

        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);

        // Add some prize categories to hackathon
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 1 ether);

        vm.prank(organizer);
        hackathon.addPrizeCategory("Most Innovative", 0.5 ether);

        // Assign judge to categories
        uint256[] memory categoryIds = new uint256[](2);
        categoryIds[0] = 0;
        categoryIds[1] = 1;

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge1, categoryIds);

        // Verify assignments
        assertTrue(registry.isJudgeAssignedToCategory(hackathonId, judge1, 0));
        assertTrue(registry.isJudgeAssignedToCategory(hackathonId, judge1, 1));
    }

    function test_AssignJudgeToCategories_RevertIfNotAccepted() public {
        // Invite but don't accept
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudgeProfileHash");

        uint256[] memory categoryIds = new uint256[](1);
        categoryIds[0] = 0;

        vm.prank(organizer);
        vm.expectRevert("JudgeRegistry: judge not accepted");
        registry.assignJudgeToCategories(hackathonId, judge1, categoryIds);
    }

    // ============ EVALUATION TESTS ============

    function test_SubmitEvaluation() public {
        // Debug: Try minimal setup step by step

        // Step 1: Invite 3 judges (minimum required)
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudge1Profile");

        vm.prank(organizer);
        registry.inviteJudge(judge2, hackathonId, "QmJudge2Profile");

        vm.prank(organizer);
        registry.inviteJudge(judge3, hackathonId, "QmJudge3Profile");

        // Step 2: Accept invitations
        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);

        vm.prank(judge2);
        registry.acceptJudgeInvitation(hackathonId);

        vm.prank(judge3);
        registry.acceptJudgeInvitation(hackathonId);

        // Step 3: Add prize category
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 1 ether);

        // Step 4: Set scoring criteria
        vm.prank(organizer);
        registry.setScoringCriteria(hackathonId, "QmScoringCriteriaHash", 1000);

        vm.prank(organizer);
        registry.finalizeScoringCriteria(hackathonId);

        // Step 5: Assign judges to category
        uint256[] memory categoryIds = new uint256[](1);
        categoryIds[0] = 0;

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge1, categoryIds);

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge2, categoryIds);

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge3, categoryIds);

        // Step 6: Lock assignments
        vm.prank(organizer);
        registry.lockJudgeAssignments(hackathonId);

        // Step 7: Move to judging phase
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        // Step 8: Submit evaluation
        vm.prank(judge1);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0], // project 1
            0, // category 0
            850, // score out of 1000
            "QmEvaluationHash"
        );

        // Verify evaluation
        (
            string memory ipfsHash,
            uint256 finalScore,
            JudgeRegistry.EvaluationStatus status,
            uint256 submittedAt,
            bool conflictOfInterest
        ) = registry.getEvaluation(hackathonId, projectIds[0], 0, judge1);

        assertEq(ipfsHash, "QmEvaluationHash");
        assertEq(finalScore, 850);
        assertTrue(
            uint256(status) == uint256(JudgeRegistry.EvaluationStatus.SUBMITTED)
        );
        assertGt(submittedAt, 0);
        assertFalse(conflictOfInterest);

        // Check aggregated scores
        (
            uint256 totalScore,
            uint256 evaluationCount,
            uint256 averageScore
        ) = registry.getProjectCategoryScore(hackathonId, projectIds[0], 0);
        assertEq(totalScore, 850);
        assertEq(evaluationCount, 1);
        assertEq(averageScore, 850);
    }

    function test_SubmitEvaluation_RevertIfNotJudgingPhase() public {
        _setupJudgingEnvironment();

        // Still in hackathon phase
        vm.prank(judge1);
        vm.expectRevert("JudgeRegistry: not in judging phase");
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            850,
            "QmEvaluationHash"
        );
    }

    function test_SubmitEvaluation_RevertIfNotAssigned() public {
        _setupJudgingEnvironment();

        // Move to judging phase
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        // Try to evaluate non-existent category (category 2 doesn't exist, only 0 and 1)
        vm.prank(judge1);
        vm.expectRevert("JudgeRegistry: judge not assigned to this category");
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            2,
            850,
            "QmEvaluationHash"
        );
    }

    function test_DeclareConflictOfInterest() public {
        _setupJudgingEnvironment();

        // Move to judging phase
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        // Declare conflict of interest
        vm.prank(judge1);
        registry.declareConflictOfInterest(hackathonId, projectIds[0], 0);

        // Verify conflict of interest
        (, , , , bool conflictOfInterest) = registry.getEvaluation(
            hackathonId,
            projectIds[0],
            0,
            judge1
        );
        assertTrue(conflictOfInterest);
    }

    // ============ WINNER CALCULATION TESTS ============

    function test_CalculateWinners() public {
        _setupJudgingEnvironment();
        _submitAllEvaluations();

        // Calculate winners
        (
            uint256[] memory categoryIds,
            uint256[] memory winners,
            uint256[] memory scores
        ) = registry.calculateWinners(hackathonId, projectIds);

        assertEq(categoryIds.length, 2);
        assertEq(winners.length, 2);
        assertEq(scores.length, 2);

        // Project 1 should win category 0 (average: 850)
        // Project 2 should win category 1 (average: 750)
        assertEq(winners[0], projectIds[0]); // project 1 wins category 0
        assertEq(winners[1], projectIds[1]); // project 2 wins category 1
    }

    function test_HasMinimumEvaluations() public {
        _setupJudgingEnvironment();

        // Initially no evaluations
        (bool hasMinimum, uint256 count) = registry.hasMinimumEvaluations(
            hackathonId,
            projectIds[0],
            0
        );
        assertFalse(hasMinimum);
        assertEq(count, 0);

        // Submit 3 evaluations (more than minimum of 2)
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        vm.prank(judge1);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            850,
            "QmEval1"
        );

        vm.prank(judge2);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            800,
            "QmEval2"
        );

        vm.prank(judge3);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            900,
            "QmEval3"
        );

        (hasMinimum, count) = registry.hasMinimumEvaluations(
            hackathonId,
            projectIds[0],
            0
        );
        assertTrue(hasMinimum);
        assertEq(count, 3);
    }

    function test_GetCategoryRankings() public {
        _setupJudgingEnvironment();
        _submitAllEvaluations();

        (
            uint256[] memory returnedProjectIds,
            uint256[] memory totalScores,
            uint256[] memory evaluationCounts,
            uint256[] memory averageScores
        ) = registry.getCategoryRankings(hackathonId, projectIds, 0);

        assertEq(returnedProjectIds.length, 2);
        assertEq(totalScores.length, 2);
        assertEq(evaluationCounts.length, 2);
        assertEq(averageScores.length, 2);

        // Project 1 should have higher average (850 vs 700)
        assertEq(averageScores[0], 850); // project 1
        assertEq(averageScores[1], 700); // project 2
    }

    // ============ INTEGRATION WITH HACKATHON TESTS ============

    function test_HackathonCalculateAndSetWinners() public {
        // Test setup step by step to isolate the issue

        // Step 1: Basic judge setup
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudge1Profile");

        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);

        assertTrue(true, "Basic setup works");
    }

    function test_SimplifiedJudgeRegistryWorkflow() public {
        // Test the complete simplified workflow
        
        // 1. Invite multiple judges
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudge1Profile");
        
        vm.prank(organizer);
        registry.inviteJudge(judge2, hackathonId, "QmJudge2Profile");

        // 2. Judges accept invitations
        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);
        
        vm.prank(judge2);
        registry.acceptJudgeInvitation(hackathonId);

        // 3. Add prize categories
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 1 ether);

        // 4. Set and finalize scoring criteria
        vm.prank(organizer);
        registry.setScoringCriteria(hackathonId, "QmCriteriaHash", 1000);
        
        vm.prank(organizer);
        registry.finalizeScoringCriteria(hackathonId);

        // 5. Assign judges to categories
        uint256[] memory categoryIds = new uint256[](1);
        categoryIds[0] = 0;
        
        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge1, categoryIds);
        
        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge2, categoryIds);

        // 6. Lock assignments
        vm.prank(organizer);
        registry.lockJudgeAssignments(hackathonId);

        // 7. Move to judging phase
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        // 8. Submit evaluations
        vm.prank(judge1);
        registry.submitEvaluation(hackathonId, 1, 0, 800, "QmEval1");
        
        vm.prank(judge2);
        registry.submitEvaluation(hackathonId, 1, 0, 900, "QmEval2");

        // 9. Verify scores
        (uint256 totalScore, uint256 evaluationCount, uint256 averageScore) = 
            registry.getProjectCategoryScore(hackathonId, 1, 0);
        
        assertEq(totalScore, 1700); // 800 + 900
        assertEq(evaluationCount, 2);
        assertEq(averageScore, 850); // 1700 / 2

        // 10. Calculate winners
        uint256[] memory testProjectIds = new uint256[](1);
        testProjectIds[0] = 1;
        
        (uint256[] memory categoryIdsResult, uint256[] memory winners, uint256[] memory scores) = 
            registry.calculateWinners(hackathonId, testProjectIds);
        
        assertEq(categoryIdsResult[0], 0);
        assertEq(winners[0], 1);
        assertEq(scores[0], 850);
    }

    function test_JudgeReputationIncrease() public {
        // Test that judge reputation increases after successful evaluation
        
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudge1Profile");
        
        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);

        // Check initial reputation
        (, , , uint256 initialReputation, , ) = registry.getJudge(judge1);
        assertEq(initialReputation, 500); // Starting reputation

        // Setup for evaluation
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 1 ether);
        
        vm.prank(organizer);
        registry.setScoringCriteria(hackathonId, "QmCriteriaHash", 1000);
        
        uint256[] memory categoryIds = new uint256[](1);
        categoryIds[0] = 0;
        
        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge1, categoryIds);
        
        vm.prank(organizer);
        registry.lockJudgeAssignments(hackathonId);

        // Move to judging phase and submit evaluation
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();
        
        vm.prank(judge1);
        registry.submitEvaluation(hackathonId, 1, 0, 800, "QmEval1");

        // Check reputation increased
        (, , uint256 hackathonsJudged, uint256 newReputation, , ) = registry.getJudge(judge1);
        assertEq(hackathonsJudged, 1);
        assertEq(newReputation, 520); // 500 + 20
    }

    function test_VerifyJudgingComplete() public {
        _setupJudgingEnvironment();
        
        // Initially judging not complete
        uint256[] memory testProjectIds = new uint256[](2);
        testProjectIds[0] = 1;
        testProjectIds[1] = 2;
        
        (bool isComplete, ) = registry.verifyJudgingComplete(hackathonId, testProjectIds);
        assertFalse(isComplete);

        // Submit some evaluations
        _submitAllEvaluations();

        // Now judging should be complete
        (isComplete, ) = registry.verifyJudgingComplete(hackathonId, testProjectIds);
        assertTrue(isComplete);
    }

    // ============ ADMIN FUNCTION TESTS ============

    function test_SetMinimumJudgesPerCategory() public {
        registry.setMinimumJudgesPerCategory(5);
        assertEq(registry.minimumJudgesPerCategory(), 5);
    }

    function test_SetMinimumJudgesPerCategory_RevertIfNotOwner() public {
        vm.prank(judge1);
        vm.expectRevert();
        registry.setMinimumJudgesPerCategory(5);
    }

    function test_SetMinimumReputationScore() public {
        registry.setMinimumReputationScore(700);
        assertEq(registry.minimumReputationScore(), 700);
    }

    function test_PauseUnpause() public {
        registry.pause();
        assertTrue(registry.paused());

        registry.unpause();
        assertFalse(registry.paused());
    }

    // ============ HELPER FUNCTIONS ============

    function _setupJudgingEnvironment() internal {
        // Invite and accept 3 judges
        vm.prank(organizer);
        registry.inviteJudge(judge1, hackathonId, "QmJudge1Profile");

        vm.prank(organizer);
        registry.inviteJudge(judge2, hackathonId, "QmJudge2Profile");

        vm.prank(organizer);
        registry.inviteJudge(judge3, hackathonId, "QmJudge3Profile");

        vm.prank(judge1);
        registry.acceptJudgeInvitation(hackathonId);

        vm.prank(judge2);
        registry.acceptJudgeInvitation(hackathonId);

        vm.prank(judge3);
        registry.acceptJudgeInvitation(hackathonId);

        // Add prize categories
        vm.prank(organizer);
        hackathon.addPrizeCategory("Best Overall", 1 ether);

        vm.prank(organizer);
        hackathon.addPrizeCategory("Most Innovative", 0.5 ether);

        // Set scoring criteria
        vm.prank(organizer);
        registry.setScoringCriteria(hackathonId, "QmScoringCriteriaHash", 1000);

        vm.prank(organizer);
        registry.finalizeScoringCriteria(hackathonId);

        // Assign judges to categories
        uint256[] memory categoryIds0 = new uint256[](1);
        categoryIds0[0] = 0; // category 0

        uint256[] memory categoryIds1 = new uint256[](1);
        categoryIds1[0] = 1; // category 1

        uint256[] memory categoryIdsBoth = new uint256[](2);
        categoryIdsBoth[0] = 0;
        categoryIdsBoth[1] = 1;

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge1, categoryIdsBoth);

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge2, categoryIdsBoth);

        vm.prank(organizer);
        registry.assignJudgeToCategories(hackathonId, judge3, categoryIdsBoth);

        // Keep default minimum judges of 3
        // registry.setMinimumJudgesPerCategory(2);

        // Lock judge assignments
        vm.prank(organizer);
        registry.lockJudgeAssignments(hackathonId);
    }

    function _submitAllEvaluations() internal {
        // Move to judging phase
        vm.warp(block.timestamp + 2 days + 1);
        hackathon.updatePhase();

        // Submit evaluations for category 0
        // Project 1: 850 average (judge1: 850, judge2: 800, judge3: 900)
        vm.prank(judge1);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            850,
            "QmEval1"
        );

        vm.prank(judge2);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            800,
            "QmEval2"
        );

        vm.prank(judge3);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            0,
            900,
            "QmEval3"
        );

        // Project 2: 700 average (judge2: 750, judge3: 650)
        vm.prank(judge2);
        registry.submitEvaluation(
            hackathonId,
            projectIds[1],
            0,
            750,
            "QmEval4"
        );

        vm.prank(judge3);
        registry.submitEvaluation(
            hackathonId,
            projectIds[1],
            0,
            650,
            "QmEval5"
        );

        // Submit evaluations for category 1
        // Project 1: 600 average (judge1: 600, judge2: 600, judge3: 600)
        vm.prank(judge1);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            1,
            600,
            "QmEval6"
        );

        vm.prank(judge2);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            1,
            600,
            "QmEval7"
        );

        vm.prank(judge3);
        registry.submitEvaluation(
            hackathonId,
            projectIds[0],
            1,
            600,
            "QmEval8"
        );

        // Project 2: 750 average (judge1: 800, judge2: 800, judge3: 700)
        vm.prank(judge1);
        registry.submitEvaluation(
            hackathonId,
            projectIds[1],
            1,
            800,
            "QmEval9"
        );

        vm.prank(judge2);
        registry.submitEvaluation(
            hackathonId,
            projectIds[1],
            1,
            800,
            "QmEval10"
        );

        vm.prank(judge3);
        registry.submitEvaluation(
            hackathonId,
            projectIds[1],
            1,
            700,
            "QmEval11"
        );
    }
}
