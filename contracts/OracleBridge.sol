// SPDX-License-Identifier: MIT
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";

import "./lib/TrieProofs.sol";
import "./lib/ERC20Wrapper.sol";

contract OracleBridge {
    using TrieProofs for bytes;
    using RLP for RLP.RLPItem;
    using RLP for bytes;

    mapping(bytes32 => bool) public actions; // keep this at the top to be slot 0
    mapping(bytes32 => bool) public relayedActions;
    mapping(uint256 => bytes32) public checkpoints; // remote chain headers

    uint256 private constant STORAGE_SLOT_OFFSET = 0; // modify this if the actions slot changes
    uint8 private constant ACCOUNT_STORAGE_ROOT_INDEX = 2;

    address public wrapper;
    address public peer;
    uint256 public actionCounter;

    event ActionCreated(
        bytes32 indexed id,
        uint256 indexed nonce,
        uint256 actionType,
        address receiver,
        uint256 amount
    );
    
    event ActionConsumed(
        bytes32 indexed id,
        uint256 indexed nonce,
        uint256 actionType,
        address receiver,
        uint256 amount
    );

    modifier isInitialized() {
        require(peer != address(0) && wrapper != address(0), "Not isInitialized");
        _;
    }

    // set the peer address (this contract deployed on some other chain)
    // set the address of the erc20 token wrapper (could be done elsewhere)
    // the peer address will define the location of the storage to check
    function init(address _peer, address _wrapper)
        public
        returns (bool success)
    {
        if (peer != address(0) || wrapper != address(0)) {
            revert();
        }
        peer = _peer;
        wrapper = _wrapper;
        return true;
    }

    // creates a 'checkpoint' -- reporting the peer chain's hash at a given block height
    // in production, there will be logic to ensure this checkpoint is mature,
    // and of course, that trusted oracles are providing data rather than anyone
    function createCheckpoint(uint256 _height, bytes32 _hash)
        public
        returns (bool success)
    {
        checkpoints[_height] = _hash;
        return true;
    }

    // generates a unique id for each action that is used to validate the action
    function getActionId(
        uint256 _nonce,
        uint256 _type,
        address _recipient,
        uint256 _amount
    ) public pure returns (bytes32 actionId) {
        return keccak256(abi.encodePacked(_nonce, _type, _recipient, _amount));
    }

    // Methods that create actions on this chain
    // actionType = 1
    function deposit(address _recipient)
        public
        payable
        isInitialized
        returns (bytes32 actionId)
    {
        actionCounter++;
        bytes32 id = getActionId(actionCounter, 1, _recipient, msg.value);
        actions[id] = true;
        emit ActionCreated(id, actionCounter, 1, _recipient, msg.value);
        return id;
    }

    // actionType = 2
    function burn(address _recipient, uint256 _amount)
        public
        isInitialized
        returns (bytes32 actionId)
    {
        actionCounter++;
        bytes32 id = getActionId(actionCounter, 2, _recipient, _amount);
        ERC20Wrapper(wrapper).burn(msg.sender, _amount);
        actions[id] = true;
        emit ActionCreated(id, actionCounter, 2, _recipient, _amount);
        return id;
    }

    // the magic function that validates those evm proofs
    function validateProof(
        address _recipient,
        uint256[] memory _uints, // blockNumber, amount, nonce, type
        bytes[] memory _proofs, // header, accountProof, storageProof
        uint256 _expectedType
    ) private returns (bytes32) {
        require(_expectedType == _uints[3], "Incorrect Action Type");
        // pluck this for use in assembly
        bytes memory blockHeader = _proofs[0];
        // prevent from reading invalid memory
        require(blockHeader.length > 123, "Invalid Header");
        // make sure this action has not already been used
        bytes32 actionId = getActionId(
            _uints[2],
            _uints[3],
            _recipient,
            _uints[1]
        );
        // check this early to save gas
        require(!relayedActions[actionId], "Action already relayed");
        // blockHash is a hash of the block header
        bytes32 blockHash = keccak256(blockHeader);
        // ensure the block header matches the checkpoint
        require(blockHash == checkpoints[_uints[0]], "Bad Checkpoint");
        // compose the state root
        bytes32 stateRoot;
        assembly {
            stateRoot := mload(add(blockHeader, 0x7b))
        }
        // Get the account state from a merkle proof in the state trie.
        // reverts if proof is invalid
        bytes memory accountRLP = _proofs[1].verify(
            stateRoot,
            // get the account path (hash of the peer contract address)
            keccak256(abi.encodePacked(peer))
        );
        // get the storage slot; computed from the action ID
        uint256 slot = uint256(
            keccak256(abi.encodePacked(actionId, STORAGE_SLOT_OFFSET))
        );
        // Get the storage state (0 or 1), cast to boolean
        // reverts if proof is invalid
        bool valid = _proofs[2]
            .verify(
            // Extract the storage root from the account node and convert to bytes32
            bytes32(
                accountRLP.toRLPItem().toList()[ACCOUNT_STORAGE_ROOT_INDEX]
                    .toUint()
            ),
            // The path for a storage value is the hash of its slot
            keccak256(abi.encodePacked(slot))
        )
            .toRLPItem()
            .toBoolean();
        // if value is true, the other chain has this action ID
        require(valid, "Not a valid proof; state is not set");
        // now it's valid, record it's usage to ensure it's not replayed
        relayedActions[actionId] = true;
        // emit an event
        emit ActionConsumed(actionId, _uints[2], _uints[3],  _recipient, _uints[1]);
        // NOW WE CAN DO AS WE PLEASE.....
        return actionId;
    }

    // Methods that consume actions from the peer chain (require proofs)
    
    function mint(
        address _recipient,
        uint256[] memory _uints, // blockNumber, amount, nonce, type
        bytes[] memory _proofs // header, accountProof, storageProof
    )
        public
        isInitialized
        returns (bool success)
    {
        validateProof(_recipient, _uints, _proofs, 1);
        ERC20Wrapper(wrapper).mint(_recipient, _uints[1]);
        return true;
    }

    function redeem(
        address payable _recipient,
        uint256[] memory _uints, // blockNumber, amount, nonce, type
        bytes[] memory _proofs // header, accountProof, storageProof
    )
        public
        isInitialized
        returns (bool success)
    {
        validateProof(_recipient, _uints, _proofs, 2);
        _recipient.transfer(_uints[1]);
        return true;
    }
}
