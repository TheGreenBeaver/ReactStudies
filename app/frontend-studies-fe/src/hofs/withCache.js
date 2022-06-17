function withCache(fn, clearTimeout = 1000 * 60 * 2) {
  const cache = {};

  const cachedFn = (...args) => {
    const key = JSON.stringify(args);
    if (!(key in cache)) {
      cache[key] = fn(...args);
      setTimeout(() => {
        delete cache[key];
      }, clearTimeout);
    }
    return cache[key];
  };

  cachedFn.clear = key => {
    const toClear = key ? [key] : Object.keys(cache);
    toClear.forEach(keyToClear => {
      delete cache[keyToClear];
    });
  };

  return cachedFn;
}

export default withCache;