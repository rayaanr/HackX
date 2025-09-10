// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Hackathon.sol";

/**
 * @title JudgeRegistry
 * @dev Judge assignment and comprehensive evaluation system for hackathons
 * @author HackX Team
 */
contract JudgeRegistry is ReentrancyGuard, Pausable, Ownable {
    // Enums
    enum JudgeStatus {
        INVITED,
        ACCEPTED,
        REJECTED,
        REMOVED
    }

    enum EvaluationStatus {
        NOT_STARTED,
        IN_PROGRESS,
        SUBMITTED,
        FINALIZED
    }

    // Structs
    struct Judge {
        string ipfsProfile; // IPFS hash: bio, expertise, photo, credentials
        JudgeStatus status;
        uint256 hackathonsJudged;
        uint256 reputation; // Reputation score (0-1000)
        address wallet;
        uint256 registeredAt;
        bool active;
    }

    struct HackathonJudgeAssignment {
        uint256 hackathonId;
        address hackathonContract;
        uint256[] assignedCategories; // Prize category IDs this judge evaluates
        mapping(uint256 => bool) hasCategory;
        bool locked; // True when judging phase starts
        uint256 assignedAt;
    }

    struct Evaluation {
        uint256 projectId;
        uint256 categoryId;
        address judge;
        string ipfsHash; // IPFS: detailed feedback, rubric scores, comments
        uint256 finalScore; // Weighted final score (0-1000 points)
        EvaluationStatus status;
        uint256 submittedAt;
        bool conflictOfInterest;
    }

    struct ScoringCriteria {
        string ipfsHash; // IPFS: detailed criteria, rubrics, weights
        uint256 totalWeight; // Sum of all criteria weights (should equal 1000)
        bool finalized;
        uint256 createdAt;
    }

    // State variables
    mapping(address => Judge) public judges;
    mapping(uint256 => ScoringCriteria) public hackathonCriteria;
    mapping(uint256 => mapping(address => HackathonJudgeAssignment))
        public hackathonJudges;
    mapping(uint256 => address[]) public hackathonJudgeList;
    mapping(bytes32 => Evaluation) public evaluations; // keccak256(hackathonId, projectId, categoryId, judge)
    mapping(uint256 => mapping(uint256 => mapping(uint256 => uint256)))
        public projectCategoryScores; // hackathonId => projectId => categoryId => totalScore
    mapping(uint256 => mapping(uint256 => mapping(uint256 => uint256)))
        public projectCategoryEvaluations; // hackathonId => projectId => categoryId => evaluation count

    address[] public allJudges;
    mapping(uint256 => bool) public hackathonExists;
    mapping(uint256 => address) public storedHackathonContracts;
    uint256 public minimumJudgesPerCategory = 1;
    uint256 public minimumReputationScore = 0;

    // Constants
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant MIN_JUDGES_CONSENSUS = 1;

    // Events
    event JudgeInvited(
        address indexed judge,
        uint256 indexed hackathonId,
        address indexed invitedBy,
        string ipfsProfile
    );

    event JudgeAccepted(
        address indexed judge,
        uint256 indexed hackathonId,
        uint256 timestamp
    );

    event JudgeRejected(
        address indexed judge,
        uint256 indexed hackathonId,
        uint256 timestamp
    );

    event JudgeAssignedToCategory(
        address indexed judge,
        uint256 indexed hackathonId,
        uint256 indexed categoryId
    );

    event EvaluationSubmitted(
        address indexed judge,
        uint256 indexed hackathonId,
        uint256 indexed projectId,
        uint256 categoryId,
        uint256 score,
        string ipfsHash
    );

    event ScoringCriteriaSet(
        uint256 indexed hackathonId,
        string ipfsHash,
        uint256 totalWeight
    );

    event ConflictOfInterestDeclared(
        address indexed judge,
        uint256 indexed hackathonId,
        uint256 indexed projectId,
        uint256 categoryId
    );

    event JudgeAssignmentsLocked(
        uint256 indexed hackathonId,
        uint256 judgeCount
    );

    event WinnersCalculated(
        uint256 indexed hackathonId,
        uint256 indexed categoryId,
        uint256 indexed projectId,
        uint256 finalScore
    );

    // Modifiers
    modifier onlyRegisteredJudge() {
        require(
            judges[msg.sender].active,
            "JudgeRegistry: caller is not an active judge"
        );
        _;
    }

    modifier onlyHackathonOrganizer(uint256 _hackathonId) {
        require(
            hackathonExists[_hackathonId],
            "JudgeRegistry: hackathon does not exist"
        );

        // Get hackathon contract from stored mapping
        address hackathonContract = storedHackathonContracts[_hackathonId];
        require(
            hackathonContract != address(0),
            "JudgeRegistry: invalid hackathon contract"
        );

        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            msg.sender == hackathon.organizer(),
            "JudgeRegistry: caller is not the hackathon organizer"
        );
        _;
    }

    modifier judgeAssignmentsNotLocked(uint256 _hackathonId) {
        require(
            !hackathonJudges[_hackathonId][msg.sender].locked,
            "JudgeRegistry: judge assignments are locked"
        );
        _;
    }

    modifier onlyDuringJudgingPhase(uint256 _hackathonId) {
        address hackathonContract = getHackathonContract(_hackathonId);
        Hackathon hackathon = Hackathon(hackathonContract);
        require(
            hackathon.currentPhase() == Hackathon.Phase.Judging,
            "JudgeRegistry: not in judging phase"
        );
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() Ownable(msg.sender) {}

    // ============ JUDGE MANAGEMENT ============

    /**
     * @dev Register a hackathon for judging
     * @param _hackathonId Hackathon ID
     * @param _hackathonContract Address of the hackathon contract
     */
    function registerHackathon(
        uint256 _hackathonId,
        address _hackathonContract
    ) external onlyOwner {
        require(
            _hackathonContract != address(0),
            "JudgeRegistry: invalid hackathon contract"
        );
        require(
            !hackathonExists[_hackathonId],
            "JudgeRegistry: hackathon already registered"
        );

        hackathonExists[_hackathonId] = true;
        storedHackathonContracts[_hackathonId] = _hackathonContract;

        // Verify this is a valid hackathon contract
        Hackathon hackathon = Hackathon(_hackathonContract);
        require(
            hackathon.hackathonId() == _hackathonId,
            "JudgeRegistry: hackathon ID mismatch"
        );
    }

    /**
     * @dev Invite a judge to evaluate a hackathon
     * @param _judge Judge wallet address
     * @param _hackathonId Hackathon ID
     * @param _ipfsProfile IPFS hash containing judge profile information
     */
    function inviteJudge(
        address _judge,
        uint256 _hackathonId,
        string memory _ipfsProfile
    )
        external
        onlyHackathonOrganizer(_hackathonId)
        judgeAssignmentsNotLocked(_hackathonId)
        nonReentrant
    {
        require(_judge != address(0), "JudgeRegistry: invalid judge address");
        require(
            bytes(_ipfsProfile).length > 0,
            "JudgeRegistry: IPFS profile required"
        );

        // Initialize judge if not exists
        if (!judges[_judge].active) {
            judges[_judge] = Judge({
                ipfsProfile: _ipfsProfile,
                status: JudgeStatus.INVITED,
                hackathonsJudged: 0,
                reputation: 500, // Start with decent reputation
                wallet: _judge,
                registeredAt: block.timestamp,
                active: true
            });
            allJudges.push(_judge);
        } else {
            // Update profile if judge already exists
            judges[_judge].ipfsProfile = _ipfsProfile;
            judges[_judge].status = JudgeStatus.INVITED;
        }

        // Initialize hackathon judge assignment
        HackathonJudgeAssignment storage assignment = hackathonJudges[
            _hackathonId
        ][_judge];
        assignment.hackathonId = _hackathonId;
        assignment.hackathonContract = getHackathonContract(_hackathonId);
        assignment.locked = false;
        assignment.assignedAt = block.timestamp;

        emit JudgeInvited(_judge, _hackathonId, msg.sender, _ipfsProfile);
    }

    /**
     * @dev Accept judge invitation
     * @param _hackathonId Hackathon ID
     */
    function acceptJudgeInvitation(
        uint256 _hackathonId
    ) external judgeAssignmentsNotLocked(_hackathonId) nonReentrant {
        require(
            hackathonExists[_hackathonId],
            "JudgeRegistry: hackathon does not exist"
        );
        require(
            judges[msg.sender].active &&
                judges[msg.sender].status == JudgeStatus.INVITED,
            "JudgeRegistry: no invitation found"
        );

        judges[msg.sender].status = JudgeStatus.ACCEPTED;
        hackathonJudgeList[_hackathonId].push(msg.sender);

        emit JudgeAccepted(msg.sender, _hackathonId, block.timestamp);
    }

    /**
     * @dev Reject judge invitation
     * @param _hackathonId Hackathon ID
     */
    function rejectJudgeInvitation(
        uint256 _hackathonId
    ) external judgeAssignmentsNotLocked(_hackathonId) nonReentrant {
        require(
            hackathonExists[_hackathonId],
            "JudgeRegistry: hackathon does not exist"
        );
        require(
            judges[msg.sender].status == JudgeStatus.INVITED,
            "JudgeRegistry: no invitation found"
        );

        judges[msg.sender].status = JudgeStatus.REJECTED;

        emit JudgeRejected(msg.sender, _hackathonId, block.timestamp);
    }

    /**
     * @dev Get hackathon contract address
     * @param _hackathonId Hackathon ID
     */
    function getHackathonContract(
        uint256 _hackathonId
    ) public view returns (address) {
        require(
            hackathonExists[_hackathonId],
            "JudgeRegistry: hackathon does not exist"
        );

        // Get from stored hackathon contracts mapping
        address hackathonContract = storedHackathonContracts[_hackathonId];
        require(
            hackathonContract != address(0),
            "JudgeRegistry: hackathon not registered"
        );
        return hackathonContract;
    }

    /**
     * @dev Get judge information
     * @param _judge Judge address
     */
    function getJudge(
        address _judge
    )
        external
        view
        returns (
            string memory ipfsProfile,
            JudgeStatus status,
            uint256 hackathonsJudged,
            uint256 reputation,
            uint256 registeredAt,
            bool active
        )
    {
        Judge memory judge = judges[_judge];
        return (
            judge.ipfsProfile,
            judge.status,
            judge.hackathonsJudged,
            judge.reputation,
            judge.registeredAt,
            judge.active
        );
    }

    /**
     * @dev Get hackathon judges list
     * @param _hackathonId Hackathon ID
     */
    function getHackathonJudges(
        uint256 _hackathonId
    ) external view returns (address[] memory) {
        return hackathonJudgeList[_hackathonId];
    }

    // ============ SCORING CRITERIA MANAGEMENT ============

    /**
     * @dev Set scoring criteria for a hackathon
     * @param _hackathonId Hackathon ID
     * @param _ipfsHash IPFS hash containing detailed criteria, rubrics, and weights
     * @param _totalWeight Total weight (should equal 1000 for 100%)
     */
    function setScoringCriteria(
        uint256 _hackathonId,
        string memory _ipfsHash,
        uint256 _totalWeight
    ) external onlyHackathonOrganizer(_hackathonId) nonReentrant {
        require(
            bytes(_ipfsHash).length > 0,
            "JudgeRegistry: IPFS hash required"
        );
        require(
            _totalWeight > 0,
            "JudgeRegistry: total weight must be positive"
        );

        hackathonCriteria[_hackathonId] = ScoringCriteria({
            ipfsHash: _ipfsHash,
            totalWeight: _totalWeight,
            finalized: false,
            createdAt: block.timestamp
        });

        emit ScoringCriteriaSet(_hackathonId, _ipfsHash, _totalWeight);
    }

    /**
     * @dev Finalize scoring criteria (prevents further changes)
     * @param _hackathonId Hackathon ID
     */
    function finalizeScoringCriteria(
        uint256 _hackathonId
    ) external onlyHackathonOrganizer(_hackathonId) {
        require(
            bytes(hackathonCriteria[_hackathonId].ipfsHash).length > 0,
            "JudgeRegistry: criteria not set"
        );
        hackathonCriteria[_hackathonId].finalized = true;
    }

    /**
     * @dev Assign judge to specific prize categories
     * @param _hackathonId Hackathon ID
     * @param _judge Judge address
     * @param _categoryIds Array of prize category IDs
     */
    function assignJudgeToCategories(
        uint256 _hackathonId,
        address _judge,
        uint256[] memory _categoryIds
    )
        external
        onlyHackathonOrganizer(_hackathonId)
        judgeAssignmentsNotLocked(_hackathonId)
        nonReentrant
    {
        require(
            judges[_judge].status == JudgeStatus.ACCEPTED,
            "JudgeRegistry: judge not accepted"
        );
        require(
            _categoryIds.length > 0,
            "JudgeRegistry: no categories specified"
        );

        HackathonJudgeAssignment storage assignment = hackathonJudges[
            _hackathonId
        ][_judge];

        // Clear existing assignments
        for (uint256 i = 0; i < assignment.assignedCategories.length; i++) {
            assignment.hasCategory[assignment.assignedCategories[i]] = false;
        }
        delete assignment.assignedCategories;

        // Assign new categories
        for (uint256 i = 0; i < _categoryIds.length; i++) {
            assignment.assignedCategories.push(_categoryIds[i]);
            assignment.hasCategory[_categoryIds[i]] = true;
            emit JudgeAssignedToCategory(_judge, _hackathonId, _categoryIds[i]);
        }
    }

    /**
     * @dev Lock judge assignments (called when judging phase starts)
     * @param _hackathonId Hackathon ID
     */
    function lockJudgeAssignments(
        uint256 _hackathonId
    ) external onlyHackathonOrganizer(_hackathonId) nonReentrant {
        require(
            hackathonJudgeList[_hackathonId].length > 0,
            "JudgeRegistry: no judges assigned"
        );

        address[] memory judgeList = hackathonJudgeList[_hackathonId];
        for (uint256 i = 0; i < judgeList.length; i++) {
            hackathonJudges[_hackathonId][judgeList[i]].locked = true;
        }

        emit JudgeAssignmentsLocked(_hackathonId, judgeList.length);
    }

    // ============ EVALUATION SYSTEM ============

    /**
     * @dev Submit evaluation for a project
     * @param _hackathonId Hackathon ID
     * @param _projectId Project ID
     * @param _categoryId Prize category ID
     * @param _finalScore Final weighted score (0-1000)
     * @param _ipfsHash IPFS hash containing detailed evaluation
     */
    function submitEvaluation(
        uint256 _hackathonId,
        uint256 _projectId,
        uint256 _categoryId,
        uint256 _finalScore,
        string memory _ipfsHash
    )
        external
        onlyRegisteredJudge
        onlyDuringJudgingPhase(_hackathonId)
        nonReentrant
        whenNotPaused
    {
        require(
            _finalScore <= MAX_SCORE,
            "JudgeRegistry: score exceeds maximum"
        );
        require(
            bytes(_ipfsHash).length > 0,
            "JudgeRegistry: IPFS hash required"
        );
        require(
            hackathonJudges[_hackathonId][msg.sender].hasCategory[_categoryId],
            "JudgeRegistry: judge not assigned to this category"
        );

        bytes32 evaluationKey = keccak256(
            abi.encodePacked(_hackathonId, _projectId, _categoryId, msg.sender)
        );
        require(
            evaluations[evaluationKey].status == EvaluationStatus.NOT_STARTED,
            "JudgeRegistry: evaluation already submitted"
        );

        evaluations[evaluationKey] = Evaluation({
            projectId: _projectId,
            categoryId: _categoryId,
            judge: msg.sender,
            ipfsHash: _ipfsHash,
            finalScore: _finalScore,
            status: EvaluationStatus.SUBMITTED,
            submittedAt: block.timestamp,
            conflictOfInterest: false
        });

        // Update aggregated scores
        projectCategoryScores[_hackathonId][_projectId][
            _categoryId
        ] += _finalScore;
        projectCategoryEvaluations[_hackathonId][_projectId][_categoryId]++;

        // Update judge statistics  
        judges[msg.sender].hackathonsJudged++;
        if (judges[msg.sender].reputation < 1000) {
            judges[msg.sender].reputation += 20; // Faster reputation increase for hackathons
        }

        emit EvaluationSubmitted(
            msg.sender,
            _hackathonId,
            _projectId,
            _categoryId,
            _finalScore,
            _ipfsHash
        );
    }

    /**
     * @dev Declare conflict of interest
     * @param _hackathonId Hackathon ID
     * @param _projectId Project ID
     * @param _categoryId Prize category ID
     */
    function declareConflictOfInterest(
        uint256 _hackathonId,
        uint256 _projectId,
        uint256 _categoryId
    )
        external
        onlyRegisteredJudge
        onlyDuringJudgingPhase(_hackathonId)
        nonReentrant
    {
        require(
            hackathonJudges[_hackathonId][msg.sender].hasCategory[_categoryId],
            "JudgeRegistry: judge not assigned to this category"
        );

        bytes32 evaluationKey = keccak256(
            abi.encodePacked(_hackathonId, _projectId, _categoryId, msg.sender)
        );
        evaluations[evaluationKey] = Evaluation({
            projectId: _projectId,
            categoryId: _categoryId,
            judge: msg.sender,
            ipfsHash: "",
            finalScore: 0,
            status: EvaluationStatus.FINALIZED,
            submittedAt: block.timestamp,
            conflictOfInterest: true
        });

        emit ConflictOfInterestDeclared(
            msg.sender,
            _hackathonId,
            _projectId,
            _categoryId
        );
    }

    /**
     * @dev Get project score for a specific category
     * @param _hackathonId Hackathon ID
     * @param _projectId Project ID
     * @param _categoryId Prize category ID
     */
    function getProjectCategoryScore(
        uint256 _hackathonId,
        uint256 _projectId,
        uint256 _categoryId
    )
        external
        view
        returns (
            uint256 totalScore,
            uint256 evaluationCount,
            uint256 averageScore
        )
    {
        totalScore = projectCategoryScores[_hackathonId][_projectId][
            _categoryId
        ];
        evaluationCount = projectCategoryEvaluations[_hackathonId][_projectId][
            _categoryId
        ];
        averageScore = evaluationCount > 0 ? totalScore / evaluationCount : 0;
    }

    /**
     * @dev Get evaluation details
     * @param _hackathonId Hackathon ID
     * @param _projectId Project ID
     * @param _categoryId Prize category ID
     * @param _judge Judge address
     */
    function getEvaluation(
        uint256 _hackathonId,
        uint256 _projectId,
        uint256 _categoryId,
        address _judge
    )
        external
        view
        returns (
            string memory ipfsHash,
            uint256 finalScore,
            EvaluationStatus status,
            uint256 submittedAt,
            bool conflictOfInterest
        )
    {
        bytes32 evaluationKey = keccak256(
            abi.encodePacked(_hackathonId, _projectId, _categoryId, _judge)
        );
        Evaluation memory eval = evaluations[evaluationKey];
        return (
            eval.ipfsHash,
            eval.finalScore,
            eval.status,
            eval.submittedAt,
            eval.conflictOfInterest
        );
    }

    /**
     * @dev Get scoring criteria for a hackathon
     * @param _hackathonId Hackathon ID
     */
    function getScoringCriteria(
        uint256 _hackathonId
    )
        external
        view
        returns (
            string memory ipfsHash,
            uint256 totalWeight,
            bool finalized,
            uint256 createdAt
        )
    {
        ScoringCriteria memory criteria = hackathonCriteria[_hackathonId];
        return (
            criteria.ipfsHash,
            criteria.totalWeight,
            criteria.finalized,
            criteria.createdAt
        );
    }

    /**
     * @dev Check if judge is assigned to a category
     * @param _hackathonId Hackathon ID
     * @param _judge Judge address
     * @param _categoryId Category ID
     */
    function isJudgeAssignedToCategory(
        uint256 _hackathonId,
        address _judge,
        uint256 _categoryId
    ) external view returns (bool) {
        return hackathonJudges[_hackathonId][_judge].hasCategory[_categoryId];
    }

    // ============ WINNER CALCULATION SYSTEM ============

    /**
     * @dev Calculate and return winners for all prize categories
     * @param _hackathonId Hackathon ID
     * @param _projectIds Array of project IDs to evaluate
     * @return categoryIds Array of category IDs
     * @return winners Array of winning project IDs for each category
     * @return scores Array of winning scores for each category
     */
    function calculateWinners(
        uint256 _hackathonId,
        uint256[] memory _projectIds
    )
        external
        returns (
            uint256[] memory categoryIds,
            uint256[] memory winners,
            uint256[] memory scores
        )
    {
        require(
            hackathonExists[_hackathonId],
            "JudgeRegistry: hackathon does not exist"
        );

        // Get hackathon contract to determine number of categories
        address hackathonContract = getHackathonContractByHackathonId(
            _hackathonId
        );
        Hackathon hackathon = Hackathon(hackathonContract);
        uint256 categoryCount = hackathon.prizeCategories();

        categoryIds = new uint256[](categoryCount);
        winners = new uint256[](categoryCount);
        scores = new uint256[](categoryCount);

        // Calculate winner for each category
        for (uint256 categoryId = 0; categoryId < categoryCount; categoryId++) {
            (
                uint256 winningProjectId,
                uint256 winningScore
            ) = calculateCategoryWinner(_hackathonId, _projectIds, categoryId);

            categoryIds[categoryId] = categoryId;
            winners[categoryId] = winningProjectId;
            scores[categoryId] = winningScore;

            if (winningProjectId != type(uint256).max) {
                emit WinnersCalculated(
                    _hackathonId,
                    categoryId,
                    winningProjectId,
                    winningScore
                );
            }
        }
    }

    /**
     * @dev Calculate winner for a specific prize category
     * @param _hackathonId Hackathon ID
     * @param _projectIds Array of project IDs to evaluate
     * @param _categoryId Prize category ID
     * @return winningProjectId Winning project ID (type(uint256).max if no winner)
     * @return winningScore Winning average score
     */
    function calculateCategoryWinner(
        uint256 _hackathonId,
        uint256[] memory _projectIds,
        uint256 _categoryId
    ) public view returns (uint256 winningProjectId, uint256 winningScore) {
        winningProjectId = type(uint256).max; // Initialize to max value (no winner)
        winningScore = 0;

        for (uint256 i = 0; i < _projectIds.length; i++) {
            uint256 projectId = _projectIds[i];

            uint256 totalScore = projectCategoryScores[_hackathonId][projectId][
                _categoryId
            ];
            uint256 evaluationCount = projectCategoryEvaluations[_hackathonId][
                projectId
            ][_categoryId];

            // Skip projects with no evaluations
            if (evaluationCount == 0) {
                continue;
            }

            uint256 averageScore = totalScore / evaluationCount;

            // Update winner if this project has higher average score
            if (averageScore > winningScore) {
                winningScore = averageScore;
                winningProjectId = projectId;
            }
        }
    }

    /**
     * @dev Check if enough judges have evaluated a project for a category
     * @param _hackathonId Hackathon ID
     * @param _projectId Project ID
     * @param _categoryId Category ID
     * @return hasMinimum True if minimum evaluations reached
     * @return evaluationCount Current evaluation count
     */
    function hasMinimumEvaluations(
        uint256 _hackathonId,
        uint256 _projectId,
        uint256 _categoryId
    ) external view returns (bool hasMinimum, uint256 evaluationCount) {
        evaluationCount = projectCategoryEvaluations[_hackathonId][_projectId][
            _categoryId
        ];
        hasMinimum = evaluationCount > 0;
    }

    /**
     * @dev Get all project scores for a specific category (for transparency)
     * @param _hackathonId Hackathon ID
     * @param _projectIds Array of project IDs
     * @param _categoryId Category ID
     * @return projectIds_ Project IDs (returned for order confirmation)
     * @return totalScores Total scores for each project
     * @return evaluationCounts Evaluation counts for each project
     * @return averageScores Average scores for each project
     */
    function getCategoryRankings(
        uint256 _hackathonId,
        uint256[] memory _projectIds,
        uint256 _categoryId
    )
        external
        view
        returns (
            uint256[] memory projectIds_,
            uint256[] memory totalScores,
            uint256[] memory evaluationCounts,
            uint256[] memory averageScores
        )
    {
        uint256 projectCount = _projectIds.length;

        projectIds_ = new uint256[](projectCount);
        totalScores = new uint256[](projectCount);
        evaluationCounts = new uint256[](projectCount);
        averageScores = new uint256[](projectCount);

        for (uint256 i = 0; i < projectCount; i++) {
            uint256 projectId = _projectIds[i];
            projectIds_[i] = projectId;

            totalScores[i] = projectCategoryScores[_hackathonId][projectId][
                _categoryId
            ];
            evaluationCounts[i] = projectCategoryEvaluations[_hackathonId][
                projectId
            ][_categoryId];

            if (evaluationCounts[i] > 0) {
                averageScores[i] = totalScores[i] / evaluationCounts[i];
            } else {
                averageScores[i] = 0;
            }
        }
    }

    /**
     * @dev Verify that judging is complete for a hackathon
     * @param _hackathonId Hackathon ID
     * @param _projectIds Array of all project IDs
     * @return isComplete True if all categories have minimum evaluations
     * @return completionDetails Array showing completion status per category
     */
    function verifyJudgingComplete(
        uint256 _hackathonId,
        uint256[] memory _projectIds
    ) external view returns (bool isComplete, bool[] memory completionDetails) {
        address hackathonContract = getHackathonContractByHackathonId(
            _hackathonId
        );
        Hackathon hackathon = Hackathon(hackathonContract);
        uint256 categoryCount = hackathon.prizeCategories();

        completionDetails = new bool[](categoryCount);
        isComplete = true;

        for (uint256 categoryId = 0; categoryId < categoryCount; categoryId++) {
            bool categoryComplete = false;

            // Check if at least one project has any evaluations for this category
            for (uint256 i = 0; i < _projectIds.length; i++) {
                uint256 evaluationCount = projectCategoryEvaluations[
                    _hackathonId
                ][_projectIds[i]][categoryId];
                if (evaluationCount > 0) {
                    categoryComplete = true;
                    break;
                }
            }

            completionDetails[categoryId] = categoryComplete;
            if (!categoryComplete) {
                isComplete = false;
            }
        }
    }

    /**
     * @dev Get hackathon contract address by hackathon ID (helper function)
     * @param _hackathonId Hackathon ID
     */
    function getHackathonContractByHackathonId(
        uint256 _hackathonId
    ) public view returns (address) {
        address hackathonContract = storedHackathonContracts[_hackathonId];
        require(
            hackathonContract != address(0),
            "JudgeRegistry: hackathon not registered"
        );
        return hackathonContract;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Update minimum judges per category
     * @param _minimum New minimum
     */
    function setMinimumJudgesPerCategory(uint256 _minimum) external onlyOwner {
        require(_minimum >= 1, "JudgeRegistry: minimum must be at least 1");
        minimumJudgesPerCategory = _minimum;
    }

    /**
     * @dev Update minimum reputation score
     * @param _score New minimum reputation score
     */
    function setMinimumReputationScore(uint256 _score) external onlyOwner {
        require(_score <= MAX_SCORE, "JudgeRegistry: score exceeds maximum");
        minimumReputationScore = _score;
    }

    /**
     * @dev Pause the registry (emergency stop)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the registry
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
