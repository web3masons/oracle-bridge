import Block from './Block';

function saveJSON(_json, name) {
  const json = JSON.stringify(_json, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: `application/json` }));
  a.download = name;
  a.click();
}

const Json = ({ children, download, fileName }) => {
  return (
    <>
      <Block>{JSON.stringify(children, null, 2)}</Block>
      {download && (
        <button
          onClick={() => {
            saveJSON(download, fileName);
          }}
        >
          Download
        </button>
      )}
    </>
  );
};

export default Json;
