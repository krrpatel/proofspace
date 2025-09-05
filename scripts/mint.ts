import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import readline from "readline";

dotenv.config();

// Helper to ask questions in terminal
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  console.log("🎨 Starting ClaimSBT interactive minting...");

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not set in .env file");
    process.exit(1);
  }

  const [signer] = await ethers.getSigners();
  console.log("👤 Minting with account:", signer.address);

  const ClaimSBT = await ethers.getContractFactory("ClaimSBT");
  const claimSBT = ClaimSBT.attach(contractAddress);

  // Verify contract connection
  const name = await claimSBT.name();
  console.log("✅ Connected to contract:", name);

  // Check if signer is owner
  const owner = await claimSBT.owner();
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    console.error("❌ Only contract owner can mint tokens");
    process.exit(1);
  }

  // Ask user for SBT metadata
  const sbtType = await askQuestion("Type of SBT (e.g., Achievement, KYC): ");
  const subType = await askQuestion("Sub-type (e.g., Level, Verified): ");
  const subAnswer = await askQuestion("Sub-answer (e.g., 18+ done, Beginner): ");
  const mintToInput = await askQuestion("Mint to address: ");
  const mintTo = ethers.getAddress(mintToInput); // ensure checksum

  // Generate metadata
  const metadata = {
    type: sbtType,
    subType: subType,
    subAnswer: subAnswer,
    issuer: signer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📄 Metadata to be minted:");
  console.log(JSON.stringify(metadata, null, 2));

  // Mint the token
  console.log("\n🎨 Minting token...");
  const claimURI = `https://your-metadata-server.com/metadata/${Date.now()}`; // placeholder
  const tx = await claimSBT.mintClaim(mintTo, claimURI, JSON.stringify(metadata));
  console.log("📤 Transaction sent:", tx.hash);

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

  const events = receipt?.logs || [];
  const claimMintedEvent = events.find((log: any) => {
    try {
      const parsed = claimSBT.interface.parseLog(log);
      return parsed?.name === "ClaimMinted";
    } catch {
      return false;
    }
  });

  if (claimMintedEvent) {
    const parsed = claimSBT.interface.parseLog(claimMintedEvent);
    const tokenId = parsed?.args[1];
    console.log("\n🎉 Token minted successfully!");
    console.log("   Token ID:", tokenId?.toString());
    console.log("   Owner:", mintTo);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
