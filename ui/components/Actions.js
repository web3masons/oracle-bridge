import { ethers } from 'ethers';

const Block = ({ bridge }) => {
  return (
    <div className="actions">
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
          const blocks = parseInt(prompt('How many blocks to mine?', 1), 10);
          bridge.mine(blocks);
        }}
      >
        Mine
      </button>
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
      <div style={{ float: 'right' }}>
        <button
          type="button"
          onClick={() => {
            try {
              const amount = ethers.utils.parseEther(
                prompt('Enter Deposit Amount:', 0.02)
              );
              const to = prompt('Enter Receipient Address:');
              bridge.deposit(amount, to);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          Despoit
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              const amount = ethers.utils.parseEther(
                prompt('Enter Burn Amount:', 0.02)
              );
              const to = prompt('Enter Receipient Address:');
              bridge.burn(amount, to);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          Burn
        </button>
      </div>
    </div>
  );
};

export default Block;
