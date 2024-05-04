// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log() for debugging
// import "hardhat/console.sol";

import {ERC4908} from "./erc4908/ERC4908.sol";

contract GatedKnowledgeManager is ERC4908 {
    constructor() 
    ERC4908("Ipal Gated Knowledge Manager", "IGI") {}
}