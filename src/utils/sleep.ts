const sleep = (ms: number): void => {
  const start = Date.now();
  let now = start;
  while (now - start < ms) {
    now = Date.now();
  }
};

export default sleep;
