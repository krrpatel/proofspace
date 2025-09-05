# Soulbound Token Proof-of-Claim System

A decentralized Proof-of-Claim system built with Soulbound Tokens (SBTs) on Ethereum Sepolia testnet. This system allows users to mint non-transferable NFTs that represent verifiable achievements, credentials, or claims.

## 🌟 Features

- **Non-transferable NFTs**: Soulbound tokens that remain permanently bound to the owner’s address
- **Decentralized Metadata Storage**: Support for IPFS and Walrus Blob Storage
- **Integrity Verification**: On-chain hash storage for tamper-proof metadata verification
- **Flexible Claims**: Support for various claim types (KYC, achievements, credentials, etc.)
- **Owner-controlled Minting**: Secure minting process restricted to contract owner

## 🏗️ Architecture

```
User
  |
  | Mint Claim
  v
ClaimSBT Contract  <-- stores owner & tokenId, hash of metadata
  |
  | References
  v
Metadata Storage (IPFS / Walrus Blob)
  |
  | Verified by anyone
  v
Wallets / Third-party Applications
```

## 📋 Requirements

- Node.js v22+
- npm or yarn
- Hardhat
- Ethereum wallet with Sepolia ETH for testing

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd soulbound-token-poc

# Install dependencies
npm install

# Install Hardhat if not already installed
npm install --save-dev hardhat
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
SEPOLIA_RPC=https://rpc.mevblocker.io
PRIVATE_KEY=0xYourPrivateKey
CONTRACT_ADDRESS=deployed-contract-address
MINT_TO=0xWalletAddress
CLAIM_URI=https://yourstorage.com/metadata.json
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### 5. Mint SBT

```bash
npx hardhat run scripts/mint.ts --network sepolia
```

## 📄 Smart Contract: ClaimSBT

### Key Features

- **ERC721-based**: Built on the standard NFT implementation
- **Soulbound Logic**: Prevents transfers by overriding `_beforeTokenTransfer`
- **Owner-only Minting**: Restricted minting functionality
- **Metadata URI**: Links to external JSON metadata

### Core Functions

```solidity
// Mint a new SBT to a user
function mintClaim(address to, string memory tokenURI) external onlyOwner

// Get token metadata URI
function tokenURI(uint256 tokenId) public view returns (string memory)

// Check if token exists
function exists(uint256 tokenId) external view returns (bool)
```

## 📊 Metadata Structure

The SBT metadata follows a standardized JSON format stored off-chain:

```json
{
  "type": "KYC",
  "subtype": "Level 1 Verification",
  "subAnswer": "Verified",
  "issuer": "ProofSpace",
  "timestamp": 1693910400,
  "description": "Know Your Customer verification completed",
  "image": "https://example.com/kyc-badge.png"
}
```

### Metadata Fields

|Field        |Type  |Description                     |
|-------------|------|--------------------------------|
|`type`       |string|Primary claim category          |
|`subtype`    |string|Specific claim subcategory      |
|`subAnswer`  |string|Claim status or result          |
|`issuer`     |string|Organization issuing the claim  |
|`timestamp`  |number|Unix timestamp of claim creation|
|`description`|string|Human-readable claim description|
|`image`      |string|Optional image URL for the claim|

## 🔐 Verification System

### On-chain Verification

```javascript
// Check if user owns a specific claim
const balance = await contract.balanceOf(userAddress);
const tokenId = await contract.tokenOfOwnerByIndex(userAddress, 0);
const tokenURI = await contract.tokenURI(tokenId);
```

### Off-chain Verification

1. **Retrieve Metadata**: Fetch JSON from IPFS/Walrus using the token URI
1. **Validate Hash**: Compare metadata hash with on-chain stored hash
1. **Verify Claims**: Check issuer, timestamp, and claim details
1. **Integrity Check**: Ensure metadata hasn’t been tampered with

## 🔧 Configuration

### Hardhat Configuration

Ensure your `hardhat.config.ts` includes Sepolia network configuration:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY!]
    }
  }
};

export default config;
```

## 📈 Extending with Walrus & Soundness Layer

### Walrus Blob Storage Integration

- Store SBT metadata as immutable blobs in Walrus decentralized storage
- Generate blob URLs that point to the hosted JSON metadata
- Provides secure, scalable object storage for claim data

### Soundness Layer Implementation

- Store SHA-256 hash of metadata on-chain in the smart contract
- Host full JSON metadata off-chain in Walrus
- Anyone can verify the blob integrity by comparing the downloaded content hash with the on-chain stored hash
- Ensures claims cannot be tampered with after issuance

## 🔮 Future Enhancements

- **Zero-Knowledge Proofs**: Privacy-preserving claim verification
- **Batch Minting**: Efficient multiple claim issuance
- **Cross-chain Support**: Multi-network SBT verification
- **Revocation System**: Ability to invalidate claims when necessary
- **Decentralized Governance**: Community-driven claim validation

## 🛠️ Development

### Running Tests

```bash
npx hardhat test
```

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

## 📄 License

This project is licensed under the MIT License - see the <LICENSE> file for details.

## 🤝 Contributing

1. Fork the repository
1. Create your feature branch (`git checkout -b feature/AmazingFeature`)
1. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
1. Push to the branch (`git push origin feature/AmazingFeature`)
1. Open a Pull Request

**Note**: This is a Proof-of-Concept system. Please conduct thorough testing and security audits before deploying to mainnet.
