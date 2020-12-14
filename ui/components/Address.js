const Address = ({ children }) => {
  if (!children) {
    return '-';
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
