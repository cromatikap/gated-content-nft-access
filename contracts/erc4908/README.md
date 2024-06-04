# ERC-4908: Gated resources NFT access

---
eip: 4908
title: Gated resources NFT access, an extension of EIP-721
description: Allows resources providers for on-chain users to mint NFTs for their particular resource ID that can be used to access gated information
author: Cromatikap (@cromatikap), Velitchko Filipov (@velitchko), BChainbuddy (@BChainbuddy)
discussions-to: TODO -> open discussion on https://ethereum-magicians.org/
status: Idea
type: Standards Track
category: ERC
created: 2024-06-04
requires: 721
---

## Table of Contents

- [Abstract](#abstract)
- [Motivation](#motivation)
- [Specification](#specification)
  - [Contract Interface](#contract-interface)
  - [Reference Implementation](#reference-implementation)
  - [Example implementation](#example-implementation)
- [Rationale](#rationale)
- [Test Cases](#test-cases)
- [Copyright](#copyright)


## Abstract

This standard is an extension of [EIP-721](https://eips.ethereum.org/EIPS/eip-721) that allows for the creation of NFTs that can be used to access gated resources such as information, database or real world assets (RWA). The NFTs are allowed by the resource author to be minted by anyone on chain. The author specifies a mint price and an access expiration time. The NFTs can be transferred to other users, who can then access the information for the remaining time.
The NFT ownership and expiration time is verified on-chain by the contract.

## Motivation

Tailored for the needs of the [Ipal platform](https://app.ipal.network/). The goal is similar to [eip-4907 rentable NFTs](https://eips.ethereum.org/EIPS/eip-4907) but with a radicaly different approach. The emphasis is on the off-chain verification of the contract state for an information management platform to take a decision whether or not to give acces based on user's holdings of its NFTs.
The user keeps the ability to transfer or put on sale the expired NFTs which the value could be drawn from the historical event of having a past access. 

## Specification

The keywords “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY” and “OPTIONAL” in this document are to be interpreted as described in RFC 2119.

### Contract Interface

Solidity Interface with NatSpec & OpenZeppelin v5 Interfaces (also available at [IERC4908.sol](IERC4908.sol)):

```solidity
interface IERC4908 {
    /// @notice Allows content access NFT to be minted
    /// @dev This function is meant to be called by the content author
    /// @param resourceId The content identification from the off-chain content service provider
    /// @param price The mint price, in other terms the access price for this particular content
    /// @param expirationTime The expiration time of the access
    function setAccess(
        uint256 resourceId,
        uint256 price,
        uint32 expirationTime
    ) external;

    /// @notice Disallows content access NFT to be minted, the remaining NFTs can still be used
    /// @dev This function is meant to be called by the content author
    /// @param resourceId The content identification from the off-chain content service provider
    function delAccess(uint256 resourceId) external;

    /// @notice Check for the access to a particular content from a particular consumer
    /// @dev This function is meant to be called by the content provider, the 2 first parameters
    ///      are meant to certify that the content ID is owned by the author while the last
    ///      `consumer` parameter is used to find if the consumer owns an NFT for this content
    ///      that is not expired.
    /// @param author The address of the content author
    /// @param resourceId The content identification from the off-chain content service provider
    /// @param consumer The address of the content consumer
    /// @return response True if the consumer has access to the content, false otherwise
    /// @return message A message indicating the access status: "access doesn't exist", "access is expired", "access granted" or "user doesn't own the NFT"
    function hasAccess(
        address author,
        uint256 resourceId,
        address consumer
    ) external view returns (bool response, string memory message);

    /// @notice Check if the given access hash exists
    /// @dev This function is called internally but can be also handy for external use
    /// @param hash The hash of the author and resourceId, used as the index of settings mapping
    /// @return response True if the access hash exists, false otherwise
    function existAccess(bytes32 hash) external view returns (bool response);

    /// @notice Mints a content access NFT
    /// @dev This function is meant to be called by the content consumer
    /// @param author address hashed with resourceId to retrieve the content settings specified by the author
    /// @param resourceId The content identification from the off-chain content service provider
    /// @param to The address of the content consumer
    function mint(
        address author,
        uint256 resourceId,
        address to
    ) external payable;

    /// @notice The author hasn't activated mint access for this resourceId
    /// @param accessHash The hash of the author and resourceId, used as the index of settings mapping
    error MintUnavailable(bytes32 accessHash);

    /// @notice The author's minting fee has not been met by the consumer
    /// @param expectedPrice A message indicating the minting fee is not met
    error InsufficientFunds(uint256 expectedPrice);
}
```

The `setAccess(uint256 resourceId, uint256 price, uint32 expirationTime)` function MAY be implemented as `public` or `external`.

The `delAccess(uint256 resourceId)` function MAY be implemented as `public` or `external`.

The `hasAccess(address author, uint256 resourceId, address consumer)` function MAY be implemented as `view`.

The `existAccess(bytes32 hash)` function MAY be implemented as `view`.

The `mint(address author, uint256 resourceId, address to)` function MAY be implemented as `public` or `external`.

## Reference Implementation

Abstract implementation: [ERC4908.sol](ERC4908.sol)

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC4908} from "./IERC4908.sol";

abstract contract ERC4908 is IERC4908, ERC721, ERC721Enumerable {
    struct Settings {
        uint256 resourceId;
        uint256 price;
        uint32 expirationTime;
    }
    mapping(bytes32 hash => Settings) public accessControl;

    // struct attached to each NFT id
    struct Metadata {
        bytes32 hash;
        uint256 resourceId;
        uint32 expirationTime;
    }

    mapping(uint256 => Metadata) public nftData;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {}

    function _hash(
        address author,
        uint256 resourceId
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(author, resourceId));
    }

    function _setAccess(
        address author,
        uint256 resourceId,
        uint256 price,
        uint32 expirationTime
    ) private {
        bytes32 hash = _hash(author, resourceId);
        accessControl[hash] = Settings(resourceId, price, expirationTime);
    }

    function setAccess(
        uint256 resourceId,
        uint256 price,
        uint32 expirationTime
    ) external {
        _setAccess(msg.sender, resourceId, price, expirationTime);
    }

    function existAccess(bytes32 hash) external view returns (bool) {
        return accessControl[hash].resourceId != 0;
    }

    function mint(
        address author,
        uint256 resourceId,
        address to
    ) public payable virtual {
        bytes32 settingsIndex = _hash(author, resourceId);
        if (!this.existAccess(settingsIndex))
            revert MintUnavailable(settingsIndex);

        uint256 price = accessControl[settingsIndex].price;

        if (msg.value < price) {
            revert InsufficientFunds(price);
        }

        uint256 tokenId = totalSupply();

        nftData[tokenId] = Metadata(
            settingsIndex,
            accessControl[settingsIndex].resourceId,
            accessControl[settingsIndex].expirationTime
        );

        _safeMint(to, tokenId);
    }

    function hasAccess(
        address author,
        uint256 resourceId,
        address consumer
    ) external view returns (bool response, string memory message) {
        bytes32 hash = _hash(author, resourceId);

        if (!this.existAccess(hash)) {
            return (false, "access doesn't exist");
        }

        for (uint256 i = 0; i < balanceOf(consumer); i++) {
            uint256 tokenId = tokenOfOwnerByIndex(consumer, i);
            Metadata memory metadata = nftData[tokenId];

            if (metadata.hash == hash) {
                if (block.timestamp > metadata.expirationTime) {
                    return (false, "access is expired");
                }
                return (true, "access granted");
            }
        }
        return (false, "user doesn't own the NFT");
    }

    function delAccess(uint256 resourceId) external {
        bytes32 hash = _hash(msg.sender, resourceId);
        delete accessControl[hash];
    }

    /*
     * overrides required for the ERC721 Enumerable extension
     */

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

### Example implementation

Example implementations are available at:
- [_Example.sol](_Example.sol)
- [GatedKnowledgeManager.sol](../GatedKnowledgeManager.sol)

## Rationale

TODO

## Test Cases

TODO

## Copyright

Copyright and related rights waived via [CC0](https://eips.ethereum.org/LICENSE).