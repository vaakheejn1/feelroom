import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { moviesAPI } from '../../api/movies';
import { useSearchRecommend } from './search_recommend';
import logo from '../../assets/logo4.png';
import notificationIcon_On from '../../assets/notification_on.png';
import settingIcon from '../../assets/settingicon.png';
import img2 from '../../assets/img2.png';
import subtitle1 from '../../assets/searh_subtitle_1.png';
import subtitle2 from '../../assets/searh_subtitle_2.png';
import subtitle3 from '../../assets/searh_subtitle_3.png';
import subtitle4 from '../../assets/searh_subtitle_4.png';

// 분리된 컴포넌트들
import SearchHeader from './SearchHeader';
import SearchModal from './SearchModal';
import MovieCard from './MovieCard';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [movies, setMovies] = useState({
    recommended1: [],
    recommended2: [],
    recommended3: [],
    recommended4: []
  });
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [keywordSearchResults, setKeywordSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [keywordSearchLoading, setKeywordSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [keywordSearchError, setKeywordSearchError] = useState(null);
  const [recommendedKeywords, setRecommendedKeywords] = useState([]);
  const [currentMovies, setCurrentMovies] = useState([]);

  // 검색 모달 관련 상태
  const [activeTab, setActiveTab] = useState('MOVIE');
  const [priorityMovie, setPriorityMovie] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  // API 완료 상태 추적
  const [apiCompletionStates, setApiCompletionStates] = useState({
    movieSearch: false,
    keywordSearch: false,
    userSearch: false
  });

  // 데이터 로딩 완료 상태
  const [dataLoaded, setDataLoaded] = useState(false);

  // 추천검색어 클릭 여부 추적
  const [isRecommendedSearch, setIsRecommendedSearch] = useState(false);

  const mainContentRef = useRef(null);
  const navigate = useNavigate();

  // 추천 영화 훅 사용
  const { fetchAllRecommendedMovies } = useSearchRecommend();

  const nickname = localStorage.getItem('nickname') || '회원';

  // 검색 완료 후 스크롤 초기화 함수
  const resetScrollToTop = useCallback(() => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }, []);

  // 토큰 가져오기 함수
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }, []);

  // 키워드 기반 영화 검색 API 함수에서 데이터 처리 부분
  const searchMoviesByKeywordAPI = useCallback(async (query) => {
    if (!query.trim()) {
      setKeywordSearchResults([]);
      setApiCompletionStates(prev => ({ ...prev, keywordSearch: true }));
      return;
    }

    setKeywordSearchLoading(true);
    setKeywordSearchError(null);
    setApiCompletionStates(prev => ({ ...prev, keywordSearch: false }));

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const url = `https://i13d208.p.ssafy.io/api/v1/search/movies/keywords?query=${encodeURIComponent(query)}&page=0&size=20`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('키워드 검색에 실패했습니다.');
      }

      const data = await response.json();

      // 필터링 조건: runtime > 60, 한글 제목, voteAverage != 10.0
      const filteredMovies = data.movies.filter(movie => {
        // 1. 런닝타임 60 이하 제외
        if (movie.runtime <= 60) return false;

        // 2. 타이틀 첫글자가 영어인 것 제외 (한글만 포함)
        if (movie.title && /^[A-Za-z]/.test(movie.title.charAt(0))) return false;

        // 3. voteAverage가 10.0인 것 제외
        if (movie.voteAverage === 10.0) return false;

        return true;
      });

      // voteAverage 기준 내림차순 정렬
      const sortedMovies = filteredMovies.sort((a, b) => b.voteAverage - a.voteAverage);

      // MovieSelection 형식에 맞게 변환
      const transformedMovies = sortedMovies.map(movie => ({
        movie_id: movie.movieId,
        title: movie.title,
        poster_url: movie.posterUrl,
        ranking: 0,
        audience: 0,
        vote_average: movie.voteAverage,
        release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : '2024-01-01',
        genres: movie.genres || [],
        runtime: movie.runtime || 0
      }));

      setKeywordSearchResults(transformedMovies);
    } catch (err) {
      setKeywordSearchError(err.message);
    } finally {
      setKeywordSearchLoading(false);
      setApiCompletionStates(prev => ({ ...prev, keywordSearch: true }));
    }
  }, [getAuthToken]);

  // 사용자 검색 API 함수
  const searchUsersAPI = useCallback(async (query) => {
    if (!query.trim()) {
      setUserResults([]);
      setApiCompletionStates(prev => ({ ...prev, userSearch: true }));
      return;
    }

    setUserLoading(true);
    setUserError(null);
    setApiCompletionStates(prev => ({ ...prev, userSearch: false }));

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const url = `https://i13d208.p.ssafy.io/api/v1/search/user?query=${encodeURIComponent(query)}&page=0&size=20`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('검색 결과가 없습니다.');
      }

      const data = await response.json();

      const transformedUsers = data.users.map(user => ({
        id: user.userId,
        userImage: user.profileImageUrl,
        nickname: user.nickname || user.displayName,
        isFollowing: false
      }));

      setUserResults(transformedUsers);
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserLoading(false);
      setApiCompletionStates(prev => ({ ...prev, userSearch: true }));
    }
  }, [getAuthToken]);

  // 추천 검색어용 현재 상영작 가져오기
  const fetchRecommendedKeywords = useCallback(async () => {
    try {
      const response = await fetch('https://i13d208.p.ssafy.io/api/v1/movies/now');
      if (!response.ok) throw new Error('현재 상영작을 불러오는데 실패했습니다.');
      const data = await response.json();

      const keywords = data.slice(0, 5).map(movie => movie.title);
      setRecommendedKeywords(keywords);
      setCurrentMovies(data.slice(0, 5));
    } catch (error) {
      setRecommendedKeywords([]);
      setCurrentMovies([]);
    }
  }, []);

  // 기존 영화 검색 함수 (추천 검색어용)
  const searchMoviesAPI = useCallback(async (title) => {
    if (!title.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const url = `https://i13d208.p.ssafy.io/api/v1/search/movies?title=${encodeURIComponent(title)}&page=0&size=15`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('영화 검색에 실패했습니다.');
      }

      const data = await response.json();

      const sortedMovies = data.movies.sort((a, b) => b.voteAverage - a.voteAverage);

      const transformedMovies = sortedMovies.map(movie => ({
        id: movie.movieId,
        movie_id: movie.movieId,
        movieImage: movie.posterUrl,
        movieTitle: movie.title,
        releaseYear: movie.releaseYear ? movie.releaseYear.toString() : 'N/A',
        genres: movie.genres || [],
        runtime: movie.runtime || 0,
        userRating: movie.voteAverage ? movie.voteAverage.toFixed(1) : '0.0'
      }));

      setSearchResults(transformedMovies);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }, [getAuthToken]);

  // MovieSelection 스타일 영화 검색 함수 (일반 검색용)
  const searchMoviesMovieSelectionStyle = useCallback(async (title) => {
    if (!title.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const url = `https://i13d208.p.ssafy.io/api/v1/search/movies?title=${encodeURIComponent(title)}&page=0&size=15`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('영화 검색에 실패했습니다.');
      }

      const data = await response.json();

      // voteAverage 기준 내림차순 정렬
      const sortedMovies = data.movies.sort((a, b) => b.voteAverage - a.voteAverage);

      // MovieSelection 형식에 맞게 변환
      const transformedMovies = sortedMovies.map(movie => ({
        movie_id: movie.movieId,
        title: movie.title,
        poster_url: movie.posterUrl,
        ranking: 0,
        audience: 0,
        vote_average: movie.voteAverage,
        release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : '2024-01-01',
        genres: movie.genres || [],
        runtime: movie.runtime || 0
      }));

      setSearchResults(transformedMovies);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }, [getAuthToken]);
  // 페이지 진입 시 스크롤을 맨 위로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  // API 완료 상태 모니터링 및 스크롤 초기화
  useEffect(() => {
    const { movieSearch, keywordSearch, userSearch } = apiCompletionStates;

    if (searchTerm && (movieSearch || keywordSearch || userSearch)) {
      const timer = setTimeout(() => {
        resetScrollToTop();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [apiCompletionStates, searchTerm, resetScrollToTop]);

  // 영화 검색 완료 상태 업데이트
  useEffect(() => {
    if (!searchLoading && searchTerm) {
      setApiCompletionStates(prev => ({ ...prev, movieSearch: true }));
    } else if (searchLoading) {
      setApiCompletionStates(prev => ({ ...prev, movieSearch: false }));
    }
  }, [searchLoading, searchTerm]);

  // 키워드 검색 완료 상태 업데이트
  useEffect(() => {
    if (!keywordSearchLoading && searchTerm) {
      setApiCompletionStates(prev => ({ ...prev, keywordSearch: true }));
    } else if (keywordSearchLoading) {
      setApiCompletionStates(prev => ({ ...prev, keywordSearch: false }));
    }
  }, [keywordSearchLoading, searchTerm]);

  // 디바운싱을 위한 useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        // MOVIE 탭
        if (activeTab === 'MOVIE') {
          if (isRecommendedSearch) {
            searchMoviesAPI(searchTerm);
          } else {
            searchMoviesMovieSelectionStyle(searchTerm);
          }
        }
        // KEYWORD 탭
        else if (activeTab === 'KEYWORD') {
          searchMoviesByKeywordAPI(searchTerm);
        }
        // USER 탭
        else if (activeTab === 'USER') {
          searchUsersAPI(searchTerm);
        }
      } else {
        setSearchResults([]);
        setKeywordSearchResults([]);
        setUserResults([]);
        setPriorityMovie(null);
        setApiCompletionStates({ movieSearch: false, keywordSearch: false, userSearch: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, activeTab, searchMoviesAPI, searchMoviesMovieSelectionStyle, searchMoviesByKeywordAPI, searchUsersAPI, isRecommendedSearch]);

  // 검색어가 변경될 때 API 완료 상태 초기화
  useEffect(() => {
    if (!searchTerm) {
      setApiCompletionStates({ movieSearch: false, keywordSearch: false, userSearch: false });
      setIsRecommendedSearch(false);
    }
  }, [searchTerm]);

  // 초기 데이터 로딩
  useEffect(() => {
    let isMounted = true;

    const loadMovieData = async () => {
      if (dataLoaded) return;

      setLoading(true);

      try {
        const [recommendedMovies] = await Promise.all([
          fetchAllRecommendedMovies(),
          fetchRecommendedKeywords()
        ]);

        if (isMounted) {
          setMovies(recommendedMovies);
          setDataLoaded(true);
        }
      } catch (error) {
        if (isMounted) {
          setMovies({
            recommended1: [],
            recommended2: [],
            recommended3: [],
            recommended4: []
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMovieData();

    return () => {
      isMounted = false;
    };
  }, [fetchAllRecommendedMovies, fetchRecommendedKeywords, dataLoaded]);

  // MovieSelection 스타일 영화 클릭 핸들러
  const handleMovieSelectionStyleClick = useCallback(async (movie) => {
    try {
      const response = await moviesAPI.getMovieDetail(movie.movie_id);

      let detailData;
      if (response.success) {
        detailData = response.data;
      } else {
        console.warn('영화 상세 정보 조회 실패, 기본 정보 사용:', response.error);
        detailData = response.mockData || {};
      }

      const transformedMovieData = {
        id: movie.movie_id,
        rank: movie.ranking || 1,
        movieImage: movie.poster_url || detailData.poster_url,
        movieTitle: movie.title || detailData.title,
        releaseDate: movie.release_date || detailData.release_date || '2024-01-01',
        genres: movie.genres || detailData.genre || [],
        runtime: movie.runtime || 0,
        audienceCount: movie.audience ? `${movie.audience}명` : (detailData.audience ? `${detailData.audience}명` : "관람객수 정보 없음"),
        userRating: movie.vote_average || detailData.vote_average || 0,
        appRating: movie.vote_average || detailData.vote_average || 0,
        director: detailData.directors?.[0] || "감독 정보 없음",
        cast: detailData.actors || [],
        plot: detailData.plot_summary || "줄거리 정보가 없습니다."
      };

      navigate(`/movieDetail/${transformedMovieData.id}`, {
        state: { movieId: transformedMovieData.id, movieData: transformedMovieData }
      });
    } catch (err) {
      const fallbackData = {
        id: movie.movie_id,
        movieTitle: movie.title,
        releaseDate: movie.release_date || '2024-01-01',
        genres: movie.genres || [],
        runtime: movie.runtime || 0,
        movieImage: movie.poster_url,
        plot: "영화 정보를 불러오는데 실패했습니다.",
        userRating: movie.vote_average || 0,
        appRating: movie.vote_average || 0
      };

      navigate(`/movieDetail/${fallbackData.id}`, {
        state: { movieId: fallbackData.id, movieData: fallbackData }
      });
    }
  }, [navigate]);

  // 기존 영화 클릭 핸들러
  const handleMovieClick = useCallback(async (movie) => {
    try {
      const response = await moviesAPI.getMovieDetail(movie.movie_id || movie.movieId || movie.id);

      let detailData;
      if (response.success) {
        detailData = response.data;
      } else {
        detailData = response.mockData || {};
      }

      const transformedMovieData = {
        id: movie.movie_id || movie.movieId || movie.id,
        rank: movie.ranking || 1,
        movieImage: movie.posterUrl || movie.movieImage || detailData.poster_url,
        movieTitle: movie.title || movie.movieTitle || detailData.title,
        releaseDate: movie.release_date || `${movie.releaseYear}-01-01` || detailData.release_date || '2024-01-01',
        genres: movie.genres || detailData.genre || [],
        runtime: movie.runtime || 0,
        audienceCount: movie.audience ? `${movie.audience}명` : (detailData.audience ? `${detailData.audience}명` : "관람객수 정보 없음"),
        userRating: movie.vote_average || movie.voteAverage || parseFloat(movie.userRating) || detailData.vote_average || 0,
        appRating: movie.vote_average || movie.voteAverage || parseFloat(movie.userRating) || detailData.vote_average || 0,
        director: detailData.directors?.[0] || "감독 정보 없음",
        cast: detailData.actors || [],
        plot: detailData.plot_summary || "줄거리 정보가 없습니다."
      };

      navigate(`/movieDetail/${transformedMovieData.id}`, {
        state: { movieId: transformedMovieData.id, movieData: transformedMovieData }
      });
    } catch (err) {
      const fallbackData = {
        id: movie.movie_id || movie.movieId || movie.id,
        movieTitle: movie.title || movie.movieTitle,
        releaseDate: movie.release_date || `${movie.releaseYear}-01-01` || '2024-01-01',
        genres: movie.genres || [],
        runtime: movie.runtime || 0,
        movieImage: movie.posterUrl || movie.movieImage,
        plot: "영화 정보를 불러오는데 실패했습니다.",
        userRating: movie.vote_average || movie.voteAverage || parseFloat(movie.userRating) || 0,
        appRating: movie.vote_average || movie.voteAverage || parseFloat(movie.userRating) || 0
      };

      navigate(`/movieDetail/${fallbackData.id}`, {
        state: { movieId: fallbackData.id, movieData: fallbackData }
      });
    }
  }, [navigate]);

  // 유저 클릭 핸들러
  const handleUserClick = useCallback((user) => {
    setIsSearchMode(false);
    setSearchTerm('');
    setSearchResults([]);

    setTimeout(() => {
      navigate(`/profile/${user.id}`, {
        state: { userId: user.id, userData: user },
      });
    }, 0);
  }, [navigate]);

  // 리뷰 클릭 핸들러
  const handleReviewClick = (review) => {
    // 리뷰 클릭 처리 로직
  };

  const handleSearchFocus = useCallback(() => {
    setIsSearchMode(true);
    setIsRecommendedSearch(false); // 일반 검색 모드로 설정
  }, []);

  const handleBackToMain = useCallback(() => {
    setIsSearchMode(false);
    setSearchTerm('');
    setSearchResults([]);
    setKeywordSearchResults([]);
    setIsRecommendedSearch(false);
  }, []);

  const handleLogoClick = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!e.target.value) {
      setPriorityMovie(null);
      setApiCompletionStates({ movieSearch: false, keywordSearch: false, userSearch: false });
      setIsRecommendedSearch(false);
    }
  };

  const handleRecommendedClick = async (keyword) => {
    setSearchTerm(keyword);

    // MOVIE 탭인 경우에만 추천 검색어 모드와 우선순위 영화 처리
    if (activeTab === 'MOVIE') {
      setIsRecommendedSearch(true); // 추천 검색어 모드로 설정

      const matchedMovie = currentMovies.find(movie => movie.title === keyword);
      if (matchedMovie) {
        // 추천 검색어에서 클릭한 영화를 우선순위 영화로 설정 (더 완전한 정보 포함)
        const movieDetail = {
          id: matchedMovie.movieId,
          movie_id: matchedMovie.movieId,
          movieImage: matchedMovie.posterUrl,
          movieTitle: matchedMovie.title,
          releaseYear: matchedMovie.releaseYear ? matchedMovie.releaseYear.toString() :
            (matchedMovie.releaseDate ? new Date(matchedMovie.releaseDate).getFullYear().toString() : 'N/A'),
          genres: matchedMovie.genres || matchedMovie.genre || [],
          runtime: matchedMovie.runtime || matchedMovie.runTime || 0,
          userRating: matchedMovie.voteAverage ? matchedMovie.voteAverage.toFixed(1) :
            (matchedMovie.vote_average ? matchedMovie.vote_average.toFixed(1) : '0.0')
        };
        setPriorityMovie(movieDetail);

        // 검색 API도 호출해서 더 정확한 정보 가져오기
        try {
          const authToken = getAuthToken();
          if (authToken) {
            const url = `https://i13d208.p.ssafy.io/api/v1/search/movies?title=${encodeURIComponent(keyword)}&page=0&size=15`;
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': authToken,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();

              // 추천 검색어와 정확히 일치하는 영화를 찾기
              const exactMatch = data.movies.find(movie =>
                movie.title === keyword ||
                (movie.title.includes(keyword) && movie.movieId === matchedMovie.movieId)
              );

              if (exactMatch) {
                // 더 정확한 정보로 우선순위 영화 업데이트
                const updatedMovieDetail = {
                  id: exactMatch.movieId,
                  movie_id: exactMatch.movieId,
                  movieImage: exactMatch.posterUrl,
                  movieTitle: exactMatch.title,
                  releaseYear: exactMatch.releaseYear ? exactMatch.releaseYear.toString() : 'N/A',
                  genres: exactMatch.genres || [],
                  runtime: exactMatch.runtime || 0,
                  userRating: exactMatch.voteAverage ? exactMatch.voteAverage.toFixed(1) : '0.0'
                };
                setPriorityMovie(updatedMovieDetail);

                // 검색 결과에서 중복 제거를 위해 해당 영화를 제외한 나머지 영화들 설정
                const otherMovies = data.movies.filter(movie => movie.movieId !== exactMatch.movieId);
                const sortedOtherMovies = otherMovies.sort((a, b) => b.voteAverage - a.voteAverage);

                const transformedOtherMovies = sortedOtherMovies.map(movie => ({
                  id: movie.movieId,
                  movie_id: movie.movieId,
                  movieImage: movie.posterUrl,
                  movieTitle: movie.title,
                  releaseYear: movie.releaseYear ? movie.releaseYear.toString() : 'N/A',
                  genres: movie.genres || [],
                  runtime: movie.runtime || 0,
                  userRating: movie.voteAverage ? movie.voteAverage.toFixed(1) : '0.0'
                }));

                setSearchResults(transformedOtherMovies);
              }
            }
          }
        } catch (error) {
          // console.log('추천 검색어 API 호출 실패:', error);
          // 실패해도 기본 우선순위 영화는 유지
        }
      }
    } else {
      // KEYWORD 탭이나 USER 탭인 경우 일반 검색 모드로 설정
      setIsRecommendedSearch(false);
      setPriorityMovie(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 영화 섹션 데이터
  const movieSections = useCallback(() => [
    { label: subtitle1, data: movies.recommended1 },
    { label: subtitle2, data: movies.recommended2 },
    { label: subtitle3, data: movies.recommended3 },
    { label: subtitle4, data: movies.recommended4 }
  ], [nickname, movies]);

  // MovieSelection 스타일 별점 렌더링
  const renderStars = (vote) => {
    const rating = Math.round(vote) / 2;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half">☆</span>);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`}>✩</span>);
    }

    return stars;
  };

  return (
    <div style={{
      marginTop: '0.4rem',
      minHeight: '10vh',
      backgroundColor: '#ffffffff',
      overflowX: 'hidden'

    }}>
      {/* CSS 애니메이션 */}
      <style jsx>{`
       

        /* 가로 스크롤바 완전 제거 */
        * {
          max-width: 100%;
          box-sizing: border-box;
        }
        
        body {
          overflow-x: hidden !important;
        }
      `}</style>
      {/* 애니메이션 스타일 */}
      <style>
        {`
          @keyframes fadeInSlide {
            0% {
              opacity: 0;
              transform: translateX(-20px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>

      {/* 상단 헤더 */}
      <SearchHeader
        logo={logo}
        notificationIcon={notificationIcon_On}
        onLogoClick={handleLogoClick}
        onNotificationClick={() => navigate('/notifications')}
        onSettingsClick={() => navigate('/profile/settings')}
      />

      {/* 메인 컨텐츠 */}
      <div
        ref={mainContentRef}
        style={{
          padding: '1rem',
          maxWidth: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'

        }}
      >
        {isSearchMode ? (
          <SearchModal
            searchTerm={searchTerm}
            onInputChange={handleInputChange}
            onBackToMain={handleBackToMain}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            searchResults={searchResults}
            keywordSearchResults={keywordSearchResults}  // 이 줄 추가
            userResults={userResults}
            priorityMovie={isRecommendedSearch ? priorityMovie : null}
            searchLoading={searchLoading}
            keywordSearchLoading={keywordSearchLoading}  // 이 줄 추가
            userLoading={userLoading}
            searchError={searchError}
            keywordSearchError={keywordSearchError}      // 이 줄 추가
            userError={userError}
            recommendedKeywords={recommendedKeywords}
            onRecommendedClick={handleRecommendedClick}
            onMovieClick={isRecommendedSearch ? handleMovieClick : handleMovieSelectionStyleClick}
            onUserClick={handleUserClick}
            onReviewClick={handleReviewClick}
            isRecommendedSearch={isRecommendedSearch}
            renderStars={renderStars}
            img2={img2}
          />
        ) : (
          /* 메인 화면 */
          <div>
            {/* 검색창 */}
            <div style={{
              position: 'relative',
              marginBottom: '2rem',
              marginTop: '-0.6rem'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <SearchIcon
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: '#5e5e5eff',
                    zIndex: 1
                  }}
                />
                <input
                  type="text"
                  placeholder="영화, 키워드, 유저를 검색해보세요"
                  value={searchTerm}
                  onFocus={handleSearchFocus}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    fontSize: '16px',

                    border: '1px solid #a6a6a6ff',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    '::placeholder': {
                      color: '#0c0707ff'  // placeholder 색상
                    }
                  }}
                />
              </div>
            </div>
            <style jsx>{`
  input::placeholder {
    color: #5e5e5eff;
  }
`}</style>

            {/* 영화 섹션들 */}
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '150px',

                fontSize: '1.1rem',
              }}>
                추천영화를 불러오는 중...
              </div>
            ) : (
              movieSections().map((section, sectionIndex) => (
                <div key={`section-${sectionIndex}`}>
                  <img
                    src={section.label}
                    alt="섹션 제목"
                    style={{
                      margin: '0 0 1rem 0',
                      maxWidth: '200px',
                      height: 'auto',
                      // sectionIndex에 따라 개별 스타일 적용
                      ...(sectionIndex === 0 && {
                        maxWidth: '180px',
                        marginBottom: '-4px'
                      }),
                      ...(sectionIndex === 1 && {
                        maxWidth: '150px',
                        marginBottom: '-4px',

                      }),
                      ...(sectionIndex === 2 && {
                        maxWidth: '140px',
                        marginBottom: '-4px'
                      }),
                      ...(sectionIndex === 3 && {
                        maxWidth: '160px',
                        marginBottom: '-4px'
                      })
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '0.5rem',
                    paddingBottom: '1rem',
                    marginBottom: '-1rem',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}>
                    {section.data.length > 0 ? (
                      section.data.map((movie, movieIndex) => (
                        <MovieCard
                          key={`${section.label}-${movie.movieId || movie.id}-${movieIndex}`}
                          movie={movie}
                          index={movieIndex}
                          loading={loading}
                          onMovieClick={handleMovieClick}
                        />
                      ))
                    ) : (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#9ca3af',
                        width: '100%'
                      }}>
                        영화 데이터를 불러올 수 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

};

export default Search;