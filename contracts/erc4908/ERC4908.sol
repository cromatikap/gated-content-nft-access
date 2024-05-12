// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC4908} from "./IERC4908.sol";

abstract contract ERC4908 is IERC4908, ERC721, ERC721Enumerable {
    struct Settings {
        uint256 contentId;
        uint256 price;
        uint32 expirationTime;
    }
    mapping(bytes32 hash => Settings) public accessControl;

    // struct attached to each NFT id
    struct Metadata {
        bytes32 hash;
        uint256 contentId;
        uint32 expirationTime;
    }

    mapping(uint256 => Metadata) public nftData;

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {}

    function _hash(
        address author,
        uint256 contentId
    ) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(author, contentId));
    }

    function _setAccess(
        address author,
        uint256 contentId,
        uint256 price,
        uint32 expirationTime
    ) private {
        bytes32 hash = _hash(author, contentId);
        accessControl[hash] = Settings(contentId, price, expirationTime);
    }

    function setAccess(
        uint256 contentId,
        uint256 price,
        uint32 expirationTime
    ) external {
        _setAccess(msg.sender, contentId, price, expirationTime);
    }

    function existAccess(bytes32 hash) external view returns (bool) {
        return accessControl[hash].contentId != 0;
    }

    function mint(
        address author,
        uint256 contentId,
        address to
    ) public virtual {
        bytes32 settingsIndex = _hash(author, contentId);
        if (!this.existAccess(settingsIndex))
            revert MintUnavailable(settingsIndex);

        uint256 tokenId = totalSupply();

        nftData[tokenId] = Metadata(
            settingsIndex,
            accessControl[settingsIndex].contentId,
            accessControl[settingsIndex].expirationTime
        );

        _safeMint(to, tokenId);
    }

    function hasAccess(
        address author,
        uint256 contentId,
        address consumer
    ) external view returns (bool) {
        for (uint256 i = 0; i < balanceOf(author); i++) {
            if (
                nftData[tokenOfOwnerByIndex(consumer, i)].hash ==
                _hash(author, contentId)
            ) {
                /* TODO: check expiration time */

                return true;
            }
        }
        return false;
    }

    function delAccess(uint256 contentId) external {
        bytes32 hash = _hash(msg.sender, contentId);
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
