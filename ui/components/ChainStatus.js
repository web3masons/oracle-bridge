import { ethers } from 'ethers';
import Address from './Address';
import FormatBalance from './FormatBalance';

const ChainStatus = ({ bridge }) => {
  const checks = Object.keys(bridge.checkpoints || {}).filter(c => c !== '0');
  return (
    <>
      <table>
        <tbody>
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
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Address</th>
            <th>Name</th>
            <th>{bridge.chainName} Ether</th>
            <th>Wrapped Peer Ether</th>
          </tr>
        </thead>
        <tbody>
          {bridge.users.map(user => (
            <tr key={user.addr}>
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
        </tbody>
      </table>
      {checks.length > 0 && (
        <table>
          <thead>
            <tr>
              <th colSpan={2}>Checkpoints</th>
            </tr>
          </thead>
          <tbody>
            {checks.map(c => (
              <tr key={c}>
                <td>{c}</td>
                <td>
                  <Address long>{bridge.checkpoints[c]}</Address>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default ChainStatus;
