// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log() for debugging
// import "hardhat/console.sol";

import {ERC4908} from "./erc4908/ERC4908.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract GatedKnowledgeManager is ERC4908, ERC721URIStorage {
    string public _tokenURI;

    constructor(
        string memory uri
    ) ERC4908("Ipal Gated Knowledge Manager", "IGI") {
        _tokenURI = uri;
    }

    function mint(
        address author,
        uint256 contentId,
        address to
    ) public payable override(ERC4908) {
        super.mint(author, contentId, to);
        uint256 tokenId = totalSupply() - 1;
        _setTokenURI(
            tokenId,
            string.concat(_tokenURI, Strings.toString(tokenId))
        );
    }

    /*
     * overrides required for ERC721URIStorage extension
     */

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC4908, ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC4908, ERC721) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC4908, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
