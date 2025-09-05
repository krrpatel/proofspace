import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
- Verify claims by checking token ownership and metadata
*/
async function main() {
  console.log("🔍 Starting claim verification...");

  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    console.error("❌ CONTRACT_ADDRESS not set in .env file");
    process.exit(1);
  }

  // Connect to contract
  const ClaimSBT = await ethers.getContractFactory("ClaimSBT");
  const claimSBT = ClaimSBT.attach(contractAddress);

  console.log("🔗 Connected to contract:", await claimSBT.name());

  // Get total supply
  const totalSupply = await claimSBT.totalSupply();
  console.log("📊 Total tokens minted:", totalSupply.toString());

  if (totalSupply === 0n) {
    console.log("ℹ️  No tokens minted yet. Run ‘npm run mint’ first.");
    return;
  }

  // Verify all existing tokens
  console.log("\n🔍 Verifying all tokens...");

  for (let i = 1; i <= Number(totalSupply); i++) {
    try {
      console.log(`\n--- Token ID ${i} ---`);

      const [owner, claimData, metadataURI] = await claimSBT.verifyClaim(i);

      console.log("👤 Owner:", owner);
      console.log("📋 Claim Data:", claimData);
      console.log("🔗 Metadata URI:", metadataURI);

      const hasValidClaim = await claimSBT.hasValidClaim(owner);
      console.log("✅ Has Valid Claim:", hasValidClaim);

      const userTokens = await claimSBT.getUserTokens(owner);
      console.log("🎯 User's All Tokens:", userTokens.map(t => t.toString()));

      try {
        const parsedClaim = JSON.parse(claimData);
        console.log("📄 Parsed Claim:");
        console.log("   Type:", parsedClaim.type);
        
        const typeOrSubType = parsedClaim.title ?? parsedClaim.subType;
        const descriptionOrSubAnswer = parsedClaim.description ?? parsedClaim.subAnswer;

        console.log("   Type/Sub-type:", typeOrSubType);
        console.log("   Description/Sub-answer:", descriptionOrSubAnswer);
        console.log("   Issuer:", parsedClaim.issuer);
        console.log("   Timestamp:", parsedClaim.timestamp);
        if (parsedClaim.attributes) {
          console.log("   Attributes:", JSON.stringify(parsedClaim.attributes));
        }
      } catch {
        console.log("📄 Raw Claim Data:", claimData);
      }

    } catch (error: any) {
      console.error(`❌ Error verifying token ${i}:`, error.message);
    }
  }

  // Verification for specific address
  const testAddress = process.env.MINT_TO;
  if (testAddress) {
    console.log(`\n👤 Checking claims for address: ${testAddress}`);

    const hasValid = await claimSBT.hasValidClaim(testAddress);
    const userTokens = await claimSBT.getUserTokens(testAddress);

    console.log("✅ Has Valid Claims:", hasValid);
    console.log("🎯 Token Count:", userTokens.length);
    console.log("🆔 Token IDs:", userTokens.map(t => t.toString()).join(", "));

    if (userTokens.length > 0) {
      console.log("\n📋 Detailed Verification:");
      for (const tokenId of userTokens) {
        const [, claimData, uri] = await claimSBT.verifyClaim(tokenId);
        console.log(`   Token ${tokenId}:`);
        console.log(`   └── URI: ${uri}`);
        console.log(`   └── Data: ${claimData.substring(0, 100)}...`);
      }
    }
  }

  console.log("\n✅ Verification complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
