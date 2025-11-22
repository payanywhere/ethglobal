// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IOFT, SendParam, MessagingFee, OFTReceipt } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { OptionsBuilder } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OptionsBuilder.sol";

contract PayAnyWhereSenderScript is Script {
    using OptionsBuilder for bytes;

    function run() external {
        vm.startBroadcast();

        // Derive sender address from the private key
        address sender = vm.envAddress("SENDER_ADDRESS");

        address stargate = vm.envAddress("STARGATE_POOL");
        uint32 dstEid = uint32(vm.envUint("DST_EID"));
        address composer = vm.envAddress("COMPOSER");
        uint256 amountLD = vm.envUint("AMOUNT_LD");

        uint128 composeGas = 200_000;
        if (vm.envExists("COMPOSE_GAS_LIMIT")) {
            composeGas = uint128(vm.envUint("COMPOSE_GAS_LIMIT"));
        }

        address merchant = sender;
        if (vm.envExists("MERCHANT_ADDRESS")) {
            merchant = vm.envAddress("MERCHANT_ADDRESS");
        }

        address refund = sender;
        if (vm.envExists("REFUND_ADDRESS")) {
            refund = vm.envAddress("REFUND_ADDRESS");
        }
        bool payInLzToken = false;
        if (vm.envExists("PAY_IN_LZ_TOKEN")) {
            payInLzToken = vm.envBool("PAY_IN_LZ_TOKEN");
        }

        // Step 1: compose payload
        bytes memory composeMsg = abi.encode(merchant, amountLD);

        // Step 2: options (compose index 0, gas limit, no native drop)
        bytes memory extraOptions = OptionsBuilder.newOptions().addExecutorLzComposeOption(0, composeGas, 0);

        // Step 3: assemble SendParam with placeholder minAmount
        SendParam memory sendParam = SendParam({
            dstEid: dstEid, to: bytes32(uint256(uint160(composer))), amountLD: amountLD, minAmountLD: 0, extraOptions: extraOptions, composeMsg: composeMsg, oftCmd: bytes("")
        });

        // Quote OFT to learn the actual receive amount
        (,, OFTReceipt memory oftReceipt) = IOFT(stargate).quoteOFT(sendParam);
        sendParam.minAmountLD = oftReceipt.amountReceivedLD;
        sendParam.composeMsg = abi.encode(merchant, oftReceipt.amountReceivedLD);

        // Quote LayerZero messaging fee
        MessagingFee memory fee = IOFT(stargate).quoteSend(sendParam, payInLzToken);

        // ERC20 approval if required
        address token = IOFT(stargate).token();
        if (token != address(0)) {
            _ensureApproval(token, sender, stargate, sendParam.amountLD);
        }

        // Step 4: compute value (add amount if pool uses native token)
        uint256 valueToSend = fee.nativeFee;

        // Step 5: send
        (, OFTReceipt memory finalReceipt) = IOFT(stargate).send{ value: valueToSend }(sendParam, fee, refund);

        console.log("message sent; amount received LD =", finalReceipt.amountReceivedLD);

        vm.stopBroadcast();
    }

    function _ensureApproval(address token, address owner, address spender, uint256 amount) internal {
        IERC20 erc20 = IERC20(token);
        if (erc20.allowance(owner, spender) < amount) {
            erc20.approve(spender, type(uint256).max);
        }
    }
}
