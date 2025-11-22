// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";
import { IOFT, MessagingFee } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { ILayerZeroComposer } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroComposer.sol";
import { ILayerZeroEndpointV2 } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";

interface IStargateEndpoint {
    function endpoint() external view returns (ILayerZeroEndpointV2);
}

contract PayAnyWhereFeeComposer is ILayerZeroComposer {
    error InvalidStargatePool();
    error OnlyValidComposerCaller(address sender);
    error OnlyEndpoint(address endpoint);
    error OnlySelf(address caller);

    event PaymentReceived(address indexed recipient, uint256 amountLd);

    using SafeERC20 for IERC20;

    address public immutable OFT_IN;

    address public immutable TOKEN_IN;
    address public immutable ENDPOINT;

    address public immutable PAYANYWHERE;

    /// @notice Fee in basis points (parts per 10_000) taken from incoming composed amount.
    uint16 public immutable feeBps;

    constructor(address payAnyWhere, address _oftIn, uint16 _feeBps) {
        if (_oftIn == address(0)) revert InvalidStargatePool();
        if (_feeBps > 10_000) revert InvalidStargatePool();

        OFT_IN = _oftIn;

        TOKEN_IN = IOFT(_oftIn).token();
        ENDPOINT = address(IStargateEndpoint(_oftIn).endpoint());
        PAYANYWHERE = payAnyWhere;
        feeBps = _feeBps;
    }

    function lzCompose(
        address _sender,
        bytes32 _guid,
        bytes calldata _message,
        address,
        /* _executor */
        bytes calldata /* _extraData */
    ) external payable {
        // Authenticate call logic source.
        if (_sender != OFT_IN) revert OnlyValidComposerCaller(_sender);
        if (msg.sender != ENDPOINT) revert OnlyEndpoint(msg.sender);

        // Decode the amount in local decimals and the compose message from the message.
        uint256 amountLD = OFTComposeMsgCodec.amountLD(_message);

        // Try to decompose the message, refund if it fails.
        this.handleCompose{ value: msg.value }(_message, amountLD);
    }

    function handleCompose(bytes calldata _message, uint256 _amountLD) external payable {
        if (msg.sender != address(this)) revert OnlySelf(msg.sender);
        address _to = abi.decode(OFTComposeMsgCodec.composeMsg(_message), (address));

        // Compute fee and net amount (feeBps is in basis points, parts per 10_000)
        uint256 fee = (_amountLD * uint256(feeBps)) / 10_000;
        uint256 net = _amountLD - fee;

        // Move fees to PAYANYWHERE, then transfer remaining to recipient.
        IERC20 token = IERC20(TOKEN_IN);
        if (fee > 0) {
            token.safeTransfer(PAYANYWHERE, fee);
        }

        if (net > 0) {
            token.safeTransfer(_to, net);
        }

        emit PaymentReceived(_to, net);
    }
}
