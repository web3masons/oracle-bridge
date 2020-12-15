import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';

const useEthers = ({ endpoint, privateKey }) => {
  const [state, setState] = useState();

  const provider = new useRef();
  const wallet = new useRef();

  useEffect(() => {
    provider.current = new ethers.providers.JsonRpcProvider(endpoint);
    wallet.current = new ethers.Wallet(privateKey, provider.current);
    setState(p => ({ ...p, ready: true, signer: wallet.current.address }));
    getBlockNumber();
  }, []);

  async function getBalance(account) {
    const balance = await provider.current.getBalance(account);
    setState(p => ({
      ...p,
      balances: {
        ...p.balances,
        [account]: balance.toString()
      }
    }));
  }

  async function getBlockNumber() {
    const blockNumber = await provider.current.getBlockNumber();
    setState(p => ({ ...p, blockNumber }));
  }

  async function mine(blocks = 1) {
    for (let i = 0; i < blocks; i++) {
      await wallet.current.sendTransaction({ to: state.signer });
      await getBlockNumber();
    }
  }

  return { ...state, wallet, provider, getBlockNumber, mine };
};

export default useEthers;
