// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Hackathon.sol";

/**
 * @title HackathonFactory
 * @dev Factory contract for creating hackathons with IPFS metadata
 * @author HackX Team
 */
contract HackathonFactory is Ownable, ReentrancyGuard {
    // Events
    event HackathonCreated(
        address indexed hackathonAddress,
        uint256 indexed hackathonId,
        address indexed organizer,
        string ipfsHash
    );

    // State variables
    uint256 public hackathonCounter;

    // Mappings
    mapping(uint256 => address) public hackathons;
    mapping(address => uint256[]) public organizerHackathons;

    /**
     * @dev Constructor sets the deployer as owner
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new hackathon with IPFS metadata
     * @param ipfsHash IPFS hash containing all hackathon metadata
     * @return hackathonId The ID of the created hackathon
     * @return hackathonAddress The address of the created hackathon contract
     */
    function createHackathon(
        string memory ipfsHash
    )
        external
        onlyOwner
        nonReentrant
        returns (uint256 hackathonId, address hackathonAddress)
    {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");

        hackathonId = hackathonCounter++;

        // Deploy new Hackathon contract
        Hackathon hackathon = new Hackathon(
            hackathonId,
            msg.sender,
            ipfsHash
        );

        hackathonAddress = address(hackathon);
        hackathons[hackathonId] = hackathonAddress;
        organizerHackathons[msg.sender].push(hackathonId);

        emit HackathonCreated(
            hackathonAddress,
            hackathonId,
            msg.sender,
            ipfsHash
        );
    }

    /**
     * @dev Gets hackathon address by ID
     * @param hackathonId The hackathon ID
     * @return The hackathon contract address
     */
    function getHackathon(uint256 hackathonId) external view returns (address) {
        return hackathons[hackathonId];
    }

    /**
     * @dev Gets all hackathon IDs created by an organizer
     * @param organizer The organizer address
     * @return Array of hackathon IDs
     */
    function getOrganizerHackathons(
        address organizer
    ) external view returns (uint256[] memory) {
        return organizerHackathons[organizer];
    }

    /**
     * @dev Gets total number of hackathons created
     * @return Total hackathon count
     */
    function getTotalHackathons() external view returns (uint256) {
        return hackathonCounter;
    }
}
