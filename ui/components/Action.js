import Address from './Address';
import Json from './Json';

const Action = ({ action, bridge }) => {
  return (
    <div style={{ border: '1px solid blue' }}>
      <h3>
        {action.proof && '✅ '}
        Action <Address>{action.id}</Address>
      </h3>
      <Json
        download={action.proof && action}
        fileName={`storage-proof-${action.id}.json`}
      >
        {{
          type: action.actionType === 1 ? 'Deposit' : 'Burn',
          amount: action.amount.toNumber(),
          receiver: action.receiver,
          proofBlockNumber: action.proof && action.block.number,
          proofBlockHash: action.proof && action.block.hash
        }}
      </Json>
      {!action.proof && (
        <button
          type="button"
          onClick={() => {
            bridge.generateProof(action.id, bridge.blockNumber - 1);
          }}
        >
          Generate Proof (block {bridge.blockNumber - 1})
        </button>
      )}
    </div>
  );
};

export default Action;
