// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ClaimSBT
 * @dev Soulbound Token (SBT) contract for claim-based NFTs
 * Features:
 *  - Non-transferable tokens (soulbound)
 *  - Owner-only minting
 *  - URI storage for metadata
 *  - Claim verification functionality
 */
contract ClaimSBT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Mapping to store claim data for each token
    mapping(uint256 => string) public claims;
    mapping(address => uint256[]) public userTokens;

    // Events
    event ClaimMinted(address indexed to, uint256 indexed tokenId, string claim);
    event ClaimVerified(uint256 indexed tokenId, address indexed verifier);

    constructor(address initialOwner)
        ERC721("ClaimSBT", "CSBT")
        Ownable(initialOwner)
    {
        _tokenIdCounter = 1; // Start from token ID 1
    }

    /**
     * @dev Mint a new claim SBT to a specific address
     */
    function mintClaim(
        address to,
        string memory uri,
        string memory claimData
    ) public onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        claims[tokenId] = claimData;
        userTokens[to].push(tokenId);

        emit ClaimMinted(to, tokenId, claimData);
    }

    /**
     * @dev Batch mint multiple claims
     */
    function batchMintClaims(
        address[] memory recipients,
        string[] memory uris,
        string[] memory claimDataArray
    ) public onlyOwner {
        require(
            recipients.length == uris.length &&
            uris.length == claimDataArray.length,
            "Arrays length mismatch"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            mintClaim(recipients[i], uris[i], claimDataArray[i]);
        }
    }

    /**
     * @dev Verify a claim
     */
    function verifyClaim(uint256 tokenId)
        public
        view
        returns (
            address owner,
            string memory claimData,
            string memory metadataURI
        )
    {
        owner = ownerOf(tokenId);
        claimData = claims[tokenId];
        metadataURI = tokenURI(tokenId);
    }

    /**
     * @dev Get all tokens of a user
     */
    function getUserTokens(address user) public view returns (uint256[] memory) {
        return userTokens[user];
    }

    /**
     * @dev Check if user has at least one token
     */
    function hasValidClaim(address user) public view returns (bool) {
        return userTokens[user].length > 0;
    }

    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    // =====================================================
    // SOULBOUND FUNCTIONALITY - DISABLE TRANSFERS
    // =====================================================

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("SBT: Transfer not allowed - Soulbound token");
        }
        return super._update(to, tokenId, auth);
    }

    function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        revert("SBT: Approval not allowed - Soulbound token");
    }

    function setApprovalForAll(address operator, bool approved) public virtual override(ERC721, IERC721) {
        revert("SBT: Approval not allowed - Soulbound token");
    }

    // =====================================================
    // REQUIRED OVERRIDES
    // =====================================================

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
