import { useState } from 'react';
import { ethers } from 'ethers';
import Chain from './Chain';

const users = {
  alice: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000001'
  },
  bob: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000002'
  },
  charlie: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000003'
  },
  dave: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000004'
  },
  emma: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000005'
  },
  fred: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000006'
  },
  oracle: {
    pk: '0x0000000000000000000000000000000000000000000000000000000000000007'
  }
};

Object.keys(users).forEach(user => {
  users[user] = {
    ...users[user],
    name: user,
    addr: ethers.utils.computeAddress(users[user].pk)
  };
});

const Bridge = () => {
  const [state, setState] = useState({});

  function onProofUpdate(proof) {
    setState(p => ({
      ...p,
      [proof.id]: {
        ...p[proof.id],
        ...proof
      }
    }));
  }

  return (
    <>
      <div className="bridge">
        <Chain
          proofs={state}
          onProofUpdate={onProofUpdate}
          color="255,0,0"
          chainName="Asok"
          contractAddress="0xCa96b3113C3122d303A0720A5b00DCc313fBB423"
          endpoint="http://localhost:3333"
          // oracle, depositer, burner, withdrawer
          users={[users.oracle, users.alice, users.bob, users.charlie]}
        />
        <Chain
          proofs={state}
          onProofUpdate={onProofUpdate}
          color="0,0,255"
          chainName="Nana"
          contractAddress="0x973EDFdB5831e077534304D5Cb6074E36d57f9a6"
          endpoint="http://localhost:4444"
          // oracle, depositer, burner, withdrawer
          users={[users.oracle, users.dave, users.emma, users.fred]}
        />
      </div>
    </>
  );
};

export default Bridge;
