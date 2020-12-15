import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';

const useEthers = ({ endpoint, users }) => {
  const [state, setState] = useState();

  const provider = new useRef();
  const wallets = new useRef();

  useEffect(() => {
    provider.current = new ethers.providers.JsonRpcProvider(endpoint);
    wallets.current = users.map(
      ({ pk }) => new ethers.Wallet(pk, provider.current)
    );
    setState(p => ({ ...p, ready: true, users }));
    getBlockNumber();
  }, []);

  async function getBalance(account) {
    const balance = await provider.current.getBalance(account);
    console.log('got bal for', account);
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
    const { hash: blockHash } = await provider.current.getBlock();
    setState(p => ({ ...p, blockNumber, blockHash }));
  }

  async function mine(blocks = 1) {
    for (let i = 0; i < blocks; i++) {
      await wallets.current[0].sendTransaction({
        to: ethers.constants.AddressZero,
        value: 1
      });
      await getBlockNumber();
    }
    getBalance(users[0].addr);
  }

  return { ...state, wallets, provider, getBlockNumber, mine, getBalance };
};

export default useEthers;
