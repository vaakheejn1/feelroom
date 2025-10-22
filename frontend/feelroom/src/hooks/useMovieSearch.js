// ===== 2. 영화 검색용 커스텀 훅 (수정) =====
// src/hooks/useMovieSearch.js
import { useState, useEffect, useCallback } from 'react';
import { moviesAPI } from '../api/movies.js';

export function useMovieSearch() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);

  // 디바운스를 위한 타이머
  const [searchTimer, setSearchTimer] = useState(null);

  // 추천 영화 로드 (인기 영화 기준)
  const loadRecommendedMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 먼저 현재 상영작 시도, 실패하면 인기 영화
      let response = await moviesAPI.getNowPlayingMovies();
      
      if (!response.success) {
        response = await moviesAPI.getAllMovies(0, 'popularity');
      }
      
      if (response.success) {
        setMovies(response.data || []);
      } else {
        console.warn('추천 영화 API 실패, 목업 데이터 사용:', response.error);
        setMovies(response.mockData || []);
      }
      
      setIsSearchMode(false);
    } catch (err) {
      console.error('추천 영화 로드 에러:', err);
      setError('추천 영화를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 영화 검색
  const searchMovies = useCallback(async (query) => {
    if (!query.trim()) {
      loadRecommendedMovies();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await moviesAPI.searchMovies(query, 0, 'movie');
      
      let newMovies = [];
      
      if (response.success) {
        // API 응답에서 movies 배열 추출
        newMovies = response.data.movies || [];
      } else {
        console.warn('검색 API 실패, 목업 데이터 사용:', response.error);
        newMovies = response.mockData?.movies || [];
      }
      
      setMovies(newMovies);
      setCurrentQuery(query);
      setIsSearchMode(true);
      
    } catch (err) {
      console.error('영화 검색 에러:', err);
      setError('영화 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [loadRecommendedMovies]);

  // 디바운스된 검색
  const debouncedSearch = useCallback((query) => {
    // 기존 타이머 취소
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // 새 타이머 설정
    const timer = setTimeout(() => {
      searchMovies(query);
    }, 300); // 300ms 디바운스

    setSearchTimer(timer);
  }, [searchMovies, searchTimer]);

  // 초기 추천 영화 로드
  useEffect(() => {
    loadRecommendedMovies();
  }, [loadRecommendedMovies]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    };
  }, [searchTimer]);

  return {
    movies,
    loading,
    error,
    isSearchMode,
    debouncedSearch,
    refresh: loadRecommendedMovies,
  };
}