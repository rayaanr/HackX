import { expect } from "chai";
import { viem } from "hardhat";
import { getAddress, parseEther } from "viem";

describe("SimpleHackathonFactory", function () {
  it("Should deploy and create hackathons", async function () {
    // Deploy the factory
    const factory = await viem.deployContract("SimpleHackathonFactory");

    // Create a hackathon
    const ipfsHash = "QmTestHash123";
    const hash = await factory.write.createHackathon([ipfsHash]);
    
    // Get the transaction receipt to check events
    const receipt = await viem.getPublicClient().waitForTransactionReceipt({ hash });
    
    // Check that hackathon was created
    const hackathonCount = await factory.read.getTotalHackathons();
    expect(hackathonCount).to.equal(1n);
    
    // Get hackathon address
    const hackathonAddress = await factory.read.getHackathon([0n]);
    expect(hackathonAddress).to.not.equal("0x0000000000000000000000000000000000000000");
    
    console.log("Factory deployed at:", factory.address);
    console.log("Hackathon created at:", hackathonAddress);
    console.log("Transaction hash:", hash);
  });

  it("Should only allow owner to create hackathons", async function () {
    const [owner, user1] = await viem.getWalletClients();
    
    const factory = await viem.deployContract("SimpleHackathonFactory");
    
    // Try to create hackathon as non-owner
    await expect(
      factory.write.createHackathon(["QmTestHash"], { account: user1.account })
    ).to.be.rejectedWith("OwnableUnauthorizedAccount");
  });

  it("Should reject empty IPFS hash", async function () {
    const factory = await viem.deployContract("SimpleHackathonFactory");
    
    await expect(
      factory.write.createHackathon([""])
    ).to.be.rejectedWith("IPFS hash cannot be empty");
  });
});
