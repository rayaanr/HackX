// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Hackathon
 * @dev Individual hackathon contract with event management
 * @author HackX Team
 */
contract Hackathon {
    // Enums
    enum Phase {
        Registration,
        Hackathon,
        Judging,
        Completed
    }

    // Events
    event PhaseChanged(Phase indexed oldPhase, Phase indexed newPhase);
    event ParticipantRegistered(address indexed participant, uint256 timestamp);

    // State variables
    uint256 public hackathonId;
    address public organizer;
    string public ipfsHash;
    Phase public currentPhase;

    // Timestamps
    uint256 public registrationStart;
    uint256 public registrationEnd;
    uint256 public hackathonStart;
    uint256 public hackathonEnd;
    uint256 public judgingEnd;

    // Participation
    uint256 public maxParticipants;
    uint256 public participantCount;
    mapping(address => bool) public participants;

    // Modifiers
    modifier onlyOrganizer() {
        require(
            msg.sender == organizer,
            "Hackathon: caller is not the organizer"
        );
        _;
    }

    modifier inPhase(Phase _phase) {
        require(currentPhase == _phase, "Hackathon: not in correct phase");
        _;
    }

    /**
     * @dev Constructor initializes the hackathon
     */
    constructor(
        uint256 _hackathonId,
        address _organizer,
        string memory _ipfsHash,
        uint256 _registrationStart,
        uint256 _registrationEnd,
        uint256 _hackathonStart,
        uint256 _hackathonEnd,
        uint256 _judgingEnd,
        uint256 _maxParticipants
    ) {
        hackathonId = _hackathonId;
        organizer = _organizer;
        ipfsHash = _ipfsHash;
        registrationStart = _registrationStart;
        registrationEnd = _registrationEnd;
        hackathonStart = _hackathonStart;
        hackathonEnd = _hackathonEnd;
        judgingEnd = _judgingEnd;
        maxParticipants = _maxParticipants;

        // Set initial phase based on current time
        if (block.timestamp < _registrationStart) {
            currentPhase = Phase.Registration; // Will be updated when registration starts
        } else {
            _updatePhase();
        }
    }

    /**
     * @dev Register as a participant
     */
    function register() external inPhase(Phase.Registration) {
        require(
            block.timestamp >= registrationStart,
            "Hackathon: registration not started"
        );
        require(
            block.timestamp <= registrationEnd,
            "Hackathon: registration ended"
        );
        require(!participants[msg.sender], "Hackathon: already registered");
        require(
            participantCount < maxParticipants,
            "Hackathon: max participants reached"
        );

        participants[msg.sender] = true;
        participantCount++;

        emit ParticipantRegistered(msg.sender, block.timestamp);

        // Auto-update phase if needed
        _updatePhase();
    }

    /**
     * @dev Update the current phase based on timestamps
     */
    function updatePhase() external {
        _updatePhase();
    }

    /**
     * @dev Internal function to update phase
     */
    function _updatePhase() internal {
        Phase oldPhase = currentPhase;

        if (block.timestamp < registrationStart) {
            currentPhase = Phase.Registration;
        } else if (block.timestamp <= registrationEnd) {
            currentPhase = Phase.Registration;
        } else if (block.timestamp <= hackathonEnd) {
            currentPhase = Phase.Hackathon;
        } else if (block.timestamp <= judgingEnd) {
            currentPhase = Phase.Judging;
        } else {
            currentPhase = Phase.Completed;
        }

        if (oldPhase != currentPhase) {
            emit PhaseChanged(oldPhase, currentPhase);
        }
    }

    /**
     * @dev Get hackathon details
     */
    function getHackathonDetails()
        external
        view
        returns (
            uint256 id,
            address org,
            string memory metadata,
            Phase phase,
            uint256 regStart,
            uint256 regEnd,
            uint256 hackStart,
            uint256 hackEnd,
            uint256 judgeEnd,
            uint256 maxPart,
            uint256 partCount
        )
    {
        return (
            hackathonId,
            organizer,
            ipfsHash,
            currentPhase,
            registrationStart,
            registrationEnd,
            hackathonStart,
            hackathonEnd,
            judgingEnd,
            maxParticipants,
            participantCount
        );
    }

    /**
     * @dev Check if an address is a participant
     */
    function isParticipant(address _user) external view returns (bool) {
        return participants[_user];
    }
}
