import { useState } from 'react';
import Chain from './Chain';

import users from '../users';

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
          contractAddress="TODO"
          endpoint="http://localhost:3333"
          // oracle, depositer, burner, withdrawer
          users={[users.oracle, users.alice, users.bob, users.charlie]}
        />
        <Chain
          proofs={state}
          onProofUpdate={onProofUpdate}
          color="0,0,255"
          chainName="Nana"
          contractAddress="TODO"
          endpoint="http://localhost:4444"
          // oracle, depositer, burner, withdrawer
          users={[users.oracle, users.dave, users.emma, users.fred]}
        />
      </div>
    </>
  );
};

export default Bridge;
