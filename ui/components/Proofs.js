import { ethers } from 'ethers';
import Address from './Address';
import FormatBalance from './FormatBalance';

const Proofs = ({ proofs, bridge }) => {
  const relaventProofs = Object.values(proofs).filter(
    ({ chainName, proof, consumed }) => {
      if (consumed) {
        return false;
      }
      const createdHere = bridge.chainName === chainName;
      if (proof) {
        return !createdHere;
      }
      return createdHere;
    }
  );
  if (relaventProofs.length === 0) {
    return null;
  }
  return (
    <>
      <table className="proofs">
        <thead>
          <tr>
            <th>Action</th>
            <th>Type</th>
            <th>Recipient</th>
            <th>Value</th>
            <th>Block</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(relaventProofs).map(proof => {
            const { id, amount, actionType, receiver, block } = proof;
            const deposit = actionType.toNumber() === 1;
            return (
              <tr key={id}>
                <td>
                  <Address short>{id}</Address>
                </td>
                <td>{deposit ? 'Deposit' : 'Burn'}</td>
                <td>
                  <Address>{receiver}</Address>
                </td>
                <td>
                  <FormatBalance>
                    {ethers.utils.formatUnits(amount || 0, 'ether')}
                  </FormatBalance>
                </td>
                <td>
                  {(!block && '-') ||
                    `${block.number}:${block.hash.slice(2).slice(0, 4)}`}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      if (!block) {
                        bridge.generateProof(id, bridge.blockNumber);
                      } else if (deposit) {
                        bridge.mint(proof);
                      } else {
                        bridge.redeem(proof);
                      }
                    }}
                  >
                    {!block ? 'Generate Proof' : 'Consume Proof'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* <Json>{proofs}</Json> */}
    </>
  );
};

export default Proofs;
