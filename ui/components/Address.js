import Blockie from './Blockie';

const Address = ({ children }) => {
  if (!children) {
    return '-';
  }
  const long = children.length > 50;
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {!long && (
        <Blockie
          address={children}
          style={{ display: 'inline-block', width: '1em', height: '1em' }}
        />
      )}{' '}
      <span
        style={{
          display: 'inline-block',
          width: long ? '18em' : '7em',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {children}
      </span>
    </span>
  );
};

export default Address;
