import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Mint a ClaimSBT token for testing
 */
async function main() {
  console.log("🎨 Starting ClaimSBT minting...");

  // Check environment variables
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not set in .env file");
    process.exit(1);
  }

  const rawMintTo = process.env.MINT_TO;
  if (!rawMintTo) {
    console.error("❌ MINT_TO not set in .env file");
    process.exit(1);
  }

  // Normalize address (checksum)
  let mintTo: string;
  try {
    mintTo = ethers.getAddress(rawMintTo); // ensures correct checksum
  } catch (error) {
    console.error("❌ Invalid MINT_TO address:", rawMintTo);
    process.exit(1);
  }

  const claimURI = process.env.CLAIM_URI || "https://example.com/metadata/1";

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Minting with account:", signer.address);

  // Connect to deployed contract
  const ClaimSBT = await ethers.getContractFactory("ClaimSBT");
  const claimSBT = ClaimSBT.attach(contractAddress);

  // Verify contract connection
  try {
    const name = await claimSBT.name();
    console.log("✅ Connected to contract:", name);
  } catch (error) {
    console.error("❌ Failed to connect to contract:", error);
    process.exit(1);
  }

  // Check if signer is owner
  const owner = await claimSBT.owner();
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    console.error("❌ Only contract owner can mint tokens");
    console.error(`   Owner: ${owner}`);
    console.error(`   Signer: ${signer.address}`);
    process.exit(1);
  }

  // Mint the token
  console.log("🎨 Minting token...");
  console.log("   To:", mintTo);
  console.log("   URI:", claimURI);

  const claimData = JSON.stringify({
    type: "Achievement",
    title: "Test Claim",
    description: "This is a test claim SBT",
    issuer: signer.address,
    timestamp: new Date().toISOString(),
    attributes: {
      category: "Testing",
      level: "Beginner",
      verified: true
    }
  });

  try {
    const tx = await claimSBT.mintClaim(mintTo, claimURI, claimData);
    console.log("📤 Transaction sent:", tx.hash);

    // Wait for confirmation
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

    // Get the minted token ID from events
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
      console.log("🎉 Token minted successfully!");
      console.log("   Token ID:", tokenId?.toString());
      console.log("   Owner:", mintTo);
      console.log("   Claim Data:", claimData);

      // Verify the mint
      console.log("\n🔍 Verifying mint...");
      const tokenURI = await claimSBT.tokenURI(tokenId);
      const totalSupply = await claimSBT.totalSupply();
      const userTokens = await claimSBT.getUserTokens(mintTo);

      console.log("📊 Verification Results:");
      console.log("   Token URI:", tokenURI);
      console.log("   Total Supply:", totalSupply.toString());
      console.log("   User Tokens:", userTokens.map(t => t.toString()));
    }
  } catch (error: any) {
    console.error("❌ Minting failed:", error.message);
    if (error.reason) console.error("   Reason:", error.reason);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
