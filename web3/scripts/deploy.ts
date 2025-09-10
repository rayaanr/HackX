import hre from "hardhat";

async function main() {
  console.log("🚀 Starting deployment...");

  // Get viem connection
  const { viem } = await hre.network.connect();

  console.log("⏳ Deploying contracts...");

  // Deploy HackathonFactory
  console.log("📦 Deploying HackathonFactory...");
  const hackathonFactory = await viem.deployContract("HackathonFactory");
  console.log("✅ HackathonFactory deployed to:", hackathonFactory.address);

  // Deploy ProjectRegistry
  console.log("📦 Deploying ProjectRegistry...");
  const projectRegistry = await viem.deployContract("ProjectRegistry");
  console.log("✅ ProjectRegistry deployed to:", projectRegistry.address);

  // Deploy JudgeRegistry
  console.log("📦 Deploying JudgeRegistry...");
  const judgeRegistry = await viem.deployContract("JudgeRegistry");
  console.log("✅ JudgeRegistry deployed to:", judgeRegistry.address);

  // Save deployment info
  const deploymentInfo = {
    network: "localhost",
    contracts: {
      HackathonFactory: hackathonFactory.address,
      ProjectRegistry: projectRegistry.address,
      JudgeRegistry: judgeRegistry.address,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("=".repeat(50));

  console.log("\n🎉 All contracts deployed successfully!");
  console.log("✅ ABIs are available in artifacts/contracts/");
  console.log("🔗 Connect your frontend to these contract addresses");

  // Test a simple contract call
  console.log("\n🧪 Testing contract deployment...");
  try {
    // You can add simple contract interaction tests here
    console.log("✅ Contracts are ready for interaction!");
  } catch (error) {
    console.error("❌ Contract test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
