import useBridge from '../hooks/useBridge';
import Action from './Action';
import ChainStatus from './ChainStatus';

const defaults = {
  chainName: 'ETC',
  color: '255,0,0',
  contractAddress: '0x78E7a0cE5DAf29fD710444a1Cb738a0f6E00ed64',
  endpoint: 'http://localhost:8545'
};

const Chain = props => {
  const { wallet, provider, ...bridge } = useBridge({ ...defaults, ...props });
  return (
    <div className="chain" style={{ background: `rgba(${bridge.color},0.1)` }}>
      <ChainStatus bridge={bridge} />
      {!bridge.initialized && (
        <>
          <button
            type="button"
            onClick={() => {
              const peer = prompt('Enter Peer Address:');
              const wrapper = prompt('Enter Wrapper Address:');
              bridge.initialize(peer, wrapper);
            }}
          >
            Initialize!
          </button>
          <br />
        </>
      )}
      <button
        type="button"
        onClick={() => {
          bridge.mine(parseInt(prompt('How many blocks to mine?', 1), 10));
        }}
      >
        Mine
      </button>
      <br />
      <button
        type="button"
        onClick={() => {
          const height = parseInt(prompt('Enter Block Number:'), 10);
          const hash = prompt('Enter Block Hash:');
          bridge.createCheckpoint(height, hash);
        }}
      >
        Checkpoint
      </button>
      <br />
      <button
        type="button"
        onClick={() => {
          const amount = parseInt(prompt('Enter Deposit Amount:', 42), 10);
          const to = prompt('Enter Receipient Address:');
          bridge.deposit(amount, to);
        }}
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
        type="button"
        onClick={() => {
          bridge.burn(parseInt(prompt('Enter Burn Amount', 42), 10));
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
    </div>
  );
};

export default Chain;
