// 2. src/hooks/useFollowers.js
import { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../api/profile.js';

export function useFollowers(initialPage = 0, pageSize = 20) {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(false);

  const loadFollowers = useCallback(async (p = initialPage, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const { success, data, error: errMsg } = await profileAPI.getFollowers(p, pageSize);
      if (success) {
        const items = data.content ?? data;
        setFollowers(prev => (append ? [...prev, ...items] : items));
        setHasMore(!data.last);
        setPage(p);
      } else {
        setError(errMsg);
      }
    } catch (err) {
      console.error('내 팔로워 로드 에러:', err);
      setError('팔로워를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [initialPage, pageSize]);

  useEffect(() => {
    loadFollowers(initialPage, false);
  }, [loadFollowers]);

  const loadMore = () => {
    if (hasMore && !loading) {
      loadFollowers(page + 1, true);
    }
  };

  const refresh = () => loadFollowers(initialPage, false);

  return { followers, loading, error, hasMore, loadMore, refresh };
}
