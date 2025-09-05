import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Deploy ClaimSBT contract to Sepolia testnet
 */
async function main() {
  console.log("🚀 Starting ClaimSBT deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    console.warn(
      "⚠️  Warning: Low balance! Make sure you have enough ETH for deployment."
    );
  }

  // Deploy the contract
  console.log("📦 Deploying ClaimSBT contract...");
  const ClaimSBT = await ethers.getContractFactory("ClaimSBT");
  const claimSBT = await ClaimSBT.deploy(deployer.address);

  // Wait for deployment
  await claimSBT.waitForDeployment();
  const contractAddress = await claimSBT.getAddress();

  console.log("✅ ClaimSBT deployed successfully!");
  console.log("📋 Contract Address:", contractAddress);
  console.log("👤 Owner Address:", deployer.address);

  // Verify deployment
  console.log("🔍 Verifying deployment...");
  const name = await claimSBT.name();
  const symbol = await claimSBT.symbol();
  const owner = await claimSBT.owner();
  const totalSupply = await claimSBT.totalSupply();

  console.log("📊 Contract Details:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Owner:", owner);
  console.log("   Total Supply:", totalSupply.toString());

  console.log("\n📝 Next steps:");
  console.log("1. Add CONTRACT_ADDRESS to your .env file:");
  console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Run mint script: npm run mint");
  console.log("3. Verify contract on Etherscan (optional)");

  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: "sepolia",
    deploymentTime: new Date().toISOString(),
    transactionHash: claimSBT.deploymentTransaction()?.hash,
  };

  console.log("\n📄 Deployment Info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
