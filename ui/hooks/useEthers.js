import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';

const useEthers = ({ endpoint, privateKey }) => {
  const [state, setState] = useState();

  const provider = new useRef();
  const wallet = new useRef();

  useEffect(() => {
    provider.current = new ethers.providers.JsonRpcProvider(endpoint);
    wallet.current = new ethers.Wallet(privateKey, provider.current);
    console.log(wallet.current);
    setState({ ...state, ready: true, signer: wallet.current.address });
    setTimeout(() => getBlockNumber);
  }, []);

  async function getBlockNumber() {
    setState({
      ...state,
      blockNumber: await provider.current.getBlockNumber()
    });
  }

  return { ...state, wallet, provider, getBlockNumber };
};

export default useEthers;
