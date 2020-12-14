const { default: Chain } = require('./Chain');

const Bridge = () => {
  return (
    <div className="bridge">
      <Chain />
      <Chain chainName="ETH" color="purple" />
    </div>
  );
};

export default Bridge;
