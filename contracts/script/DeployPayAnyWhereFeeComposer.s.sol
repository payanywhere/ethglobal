// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import { PayAnyWhereFeeComposer } from "../src/PayAnyWhereFeeComposer.sol";

contract DeployPayAnyWhereFeeComposer is Script {
    function run() external returns (address) {
        address payAnyWhere = vm.envAddress("PAYANYWHERE");
        address oftIn = vm.envAddress("OFT_IN");
        address aavePool = vm.envAddress("AAVE_POOL");
        uint256 feeBps = vm.envUint("FEE_BPS");

        vm.startBroadcast();
        PayAnyWhereFeeComposer composer = new PayAnyWhereFeeComposer(payAnyWhere, aavePool, oftIn, uint16(feeBps));
        vm.stopBroadcast();

        return address(composer);
    }
}
