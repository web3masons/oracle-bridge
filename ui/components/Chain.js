import useBridge from '../hooks/useBridge';
import Json from './Json';

const defaults = {
  chainName: 'ETC',
  color: 'green',
  contractAddress: '0x78E7a0cE5DAf29fD710444a1Cb738a0f6E00ed64',
  endpoint: 'http://localhost:8545',
  privateKey:
    '0x3141592653589793238462643383279502884197169399375105820974944592'
};

const Chain = props => {
  const { wallet, provider, ...bridge } = useBridge({ ...defaults, ...props });
  return (
    <div className="chain">
      <h2 style={{ color: bridge.color }}>{bridge.chainName}</h2>
      <ul>
        {/* <li>{bridge.endpoint}</li> */}
        {/* <li>Balances</li>
        <li>Contract Status</li>
        <li>Form</li>
        <li>Transactions</li>
        <li>Checkpoints</li> */}
      </ul>
      <button onClick={() => bridge.createCheckpoint()}>
        Create Checkpoint
      </button>
      <button
        onClick={() =>
          bridge.deposit(parseInt(prompt('Enter Deposit Amount', 42)))
        }
      >
        Despoit
      </button>

      <Json>{bridge}</Json>
    </div>
  );
};

export default Chain;
