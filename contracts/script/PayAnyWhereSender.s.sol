// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {PayAnyWhereSender} from "../src/PayAnyWhereSender.sol";

contract PayAnyWhereSenderScript is Script {
    PayAnyWhereSender public payAnyWhereSender;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        payAnyWhereSender = new PayAnyWhereSender();

        vm.stopBroadcast();
    }
}
