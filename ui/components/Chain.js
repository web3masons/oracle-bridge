import useBridge from '../hooks/useBridge';

import ChainStatus from './ChainStatus';
import Proofs from './Proofs';
import Actions from './Actions';

const defaults = {
  chainName: 'ETC',
  color: '255,0,0',
  contractAddress: '0x78E7a0cE5DAf29fD710444a1Cb738a0f6E00ed64',
  endpoint: 'http://localhost:8545'
};

const Chain = props => {
  const bridge = useBridge({ ...defaults, ...props });
  return (
    <div
      className="chain"
      style={{
        background: `rgba(${bridge.color},0.1)`,
        border: `3px solid rgba(${bridge.color},0.4)`
      }}
    >
      <Actions bridge={bridge} />
      <ChainStatus bridge={bridge} />
      <Proofs bridge={bridge} proofs={props.proofs} />
    </div>
  );
};

export default Chain;

/*
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

      */
