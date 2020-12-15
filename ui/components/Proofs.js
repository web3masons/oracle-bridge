import Chain from './Chain';
import Json from './Json';

const Proofs = ({ proofs }) => {
  return (
    <div className="proofs">
      <Json>{proofs}</Json>
    </div>
  );
};

export default Proofs;
