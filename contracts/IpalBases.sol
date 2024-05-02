// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IpalBases is ERC1155, Ownable {
    constructor(address initialOwner, string memory uri)
    ERC1155(uri)
    Ownable(initialOwner) {}
}
