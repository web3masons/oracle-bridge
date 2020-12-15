const Address = ({ children, long }) => {
  if (!children) {
    return '-';
  }
  if (long) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: '7em',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <code>
      {children.slice(0, 5)}
      {'..'}
      {children.slice(-3)}
    </code>
  );
};

export default Address;
