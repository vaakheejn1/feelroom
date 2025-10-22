// src/hooks/useFollowing.js
import { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../api/profile.js';

export function useFollowing(initialPage = 0, pageSize = 20) {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [page, setPage]           = useState(initialPage);
  const [hasMore, setHasMore]     = useState(false);

  const loadFollowing = useCallback(
    async (p = initialPage, append = false) => {
      setLoading(true);
      setError(null);
      try {
        const { success, data, error: errMsg } = await profileAPI.getFollowing(p, pageSize);
        if (!success) {
          setError(errMsg);
        } else {
          const items = data.content ?? data;
          setFollowing(prev => (append ? [...prev, ...items] : items));
          setHasMore(!data.last);
          setPage(p);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [initialPage, pageSize]
  );

  useEffect(() => {
    loadFollowing(initialPage, false);
  }, [initialPage, loadFollowing]);

  const loadMore = () => {
    if (hasMore && !loading) {
      loadFollowing(page + 1, true);
    }
  };

  const refresh = () => {
    loadFollowing(initialPage, false);
  };

  return { following, loading, error, hasMore, loadMore, refresh };
}

