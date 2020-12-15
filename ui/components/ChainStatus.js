import { ethers } from 'ethers';
import Address from './Address';
import FormatBalance from './FormatBalance';

const ChainStatus = ({ bridge }) => {
  return (
    <>
      <table>
        <tr>
          <th>Chain</th>
          <td style={{ color: `rgb(${bridge.color})`, fontWeight: 'bold' }}>
            {bridge.chainName}
          </td>
        </tr>
        <tr>
          <th>Endpoint</th>
          <td>{bridge.endpoint}</td>
        </tr>
        <tr>
          <th>Contract</th>
          <td>
            <Address long>{bridge.contractAddress}</Address>
          </td>
        </tr>
        <tr>
          <th>Wrapper</th>
          <td>
            <Address long>{bridge.wrapperAddress}</Address>
          </td>
        </tr>
        <tr>
          <th>Peer</th>
          <td>
            <Address long>{bridge.peer}</Address>
          </td>
        </tr>
        <tr>
          <th>Block</th>
          <td>{bridge.blockNumber}</td>
        </tr>
        <tr>
          <th>Block #</th>
          <td>
            <Address long>{bridge.blockHash}</Address>
          </td>
        </tr>
      </table>
      <table>
        <tr>
          <th>Address</th>
          <th>Name</th>
          <th>{bridge.chainName} Ether</th>
          <th>Wrapped Peer Ether</th>
        </tr>
        {bridge.users.map(user => (
          <tr>
            <td>
              <Address long>{user.addr}</Address>
            </td>
            <td>{user.name}</td>
            <td>
              <FormatBalance>
                {ethers.utils.formatUnits(
                  (bridge.balances || {})[user.addr] || 0,
                  'ether'
                )}
              </FormatBalance>
            </td>
            <td>
              <FormatBalance>
                {ethers.utils.formatUnits(
                  (bridge.wrapperBalances || {})[user.addr] || 0,
                  'ether'
                )}
              </FormatBalance>
            </td>
          </tr>
        ))}
      </table>
      <table>
        <th colSpan={2}>Checkpoints</th>
        {Object.keys(bridge.checkpoints || {}).map(c => (
          <tr key={c}>
            <td>{c}</td>
            <td>
              <Address long>{bridge.checkpoints[c]}</Address>
            </td>
          </tr>
        ))}
      </table>
    </>
  );
};

export default ChainStatus;
