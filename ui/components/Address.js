import Blockie from './Blockie';

const Address = ({ children, short }) => {
  if (!children) {
    return '-';
  }
  if (short) {
    return (
      <>
        {children.slice(2).slice(0, 3)}
        {'..'}
        {children.slice(-3)}
      </>
    );
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
        {children.slice(2)}
      </span>
    </span>
  );
};

export default Address;
