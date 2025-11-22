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

interface IAaveV3Pool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
}

contract PayAnyWhereFeeComposer is ILayerZeroComposer {
    error InvalidAavePool();
    error InvalidStargatePool();
    error InvalidFee(uint16 feeBps);
    error OnlyValidComposerCaller(address sender);
    error OnlyEndpoint(address endpoint);
    error OnlySelf(address caller);

    event SuppliedPaymentReceived(address indexed recipient, uint256 amountLd);
    event PaymentReceived(address indexed recipient, uint256 amountLd);
    event Sent(bytes32 indexed guid);

    using SafeERC20 for IERC20;

    address public immutable OFT_IN;
    IAaveV3Pool public immutable AAVE;

    address public immutable TOKEN_IN;
    address public immutable ENDPOINT;

    address public immutable PAYANYWHERE;

    /// @notice Fee in basis points (parts per 10_000) taken from incoming composed amount.
    uint16 public immutable feeBps;

    constructor(address payAnyWhere, address _aavePool, address _oftIn, uint16 _feeBps) {
        if (_aavePool == address(0)) revert InvalidAavePool();
        if (_oftIn == address(0)) revert InvalidStargatePool();
        if (_feeBps > 10_000) revert InvalidFee(_feeBps);

        OFT_IN = _oftIn;
        AAVE = IAaveV3Pool(_aavePool);

        TOKEN_IN = IOFT(_oftIn).token();
        ENDPOINT = address(IStargateEndpoint(_oftIn).endpoint());
        PAYANYWHERE = payAnyWhere;
        feeBps = _feeBps;

        IERC20(TOKEN_IN).approve(address(AAVE), type(uint256).max);
    }

    function lzCompose(address _sender, bytes32 _guid, bytes calldata _message, address, bytes calldata) external payable {
        if (_sender != OFT_IN) revert OnlyValidComposerCaller(_sender);
        if (msg.sender != ENDPOINT) revert OnlyEndpoint(msg.sender);

        uint256 amountLD = OFTComposeMsgCodec.amountLD(_message);

        this.handleCompose{ value: msg.value }(_message, amountLD);
        emit Sent(_guid);
    }

    function handleCompose(bytes calldata _message, uint256 _amountLD) external payable {
        if (msg.sender != address(this)) revert OnlySelf(msg.sender);
        address _to = abi.decode(OFTComposeMsgCodec.composeMsg(_message), (address));

        uint256 fee = (_amountLD * uint256(feeBps)) / 10_000;
        uint256 net = _amountLD - fee;

        IERC20 token = IERC20(TOKEN_IN);

        if (net > 0) {
            try AAVE.supply(TOKEN_IN, net, _to, 0) {
                emit SuppliedPaymentReceived(_to, net);
            } catch {
                token.safeTransfer(_to, net);
                emit PaymentReceived(_to, net);
            }
        }

        if (fee > 0) {
            try AAVE.supply(TOKEN_IN, fee, PAYANYWHERE, 0) {
                emit SuppliedPaymentReceived(PAYANYWHERE, fee);
            } catch {
                token.safeTransfer(PAYANYWHERE, fee);
                emit PaymentReceived(PAYANYWHERE, fee);
            }
        }
    }
}
