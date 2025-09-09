// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Hackathon.sol";

/**
 * @title HackathonFactory
 * @dev Factory contract for creating and managing hackathons
 * @author HackX Team
 */
contract HackathonFactory {
    // Events
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

    // State variables
    address public owner;
    uint256 public hackathonCounter;

    // Mappings
    mapping(uint256 => address) public hackathons;
    mapping(address => bool) public authorizedOrganizers;
    mapping(address => uint256[]) public organizerHackathons;

    // Global settings
    mapping(string => bytes) public globalSettings;

    // Modifiers
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "HackathonFactory: caller is not the owner"
        );
        _;
    }

    modifier onlyAuthorizedOrganizer() {
        require(
            authorizedOrganizers[msg.sender] || msg.sender == owner,
            "HackathonFactory: caller is not an authorized organizer"
        );
        _;
    }

    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
        authorizedOrganizers[msg.sender] = true;
    }

    /**
     * @dev Creates a new hackathon instance
     * @param _ipfsHash IPFS hash containing hackathon metadata
     * @param _registrationStart Registration start timestamp
     * @param _registrationEnd Registration end timestamp
     * @param _hackathonStart Hackathon start timestamp
     * @param _hackathonEnd Hackathon end timestamp
     * @param _judgingEnd Judging end timestamp
     * @param _maxParticipants Maximum number of participants allowed
     * @return hackathonId The ID of the created hackathon
     * @return hackathonAddress The address of the created hackathon contract
     */
    function createHackathon(
        string memory _ipfsHash,
        uint256 _registrationStart,
        uint256 _registrationEnd,
        uint256 _hackathonStart,
        uint256 _hackathonEnd,
        uint256 _judgingEnd,
        uint256 _maxParticipants
    )
        external
        onlyAuthorizedOrganizer
        returns (uint256 hackathonId, address hackathonAddress)
    {
        // Validate timestamps
        require(
            _registrationStart < _registrationEnd,
            "HackathonFactory: invalid registration period"
        );
        require(
            _registrationEnd <= _hackathonStart,
            "HackathonFactory: registration must end before hackathon starts"
        );
        require(
            _hackathonStart < _hackathonEnd,
            "HackathonFactory: invalid hackathon period"
        );
        require(
            _hackathonEnd < _judgingEnd,
            "HackathonFactory: judging must start after hackathon ends"
        );
        require(
            _maxParticipants > 0,
            "HackathonFactory: max participants must be greater than 0"
        );
        require(
            bytes(_ipfsHash).length > 0,
            "HackathonFactory: IPFS hash cannot be empty"
        );

        hackathonId = hackathonCounter++;

        // Deploy new Hackathon contract
        Hackathon newHackathon = new Hackathon(
            hackathonId,
            msg.sender, // organizer
            _ipfsHash,
            _registrationStart,
            _registrationEnd,
            _hackathonStart,
            _hackathonEnd,
            _judgingEnd,
            _maxParticipants
        );

        hackathonAddress = address(newHackathon);

        // Store in registry
        hackathons[hackathonId] = hackathonAddress;
        organizerHackathons[msg.sender].push(hackathonId);

        emit HackathonCreated(
            hackathonAddress,
            hackathonId,
            msg.sender,
            _ipfsHash
        );

        return (hackathonId, hackathonAddress);
    }

    /**
     * @dev Adds an authorized organizer
     * @param _organizer Address to authorize as organizer
     */
    function addOrganizer(address _organizer) external onlyOwner {
        require(
            _organizer != address(0),
            "HackathonFactory: organizer cannot be zero address"
        );
        require(
            !authorizedOrganizers[_organizer],
            "HackathonFactory: organizer already authorized"
        );

        authorizedOrganizers[_organizer] = true;
        emit OrganizerAdded(_organizer, msg.sender);
    }

    /**
     * @dev Removes an authorized organizer
     * @param _organizer Address to remove from organizers
     */
    function removeOrganizer(address _organizer) external onlyOwner {
        require(_organizer != owner, "HackathonFactory: cannot remove owner");
        require(
            authorizedOrganizers[_organizer],
            "HackathonFactory: organizer not found"
        );

        authorizedOrganizers[_organizer] = false;
        emit OrganizerRemoved(_organizer, msg.sender);
    }

    /**
     * @dev Sets a global setting
     * @param _setting Setting name
     * @param _value Setting value
     */
    function setGlobalSetting(
        string memory _setting,
        bytes memory _value
    ) external onlyOwner {
        globalSettings[_setting] = _value;
        emit GlobalSettingUpdated(_setting, _value);
    }

    /**
     * @dev Gets a global setting
     * @param _setting Setting name
     * @return value Setting value
     */
    function getGlobalSetting(
        string memory _setting
    ) external view returns (bytes memory) {
        return globalSettings[_setting];
    }

    /**
     * @dev Gets hackathon address by ID
     * @param _hackathonId Hackathon ID
     * @return Hackathon contract address
     */
    function getHackathonAddress(
        uint256 _hackathonId
    ) external view returns (address) {
        return hackathons[_hackathonId];
    }

    /**
     * @dev Gets all hackathon IDs created by an organizer
     * @param _organizer Organizer address
     * @return Array of hackathon IDs
     */
    function getOrganizerHackathons(
        address _organizer
    ) external view returns (uint256[] memory) {
        return organizerHackathons[_organizer];
    }

    /**
     * @dev Gets total number of hackathons created
     * @return Total hackathon count
     */
    function getTotalHackathons() external view returns (uint256) {
        return hackathonCounter;
    }

    /**
     * @dev Checks if an address is an authorized organizer
     * @param _organizer Address to check
     * @return True if authorized, false otherwise
     */
    function isAuthorizedOrganizer(
        address _organizer
    ) external view returns (bool) {
        return authorizedOrganizers[_organizer];
    }

    /**
     * @dev Transfers ownership of the factory
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(
            _newOwner != address(0),
            "HackathonFactory: new owner cannot be zero address"
        );
        require(
            _newOwner != owner,
            "HackathonFactory: new owner cannot be current owner"
        );

        // Remove current owner from organizers and add new owner
        authorizedOrganizers[owner] = false;
        authorizedOrganizers[_newOwner] = true;

        address previousOwner = owner;
        owner = _newOwner;

        emit OrganizerRemoved(previousOwner, _newOwner);
        emit OrganizerAdded(_newOwner, _newOwner);
    }
}
