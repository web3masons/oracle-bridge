import useBridge from '../hooks/useBridge';
import Action from './Action';
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
      <br />
      <button
        onClick={() => {
          bridge.mine(parseInt(prompt('How many blocks to mine?', 1)));
        }}
      >
        Mine
      </button>
      <br />
      <button onClick={() => bridge.createCheckpoint()}>Checkpoint</button>
      <br />
      <button
        onClick={() =>
          bridge.deposit(parseInt(prompt('Enter Deposit Amount', 42)))
        }
      >
        Despoit
      </button>
      <br />
      Mint:{' '}
      <input
        type="file"
        onChange={doc => {
          try {
            const file = doc.target.files[0];
            const reader = new FileReader(file);
            reader.readAsText(file);
            reader.onload = async e => {
              const parsed = await JSON.parse(e.target.result);
              if (!parsed.actionType) {
                alert('Proof format incorrect');
              }
              bridge.mint(parsed);
            };
          } catch (e) {
            console.log(e);
          }
        }}
      />
      <br />
      <button
        onClick={() => {
          bridge.burn(parseInt(prompt('Enter Burn Amount', 42)));
        }}
      >
        Burn
      </button>
      <br />
      Redeem:{' '}
      <input
        type="file"
        onChange={doc => {
          try {
            const file = doc.target.files[0];
            const reader = new FileReader(file);
            reader.readAsText(file);
            reader.onload = async e => {
              const parsed = await JSON.parse(e.target.result);
              if (!parsed.actionType) {
                alert('Proof format incorrect');
              }
              bridge.redeem(parsed);
            };
          } catch (e) {
            console.log(e);
          }
        }}
      />{' '}
      {Object.keys(bridge.actions || {}).map(id => (
        <Action key={id} action={bridge.actions[id]} bridge={bridge} />
      ))}
      <Json>{bridge}</Json>
    </div>
  );
};

export default Chain;
