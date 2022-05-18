import { useEffect, useState } from 'react';

function useFetch(fetcher, {
  initialData = [],
  deps = [],
  condition = true,
  transformer = v => v
} = {}) {
  const [data, setData] = useState(initialData);
  const [isFetching, setIsFetching] = useState(condition);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    setIsFetching(true);
    try {
      const freshData = await fetcher(...deps);
      setData(transformer ? transformer(freshData) : freshData);
    } catch (e) {
      setError(e);
    } finally {
      setIsFetching(false);
    }
  };

  if (condition) {
    fetchData();
  }
}, deps);

return { data, isFetching, error };
}

export default useFetch;