import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import getProof from 'web3-proof';
import useEthers from './useEthers';

import { abi } from '../../contracts/artifacts/contracts/OracleBridge.sol/OracleBridge.json';

const useBridge = props => {
  const [state = {}, setState] = useState();

  const eth = useEthers(props);

  const bridge = new useRef();

  useEffect(() => {
    if (eth.ready) {
      bridge.current = new ethers.Contract(
        props.contractAddress,
        abi,
        eth.wallet.current
      );
      (async () => {
        const [peer, wrapper] = await Promise.all([
          bridge.current.peer(),
          bridge.current.wrapper()
        ]);
        setState({ ...state, peer, wrapper });
        getLatestCheckpoint();
      })();
    }
  }, [eth.ready]);

  async function getCheckpoint(_height) {
    const height = _height || state.latestCheckpoint;
    setState({
      ...state,
      checkpoints: {
        ...state.checkpoints,
        [height]: await bridge.current.checkpoints(height)
      }
    });
  }

  async function getLatestCheckpoint() {
    const latestCheckpoint = await bridge.current.latestCheckpoint();
    setState({ ...state, latestCheckpoint });
    getCheckpoint(latestCheckpoint);
  }

  async function createCheckpoint(_height, _hash) {
    const height = _height || (await eth.provider.current.getBlockNumber());
    const hash = _hash || (await eth.provider.current.getBlock(height)).hash;
    console.log(bridge.current);
    const tx = await bridge.current.createCheckpoint(height, hash);
    await tx.wait();
    getLatestCheckpoint();
  }

  async function deposit(value = 100) {
    const tx = await bridge.current.deposit(eth.signer, { value });
    const depositTx = await tx.wait();
    // now get the proof of the deposit...
    const { id: depositId, nonce: depositNonce } = depositTx.events[0].args;

    // generate proof locally
    const depositProof = await getProof(
      bridge.current.address,
      depositId,
      depositTx.blockNumber,
      eth.provider.current
    );
    console.log('got proof', depositProof);
  }

  return {
    ...props,
    ...eth,
    ...state,
    getLatestCheckpoint,
    createCheckpoint,
    deposit
  };
};

export default useBridge;
