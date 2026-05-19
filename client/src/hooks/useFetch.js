import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Fetches a URL via the central axios instance and tracks loading / error state.
 * Usage:  const { data, loading, error } = useFetch('/api/stay');
 */
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Track whether this component is still mounted so we don't
    // call setState after it unmounts (avoids a React warning).
    let cancelled = false;

    setLoading(true);
    setError(null);

    api.get(url)
      .then(res => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.response?.data?.error || err.message || 'Something went wrong');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
