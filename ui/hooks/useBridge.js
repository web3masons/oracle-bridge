import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import getProof from 'web3-proof';
import useEthers from './useEthers';

import { abi as bridgeAbi } from '../../contracts/artifacts/contracts/OracleBridge.sol/OracleBridge.json';
import { abi as wrapperAbi } from '../../contracts/artifacts/contracts/lib/ERC20Wrapper.sol/ERC20Wrapper.json';

const useBridge = props => {
  const [state = {}, setState] = useState();

  const eth = useEthers(props);

  const bridge = new useRef();
  const wrapper = new useRef();

  useEffect(() => {
    if (eth.ready) {
      bridge.current = new ethers.Contract(
        props.contractAddress,
        bridgeAbi,
        eth.provider.current
      );
      (async () => {
        const [peer, wrapperAddress] = await Promise.all([
          bridge.current.peer(),
          bridge.current.wrapper()
        ]);
        wrapper.current = new ethers.Contract(
          wrapperAddress,
          wrapperAbi,
          eth.provider.current
        );
        setState(p => ({ ...p, peer, wrapperAddress }));
        getLatestCheckpoint();
        update();
        // getTokenBalance(eth.signer);
      })();
    }
  }, [eth.ready]);

  async function getCheckpoint(_height) {
    const height = _height || state.latestCheckpoint;
    const hash = await bridge.current.checkpoints(height);
    setState(p => ({
      ...p,
      checkpoints: {
        ...p.checkpoints,
        [height]: hash
      }
    }));
  }

  async function getLatestCheckpoint() {
    const latestCheckpoint = await bridge.current.latestCheckpoint();
    setState(p => ({ ...p, latestCheckpoint }));
    getCheckpoint(latestCheckpoint);
  }

  async function getTokenBalance(account) {
    const balance = (await wrapper.current.balanceOf(account)).toNumber();
    setState(p => ({
      ...p,
      wrapperBalances: {
        ...p.wrapperBalances,
        [account]: balance
      }
    }));
  }

  async function createCheckpoint(height, hash) {
    if (!height || !hash) {
      return alert('Bad inputs!!');
    }
    await (
      await bridge.current
        .connect(eth.wallets.current[0])
        .createCheckpoint(height, hash, { gasLimit: 300000 })
    ).wait();
    getLatestCheckpoint();
    update();
  }

  async function deposit(value) {
    if (!parseInt(value)) {
      alert('Bad value');
      return;
    }
    const depositTx = await (
      await bridge.current.deposit(eth.signer, { value })
    ).wait();
    // now get the proof of the deposit...
    const {
      actionType,
      amount,
      id,
      nonce,
      receiver
    } = depositTx.events[0].args;

    props.onProofUpdate({ actionType, amount, id, nonce, receiver });
    update();
  }

  async function generateProof(id, proofBlockNumber) {
    // generate and verify the proof
    const depositProof = await getProof(
      bridge.current.address,
      id,
      proofBlockNumber,
      eth.provider.current
    );
    props.onProofUpdate({ id, ...depositProof });
  }

  async function mint(proof) {
    await (
      await bridge.current.mint(
        proof.receiver,
        [
          proof.block.number,
          proof.amount.hex,
          proof.nonce.hex,
          proof.actionType.hex
        ],
        [
          proof.blockHeaderRLP,
          proof.accountProofRLP,
          proof.storageProofsRLP[0]
        ],
        { gasLimit: 3000000 }
      )
    ).wait();
    props.onProofUdpate({ id: proof.id, consumed: true });
    update();
  }

  async function burn(value) {
    if (!parseInt(value)) {
      alert('Bad value');
      return;
    }
    const burnTx = await (await bridge.current.burn(eth.signer, value)).wait();
    // now get the proof of the burn...
    const { actionType, amount, id, nonce, receiver } = burnTx.events[1].args;
    // save the action...
    props.onProofUpdate({ actionType, amount, id, nonce, receiver });
    update();
  }

  async function redeem(proof) {
    await (
      await bridge.current.redeem(
        proof.receiver,
        [
          proof.block.number,
          proof.amount.hex,
          proof.nonce.hex,
          proof.actionType.hex
        ],
        [
          proof.blockHeaderRLP,
          proof.accountProofRLP,
          proof.storageProofsRLP[0]
        ],
        { gasLimit: 3000000 }
      )
    ).wait();
    props.onProofUdpate({ id: proof.id, consumed: true });
    // TODO
    update();
  }

  function update() {
    eth.getBlockNumber();
    Object.values(eth.users).map(({ addr }) => {
      eth.getBalance(addr);
      getTokenBalance(addr);
    });
  }

  return {
    ...props,
    ...eth,
    ...state,
    getLatestCheckpoint,
    createCheckpoint,
    deposit,
    generateProof,
    mint,
    burn,
    redeem
  };
};

export default useBridge;
