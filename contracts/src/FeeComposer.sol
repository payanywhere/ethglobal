// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { OFTComposeMsgCodec } from "@layerzerolabs/oft-evm/contracts/libs/OFTComposeMsgCodec.sol";
import { IOFT, MessagingFee } from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import { ILayerZeroComposer } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroComposer.sol";

contract FeeComposer is ILayerZeroComposer {
    error InvalidStargatePool();
    error OnlyValidComposerCaller(address sender);
    error OnlyEndpoint(address endpoint);
    error OnlySelf(address caller);

    event Sent(bytes32 indexed guid);
    event Refunded(bytes32 indexed guid);
    event Supplied(address indexed recipient, uint256 amountLd);
    event SupplyFailedAndRefunded(address indexed recipient, uint256 amountLd);

    using SafeERC20 for IERC20;

    /// @notice LayerZero Endpoint trusted to invoke `lzCompose`.
    address public immutable ENDPOINT;

    /// @notice OFT that is authorized to trigger Aave supplies on this chain.
    address public immutable OFT_IN;

    /// @notice Underlying ERC20 token that backs the trusted Stargate OFT.
    address public immutable TOKEN_IN;

    constructor(address _oftIn) {
        if (_oftIn == address(0)) revert InvalidStargatePool();

        // Initialize the OFT address (Stargate Pool / OFT).
        OFT_IN = _oftIn;

        // Grab the underlying token from the OFT.
        TOKEN_IN = IOFT(_oftIn).token();

        // Grant a one-time unlimited allowance so Aave can pull funds during supply.
        // IERC20(TOKEN_IN).approve(address(AAVE), type(uint256).max);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // 1. Compose Logic (`lzCompose`)
    //    Called by the LayerZero Endpoint after a user sends tokens cross-chain
    //    with a compose message. Decodes the message and performs a Aave V3 supply
    //    on behalf of the original sender.

    //    Steps:
    //      1. Authenticity checks (trusted Stargate Pool & Endpoint)
    //      2. Decode recipient address and amount from `_message`
    //      3. Try to execute supply on behalf of the recipient → emit `SupplyExecuted`
    //         • On failure, refund tokens → emit `SupplyFailedAndRefunded`
    // ──────────────────────────────────────────────────────────────────────────────

    /**
     * @notice Consumes composed messages and supplies the received tokens into the Aave V3 pool.
     * @dev  `_message` is encoded by the OFT.send() caller on the source chain via
     *       `OFTComposeMsgCodec.encode()` and has the following layout:
     *
     *       ```
     *       | srcNonce (uint64) | srcEid (uint32) | amountLD (uint128) |
     *       | composeFrom (bytes32) | composeMsg (bytes) |
     *       ```
     *
     *       `composeMsg` (last field) is expected to be:
     *       `abi.encode(address onBehalfOf)`.
     *
     *
     * @param _sender     Address of the stargate contract; must equal the trusted `stargate`.
     * @dev _guid    Message hash (unused, but kept for future extensibility).
     * @param _message ABI-encoded compose payload containing recipient address.
     * @dev _executor Executor that relayed the message (unused).
     * @dev _extraData Extra data from executor (unused).
     */
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
        try this.handleCompose{ value: msg.value }(_message, amountLD) {
            emit Sent(_guid);
        } catch {
            emit Refunded(_guid);
        }
    }

    /**
     * @notice Handles the compose operation for OFT (Omnichain Fungible Token) transactions
     * @dev This function can only be called by the contract itself (self-call restriction)
     *      Decodes the compose message to extract SendParam and minimum message value
     * @param _message The original message that was sent
     * @param _amountLD The amount of tokens to supply
     */
    function handleCompose(bytes calldata _message, uint256 _amountLD) external payable {
        if (msg.sender != address(this)) revert OnlySelf(msg.sender);

        address _to = abi.decode(OFTComposeMsgCodec.composeMsg(_message), (address));

        // // Try to execute the supply or refund to target recipient.
        // try AAVE.supply(TOKEN_IN, _amountLD, _to, 0) {
        //     emit Supplied(_to, _amountLD);
        // } catch {
        //     _refund(OFT_IN, _message, _amountLD, tx.origin, msg.value);
        //     emit SupplyFailedAndRefunded(_to, _amountLD);
        // }
    }
}
