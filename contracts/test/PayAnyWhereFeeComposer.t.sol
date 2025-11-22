// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import { ERC20Mock } from "@layerzerolabs/oft-evm/test/mocks/ERC20Mock.sol";
import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";

import { PayAnyWhereFeeComposer } from "../src/PayAnyWhereFeeComposer.sol";

contract MockOFT {
    address public tokenAddr;
    address public endpointAddr;

    constructor(address _token, address _endpoint) {
        tokenAddr = _token;
        endpointAddr = _endpoint;
    }

    function token() external view returns (address) {
        return tokenAddr;
    }

    function endpoint() external view returns (address) {
        return endpointAddr;
    }
}

contract MockAaveV3Pool {
    mapping(address => uint256) public supplied;

    function supply(
        address,
        /* asset */
        uint256 amount,
        address onBehalfOf,
        uint16 /* code */
    ) external {
        supplied[onBehalfOf] += amount;
    }
}

contract PayAnyWhereFeeComposerTest is Test {
    ERC20Mock token;
    PayAnyWhereFeeComposer composer;
    MockOFT oft;

    address public constant PAYANYWHERE = address(0xBEEF);
    MockAaveV3Pool aave;

    function setUp() public {
        token = new ERC20Mock("Mock", "MOCK");
        // set endpoint to this test contract so lzCompose authorization passes
        oft = new MockOFT(address(token), address(this));

        // feeBps = 100 -> 1%

        // deploy mock aave and composer
        aave = new MockAaveV3Pool();
        composer = new PayAnyWhereFeeComposer(PAYANYWHERE, address(aave), address(oft), 100);

        // mint tokens to the composer contract (not required for MockAave but harmless)
        // mint tokens to the composer contract so handleCompose can forward them
        token.mint(address(composer), 1000 ether);
    }

    function test_fee_and_transfer() public {
        address recipient = address(0x1234);
        uint256 amount = 100 ether;

        // build composed message: nonce, srcEid, amountLD, composeMsg
        // OFTComposeMsgCodec expects the 4th arg to be packed as [composeFrom (bytes32) | composeMsg]
        bytes memory composed = OFTComposeMsgCodec.encode(1, 1, amount, abi.encodePacked(bytes32(uint256(uint160(address(0)))), abi.encode(recipient)));

        // sanity: composer should hold the tokens we minted
        assertEq(token.balanceOf(address(composer)), 1000 ether);

        // call lzCompose as if the OFT contract invoked it (first param must equal OFT_IN)
        composer.lzCompose(address(oft), bytes32(uint256(1)), composed, address(0), "");

        uint256 expectedFee = (amount * 100) / 10_000;
        uint256 expectedNet = amount - expectedFee;

        // MockAave should have recorded supplies for recipient and PAYANYWAY
        assertEq(aave.supplied(recipient), expectedNet);
        assertEq(aave.supplied(PAYANYWHERE), expectedFee);
    }
}
