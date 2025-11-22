// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {PayAnyWhereSender} from "../src/PayAnyWhereSender.sol";

contract PayAnyWhereSenderTest is Test {
    PayAnyWhereSender public payAnyWhereSender;

    function setUp() public {
        payAnyWhereSender = new PayAnyWhereSender();
    }

    function test_Increment() public {
    }

    function testFuzz_SetNumber(uint256 x) public {
    }
}
