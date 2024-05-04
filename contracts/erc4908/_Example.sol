// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {ERC4908} from "./ERC4908.sol";

contract ERC4908Example is ERC4908 {
    constructor() 
    ERC4908("Gated Information ERC-4908 standard", "ERC4908") {}
}