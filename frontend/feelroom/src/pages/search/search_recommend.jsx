import { useCallback } from 'react';

// 추천 영화 관련 로직을 담당하는 훅
export const useSearchRecommend = () => {

  // 오늘 날짜를 YYYY-MM-DD 형식으로 반환
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 어제 날짜를 YYYY-MM-DD 형식으로 반환
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // 배열 섞기 함수 (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 1번째 배열: 현재 상영작 API 호출
  const fetchNowPlayingMovies = useCallback(async () => {
    try {
      const todayDate = getTodayDate();
      // let response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/now/temp/${todayDate}`);
      let response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/now/temp/2025-08-05`);  // 일단 하드코딩

      // 오늘 데이터가 없으면 어제 날짜로 재시도
      if (!response.ok) {
        const yesterdayDate = getYesterdayDate();
        response = await fetch(`https://i13d208.p.ssafy.io/api/v1/movies/now/temp/${yesterdayDate}`);
      }

      if (!response.ok) {
        throw new Error('현재 상영작 API 요청 실패');
      }

      const data = await response.json();

      // 최대 10개까지만 가져오기
      return data.slice(0, 10).map(movie => ({
        movieId: movie.movieId,
        title: movie.title,
        posterUrl: movie.posterUrl
      }));
    } catch (error) {
      console.error('현재 상영작 조회 실패:', error);
      return [];
    }
  }, []);

  // 2번째, 3번째 배열: 인기 영화 API 호출
  const fetchPopularMovies = useCallback(async (excludeIds = []) => {
    try {
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/movies/popular');

      if (!response.ok) {
        throw new Error('인기 영화 API 요청 실패');
      }

      const data = await response.json();

      // 중복 제거
      const filteredData = data.filter(movie => !excludeIds.includes(movie.movieId));

      const transformedData = filteredData.map(movie => ({
        movieId: movie.movieId,
        title: movie.title,
        posterUrl: movie.posterUrl
      }));

      // 반으로 나누기
      const midIndex = Math.ceil(transformedData.length / 2);
      return {
        firstHalf: transformedData.slice(0, midIndex),
        secondHalf: transformedData.slice(midIndex)
      };
    } catch (error) {
      console.error('인기 영화 조회 실패:', error);
      return {
        firstHalf: [],
        secondHalf: []
      };
    }
  }, []);

  // 4번째 배열: 온보딩 영화 API 호출 (랜덤 순서)
  const fetchOnboardingMovies = useCallback(async (excludeIds = []) => {
    try {
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/movies/onboarding?limit=30');

      if (!response.ok) {
        throw new Error('온보딩 영화 API 요청 실패');
      }

      const data = await response.json();

      // 중복 제거
      const filteredData = data.filter(movie => !excludeIds.includes(movie.movieId));

      // 랜덤 순서로 섞기
      const shuffledData = shuffleArray(filteredData);

      // 최대 10개까지만 가져오기
      return shuffledData.slice(0, 10).map(movie => ({
        movieId: movie.movieId,
        title: movie.title,
        posterUrl: movie.posterUrl,
        genres: movie.genres
      }));
    } catch (error) {
      console.error('온보딩 영화 조회 실패:', error);
      return [];
    }
  }, []);

  // 모든 추천 영화 데이터를 가져오는 메인 함수
  const fetchAllRecommendedMovies = useCallback(async () => {
    try {
      // 1번째 배열: 현재 상영작
      const nowPlayingMovies = await fetchNowPlayingMovies();
      const usedIds = nowPlayingMovies.map(movie => movie.movieId);

      // 2번째, 3번째 배열: 인기 영화 (중복 제외)
      const { firstHalf: popularFirst, secondHalf: popularSecond } = await fetchPopularMovies(usedIds);

      // 사용된 ID 업데이트
      const popularIds = [...popularFirst, ...popularSecond].map(movie => movie.movieId);
      const allUsedIds = [...usedIds, ...popularIds];

      // 4번째 배열: 온보딩 영화 (중복 제외, 랜덤)
      const onboardingMovies = await fetchOnboardingMovies(allUsedIds);

      return {
        recommended1: nowPlayingMovies,
        recommended2: popularFirst,
        recommended3: popularSecond,
        recommended4: onboardingMovies
      };
    } catch (error) {
      console.error('추천 영화 데이터 조회 실패:', error);
      return {
        recommended1: [],
        recommended2: [],
        recommended3: [],
        recommended4: []
      };
    }
  }, [fetchNowPlayingMovies, fetchPopularMovies, fetchOnboardingMovies]);

  return {
    fetchAllRecommendedMovies
  };
};

export default useSearchRecommend;