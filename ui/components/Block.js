const Block = ({ children }) => {
  return (
    <pre style={{ maxWidth: '100%', overflowX: 'scroll' }}>{children}</pre>
  );
};

export default Block;
