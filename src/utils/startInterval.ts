const startInterval = (callback: () => void, timeout: number): NodeJS.Timer => {
  callback();
  return setInterval(callback, timeout);
};

export default startInterval;
