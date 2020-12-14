import Block from './Block';

const Json = ({ children }) => {
  return <Block>{JSON.stringify(children, null, 2)}</Block>;
};

export default Json;
