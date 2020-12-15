import makeBlockie from 'ethereum-blockies-base64';

const Blockie = ({ address, ...props }) => {
  return <img alt={address} src={makeBlockie(address)} {...props} />;
};

export default Blockie;
