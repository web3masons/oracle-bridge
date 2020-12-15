const FormatBalance = ({ children }) => {
  if (children.length < 10) {
    return children;
  }
  return (
    <>
      {children.slice(0, 5)}
      {'..'}
      {children.slice(-3)}
    </>
  );
};

export default FormatBalance;
